import { getConditionCompletionItems } from '../../../../suggestions/defaults/conditionItems.js';
import { getAbsoluteRoot, getRoot } from '../../../../suggestions/suggestionManager.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { exclusiveResult, IAntlersParameter, ICompletionResult } from '../../../tagManager.js';
import { makeCollectionNameSuggestions, makeStatusSuggestions, makeQueryScopeSuggestions, makeTaxonomySuggestions, makeSingleCollectionNameSuggestions, getCollectionBlueprintFields } from './utils.js';

const collectionParamNames: string[] = [
    'from', 'folder', 'use', 'not_from', 'not_folder'
];

const singleCollectionTagActivators: string[] = ['previous', 'next'];
const singleCollectionParamNames: string[] = [
    'in', 'collection'
];

export function resolveCollectionParameterCompletiontems(parameter: IAntlersParameter, params: ISuggestionRequest): ICompletionResult | null {
    if (parameter.isDynamic) {
        const checkName = getAbsoluteRoot(parameter.name);

        if (params.nodesInScope.length > 0) {
            const lastSymbolInScope = params.nodesInScope[params.nodesInScope.length - 1];

            if (lastSymbolInScope != null && lastSymbolInScope.currentScope != null) {
                const blueprintFields = getCollectionBlueprintFields(lastSymbolInScope, lastSymbolInScope.currentScope),
                    fieldNames = blueprintFields.map((f) => f.name),
                    rootLeft = getRoot(params.leftWord);


                if (fieldNames.includes(rootLeft)) {
                    return exclusiveResult(getConditionCompletionItems(params));
                }
            }
        }

        if (checkName == 'status') {
            if (params.context?.parameterContext != null) {
                return exclusiveResult(makeStatusSuggestions(params.context.parameterContext.parameter?.getArrayValue() ?? []));
            }
        }

        if (checkName == 'taxonomy') {
            const taxonomyName = getRoot(parameter.name);

            if (params.project.hasTaxonomy(taxonomyName)) {
                if (params.context?.parameterContext != null) {
                    return exclusiveResult(makeTaxonomySuggestions(params.context.parameterContext.parameter?.getArrayValue() ?? [], taxonomyName, params.project));
                }
            }
        }
    }

    if (parameter.name == 'filter' || parameter.name == 'query_scope') {
        return exclusiveResult(makeQueryScopeSuggestions(params.project));
    }

    if (params.nodesInScope.length > 0) {
        const lastSymbolInScope = params.nodesInScope[params.nodesInScope.length - 1];

        if (lastSymbolInScope.hasMethodPart()) {
            if (singleCollectionTagActivators.includes(lastSymbolInScope.getMethodNameValue())) {
                if (singleCollectionParamNames.includes(parameter.name)) {
                    return exclusiveResult(makeSingleCollectionNameSuggestions(params.project));
                }
            }
        }
    }

    if (collectionParamNames.includes(parameter.name)) {
        if (params.context?.parameterContext != null) {
            return exclusiveResult(makeCollectionNameSuggestions(params.context?.parameterContext.parameter?.getArrayValue() ?? [], params.project));
        }
    }

    return null;
}
