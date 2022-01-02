import { CompletionItemKind } from 'vscode-languageserver';
import { CompletionItem } from 'vscode-languageserver-types';
import { getConditionCompletionItems } from '../../../../suggestions/defaults/conditionItems';
import { getRoot } from '../../../../suggestions/suggestionManager';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { exclusiveResult, nonExclusiveResult, EmptyCompletionResult, ICompletionResult } from '../../../tagManager';
import { getCollectionBlueprintFields, getTaxonomyCompletionItems } from './utils';

export function resolveCollectionCompletions(params: ISuggestionRequest): ICompletionResult {
	let items: CompletionItem[] = [];

	if (params.isPastTagPart == false && (params.leftWord == 'collection' || params.leftWord == '/collection') && params.leftChar == ':') {
		const collectionNames = params.project.getCollectionNames();

		for (let i = 0; i < collectionNames.length; i++) {
			items.push({
				label: collectionNames[i],
				kind: CompletionItemKind.Field,
				sortText: '0'
			});
		}

		items.push({ label: 'count', kind: CompletionItemKind.Text, sortText: '1' });
		items.push({ label: 'next', kind: CompletionItemKind.Text, sortText: '1' });
		items.push({ label: 'previous', kind: CompletionItemKind.Text, sortText: '1' });
		items.push({ label: 'older', kind: CompletionItemKind.Text, sortText: '1' });
		items.push({ label: 'newer', kind: CompletionItemKind.Text, sortText: '1' });

		return {
			items: items,
			analyzeDefaults: false,
			isExclusiveResult: false,
		};
	}

	if (params.currentNode != null && params.currentNode.currentScope != null) {
		const blueprintFields = getCollectionBlueprintFields(params.currentNode, params.currentNode.currentScope),
			fieldNames = blueprintFields.map((f) => f.name),
			rootLeft = getRoot(params.leftWord);

		if (rootLeft === 'taxonomy') {
			return exclusiveResult(getTaxonomyCompletionItems(params));
		}

		if (fieldNames.includes(rootLeft)) {
			items = getConditionCompletionItems(params);

			return exclusiveResult(items);
		}

		if (params.isCaretInTag && !params.context?.isInParameter &&
			['collection', '/collection'].includes(params.leftWord) == false &&
			params.leftChar != ' ') {
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

	return EmptyCompletionResult;
}
