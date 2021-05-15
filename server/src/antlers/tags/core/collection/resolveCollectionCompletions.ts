import { CompletionItemKind } from 'vscode-languageserver';
import { CompletionItem } from 'vscode-languageserver-types';
import { getConditionCompletionItems } from '../../../../suggestions/defaults/conditionItems';
import { getRoot, ISuggestionRequest } from '../../../../suggestions/suggestionManager';
import { exclusiveResult, nonExclusiveResult, EmptyCompletionResult, ICompletionResult } from '../../../tagManager';
import { getCollectionBlueprintFields, getTaxonomyCompletionItems } from './utils';

export function resolveCollectionCompletions(params: ISuggestionRequest): ICompletionResult {
	let items: CompletionItem[] = [];

	if (params.currentSymbol != null && params.currentSymbol.currentScope != null) {
		const blueprintFields = getCollectionBlueprintFields(params.currentSymbol, params.currentSymbol.currentScope),
			fieldNames = blueprintFields.map((f) => f.name),
			rootLeft = getRoot(params.leftWord);

		if (rootLeft === 'taxonomy') {
			return exclusiveResult(getTaxonomyCompletionItems(params));
		}

		if (fieldNames.includes(rootLeft)) {
			items = getConditionCompletionItems(params);

			return exclusiveResult(items);
		}

		if (params.isCaretInTag && params.activeParameter == null && ['collection', '/collection'].includes(params.leftWord) == false) {
			const addedNames: string[] = [];

			for (let i = 0; i < blueprintFields.length; i++) {
				const thisField = blueprintFields[i];

				if (addedNames.includes(thisField.name) == false) {
					items.push({
						label: thisField.name,
						detail: thisField.blueprintName,
						documentation: thisField.instructionText ?? '',
						kind: CompletionItemKind.Field
					});

					addedNames.push(thisField.name);
				}
			}

			items.push({
				label: 'taxonomy',
				insertText: 'taxonomy:',
				kind: CompletionItemKind.Field
			});

			items.push({
				label: 'status',
				insertText: 'status:',
				kind: CompletionItemKind.Field
			});

			if (items.length > 0) {
				return nonExclusiveResult(items);
			}
		}
	}

	if (params.isPastTagPart == false && (params.leftWord == 'collection' || params.leftWord == '/collection') && params.leftChar == ':') {
		for (let i = 0; i < params.project.collectionNames.length; i++) {
			items.push({
				label: params.project.collectionNames[i],
				kind: CompletionItemKind.Field
			});
		}

		items.push({ label: 'count', kind: CompletionItemKind.Text });
		items.push({ label: 'next', kind: CompletionItemKind.Text });
		items.push({ label: 'previous', kind: CompletionItemKind.Text });
		items.push({ label: 'older', kind: CompletionItemKind.Text });
		items.push({ label: 'newer', kind: CompletionItemKind.Text });

		return {
			items: items,
			analyzeDefaults: false,
			isExclusiveResult: false,
		};
	}

	return EmptyCompletionResult;
}
