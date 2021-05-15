import { CompletionItem, TextDocumentPositionParams } from 'vscode-languageserver-protocol';
import { makeProviderRequest } from '../providers/providerParameters';
import { currentStructure, parserInstances } from '../session';
import { SnippetsManager } from '../suggestions/snippets/snippetsManager';
import { SuggestionManager } from '../suggestions/suggestionManager';

interface ICompletionDetail {
	detail: string,
	docs: string
}

const fieldMap: Map<number, ICompletionDetail> = new Map();

export function handleOnCompletion(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] {
	if (currentStructure == null) {
		return [];
	}

	const docPath = decodeURIComponent(_textDocumentPosition.textDocument.uri);

	if (parserInstances.has(docPath) == false) {
		return [];
	}

	const suggestionRequest = makeProviderRequest(_textDocumentPosition.position, docPath),
		globalSnippets = SnippetsManager.getSnippets(suggestionRequest);
	let suggestions = SuggestionManager.getSuggestions(suggestionRequest);

	if (globalSnippets.length > 0 && (
		suggestionRequest.isInDoubleBraces == false ||
		suggestionRequest.symbolsInScope.length == 0
	)) {
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
