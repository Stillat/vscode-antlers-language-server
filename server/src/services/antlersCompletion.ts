import {
    CompletionItem,
    TextDocumentPositionParams,
} from "vscode-languageserver-protocol";
import { sessionDocuments } from '../languageService/documents';
import ProjectManager from '../projects/projectManager';
import { makeProviderRequest } from "../providers/providerParameters";
import SnippetsManager from "../suggestions/snippets/snippetsManager";
import { SuggestionManager } from "../suggestions/suggestionManager";

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

    const suggestionRequest = makeProviderRequest(
        _textDocumentPosition.position,
        docPath
    ),
        globalSnippets = SnippetsManager.instance?.getSnippets(suggestionRequest) ?? [];
    let suggestions = SuggestionManager.getSuggestions(suggestionRequest);

    if (suggestionRequest == null) {
        return [];
    }

    if (
        globalSnippets.length > 0 &&
        (suggestionRequest.isInDoubleBraces == false ||
            suggestionRequest.nodesInScope.length == 0)
    ) {
        suggestions = suggestions.concat(globalSnippets);
    }

    const returnedItems: string[] = [];

    return suggestions.filter((item) => {
        if (returnedItems.includes(item.label)) {
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
