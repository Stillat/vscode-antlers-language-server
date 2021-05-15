import { Range } from 'vscode-languageserver-textdocument';
import { CompletionItem, CompletionItemKind, InsertTextFormat, InsertTextMode, TextEdit } from 'vscode-languageserver-types';
import { IAntlersParameter } from '../antlers/tagManager';
import { ISuggestionRequest } from './suggestionManager';

export function makeTagParameterSuggestions(request: ISuggestionRequest, parameters: IAntlersParameter[]): CompletionItem[] {
	const paramSuggestions: CompletionItem[] = [];

	if (request.currentSymbol == null) {
		return paramSuggestions;
	}

	// Construct a document range.
	const range: Range = {
		start: {
			line: request.position.line,
			character: request.position.character - 0
		},
		end: request.position
	};

	for (let i = 0; i < parameters.length; i++) {
		const curParam = parameters[i];

		// Check if the tag already includes the parameter. If so, we ignore it.
		if (!request.currentSymbol.existingParamNames.includes(curParam.name)) {
			const paramSnippet = curParam.name + '="$1"';

			paramSuggestions.push({
				label: curParam.name,
				kind: CompletionItemKind.Value,
				insertTextFormat: InsertTextFormat.Snippet,
				textEdit: TextEdit.replace(range, paramSnippet),
				command: {
					title: 'Suggest',
					command: 'editor.action.triggerSuggest'
				}
			});
		}
	}

	return paramSuggestions;
}
