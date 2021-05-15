import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';
import { exclusiveResult, ICompletionResult, IParameterAttribute } from '../antlers/tagManager';
import { getParameterArrayValue } from '../antlers/tags/parameterFetcher';

export function getUniqueParameterArrayValuesSuggestions(paramAttribute: IParameterAttribute, allValues: string[]): ICompletionResult {
	const items: CompletionItem[] = [],
		paramValues: string[] = getParameterArrayValue(paramAttribute),
		valuesToUse = allValues.filter(e => !paramValues.includes(e));

	for (let i = 0; i < valuesToUse.length; i++) {
		items.push({
			label: valuesToUse[i],
			kind: CompletionItemKind.Variable
		});
	}

	return exclusiveResult(items);
}
