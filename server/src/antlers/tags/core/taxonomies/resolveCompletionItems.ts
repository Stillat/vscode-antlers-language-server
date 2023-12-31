import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';
import { getConditionCompletionItems } from '../../../../suggestions/defaults/conditionItems.js';
import { getRoot } from '../../../../suggestions/suggestionManager.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { EmptyCompletionResult, exclusiveResult, ICompletionResult, nonExclusiveResult } from '../../../tagManager.js';
import { getTaxonomyNames } from './utils.js';

export function resolveTaxonomyCompletions(params: ISuggestionRequest): ICompletionResult {
    const items: CompletionItem[] = [];

    if (params.currentNode != null && params.currentNode.currentScope != null) {
        const taxonomyNames = getTaxonomyNames(params.currentNode, params.project),
            blueprintFields = params.project.getTaxonomyBlueprintFields(taxonomyNames),
            fieldNames = blueprintFields.map((f) => f.name),
            rootLeft = getRoot(params.leftWord);

        if (fieldNames.includes(rootLeft)) {
            return exclusiveResult(getConditionCompletionItems(params));
        }

        if (params.isCaretInTag && !params.context?.interpolatedContext && ['taxonomy', '/taxonomy'].includes(params.leftWord) == false) {
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

            if (items.length > 0) {
                return nonExclusiveResult(items);
            }
        }
    }

    if ((params.leftWord == 'taxonomy' || params.leftWord == '/taxonomy') && params.leftChar == ':') {
        const taxonomyNames = params.project.getUniqueTaxonomyNames();

        for (let i = 0; i < taxonomyNames.length; i++) {
            items.push({
                label: taxonomyNames[i],
                kind: CompletionItemKind.Field
            });
        }

        return nonExclusiveResult(items);
    }

    return EmptyCompletionResult;
}
