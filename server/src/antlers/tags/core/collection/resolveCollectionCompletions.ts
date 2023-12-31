import { CompletionItemKind } from 'vscode-languageserver';
import { CompletionItem } from 'vscode-languageserver-types';
import { getConditionCompletionItems } from '../../../../suggestions/defaults/conditionItems.js';
import { getRoot } from '../../../../suggestions/suggestionManager.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { tagToCompletionItem } from '../../../documentedLabel.js';
import { exclusiveResult, nonExclusiveResult, EmptyCompletionResult, ICompletionResult } from '../../../tagManager.js';
import { CollectionNewer, CollectionOlder } from './ageDirectional.js';
import CollectionCount from './count.js';
import CollectionNext from './next.js';
import CollectionPrevious from './previous.js';
import { getCollectionBlueprintFields, getTaxonomyCompletionItems } from './utils.js';

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

        items.push(tagToCompletionItem(CollectionCount));
        items.push(tagToCompletionItem(CollectionNext));
        items.push(tagToCompletionItem(CollectionPrevious));
        items.push(tagToCompletionItem(CollectionOlder));
        items.push(tagToCompletionItem(CollectionNewer));

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
