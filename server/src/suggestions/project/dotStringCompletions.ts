import { CompletionItemKind } from 'vscode-languageserver';
import { CompletionItem } from 'vscode-languageserver-types';

export function createSuggestionsFromDotStrings(currentValue: string, values: string[]): CompletionItem[] {
	const items: CompletionItem[] = [];
	let valuesToSuggest = values;

	if (currentValue.trim().length > 0) {
		if (currentValue.includes('.')) {
			if (currentValue.endsWith('.')) {
				const testValue = currentValue.substr(0, currentValue.length - 1);

				valuesToSuggest = valuesToSuggest.filter(e => e.startsWith(testValue));
			}
		}
	}

	for (let i = 0; i < valuesToSuggest.length; i++) {
		let insertText = valuesToSuggest[i],
			doAdd = true;

		if (currentValue.includes('.')) {
			if (insertText.startsWith(currentValue) == false) {
				doAdd = false;
			} else {
				insertText = insertText.substr(currentValue.length);
			}
		}

		if (doAdd) {
			items.push({
				label: insertText,
				insertText: insertText,
				kind: CompletionItemKind.Text
			});
		}
	}
	return items;
}
