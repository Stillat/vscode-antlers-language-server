import {
    CompletionItem,
    TextDocumentPositionParams,
} from "vscode-languageserver-protocol";
import { sessionDocuments } from '../languageService/documents.js';
import ProjectManager from '../projects/projectManager.js';
import { makeProviderRequest } from "../providers/providerParameters.js";
import { globalSettings } from '../server.js';
import SnippetsManager from "../suggestions/snippets/snippetsManager.js";
import { SuggestionManager } from "../suggestions/suggestionManager.js";

interface ICompletionDetail {
    detail: string;
    docs: string;
}

const fieldMap: Map<number, ICompletionDetail> = new Map();

export function handleOnCompletion(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] {
    if (ProjectManager.instance?.hasStructure() == false) {
        return [];
    }

    sessionDocuments.refreshDocumentState();

    const docPath = decodeURIComponent(_textDocumentPosition.textDocument.uri);

    if (sessionDocuments.hasDocument(docPath) == false) {
        return [];
    }

    const suggestionRequest = makeProviderRequest(_textDocumentPosition.position, docPath, globalSettings.showGeneralSnippetCompletions);

    if (suggestionRequest == null) {
        return [];
    }

    // Return empty completions when inside front matter.
    if (suggestionRequest.hasFrontMatter && suggestionRequest.frontMatterEndsOn > -1) {
        if (suggestionRequest.position.line < suggestionRequest.frontMatterEndsOn) {
            return [];
        }
    }

    let suggestions = SuggestionManager.getSuggestions(suggestionRequest);

    const returnedItems: string[] = [];

    return suggestions.filter((item) => {
        if (returnedItems.includes(item.label)) {
            return false;
        }

        if (! item.label) {
            return false;
        }

        returnedItems.push(item.label);

        return true;
    });
}

export function handleOnCompletionResolve(item: CompletionItem): CompletionItem {
    if (fieldMap.has(item.data)) {
        const resolvedData = fieldMap.get(item.data);

        if (resolvedData != null) {
            item.detail = resolvedData.detail;
            item.documentation = resolvedData.docs;
        }
    }
    return item;
}
