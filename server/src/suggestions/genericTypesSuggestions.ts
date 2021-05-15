import { InsertTextFormat, CompletionItemKind, TextEdit, Range } from 'vscode-languageserver';
import { CompletionItem, MarkupKind } from 'vscode-languageserver-types';
import { ModifierManager } from '../antlers/modifierManager';
import { IScopeVariable } from '../antlers/scope/engine';
import { ISuggestionRequest } from './suggestionManager';

export class GenericTypesSuggestions {

	static getCompletions(params: ISuggestionRequest, scopeVariable: IScopeVariable): CompletionItem[] {
		const items: CompletionItem[] = [];
		let replaceOffset = 0;

		if (params.leftWord != params.leftMeaningfulWord) {
			replaceOffset = params.leftWord.length;
		}

		const range: Range = {
			start: {
				line: params.position.line,
				character: params.position.character - replaceOffset
			},
			end: params.position
		};

		ModifierManager.getModifiersForType(scopeVariable.dataType).filter((m) => {
			return m.canBeParameter;
		}).forEach((modifier) => {
			items.push({
				label: modifier.name,
				documentation: {
					kind: MarkupKind.Markdown,
					value: modifier.description
				},
				insertTextFormat: InsertTextFormat.Snippet,
				kind: CompletionItemKind.Value,
				textEdit: TextEdit.replace(range, modifier.name + '="$1" '),
				command: {
					title: 'Suggest',
					command: 'editor.action.triggerSuggest'
				}
			});
		});

		return items;
	}

}
