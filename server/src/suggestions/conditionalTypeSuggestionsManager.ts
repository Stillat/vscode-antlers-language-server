import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';
import { ConditionalTokenType } from '../antlers/conditionParser';
import { IOperandContext } from '../antlers/conditionSearcher';
import { ISuggestionRequest } from './suggestionManager';

export class ConditionalTypeSuggestionsManager {

	static getCompletionItems(params: ISuggestionRequest, context: IOperandContext): CompletionItem[] {
		const items: CompletionItem[] = [];

		if (context.operator != null && context.operator.type == ConditionalTokenType.EqualityComparison) {
			if (context.leftOperand != null &&
				context.leftOperand.context != null &&
				context.leftOperand.context != null &&
				context.leftOperand.context.reference != null) {
				const source = context.leftOperand.context.reference.sourceName;

				if (source == '*internal.bard' || source == '*internal.replicator') {
					if (context.leftOperand.context.reference.introducedBy != null &&
						context.leftOperand.context.reference.introducedBy.scopeVariable != null &&
						context.leftOperand.context.reference.introducedBy.scopeVariable.sourceField != null) {
						const fieldReference = context.leftOperand.context.reference.introducedBy.scopeVariable.sourceField;

						if (fieldReference.sets != null && fieldReference.sets.length > 0) {
							for (let i = 0; i < fieldReference.sets.length; i++) {
								items.push({
									label: fieldReference.sets[i].handle,
									detail: fieldReference.blueprintName,
									documentation: fieldReference.instructionText ?? '',
									kind: CompletionItemKind.EnumMember
								});
							}
						}
					}
				}
			}
		}

		return items;
	}

}
