import { getConditionCompletionItems } from '../../../../suggestions/defaults/conditionItems';
import { getRoot } from '../../../../suggestions/suggestionManager';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { exclusiveResult, IAntlersParameter, ICompletionResult } from '../../../tagManager';
import { makeCollectionNameSuggestions, makeQueryScopeSuggestions } from '../collection/utils';
import { getTaxonomyNames, makeTaxonomyNameSuggestions } from './utils';

const SourceTaxonomyParams: string[] = ['from', 'taxonomy', 'is', 'use', 'folder'];
const ExcludeTaxonomyParams: string[] = ['not_from', 'not_in', 'dont_use', 'not_taxonomy'];

export { SourceTaxonomyParams, ExcludeTaxonomyParams };

let AllSourceParams: string[] = SourceTaxonomyParams;

AllSourceParams = AllSourceParams.concat(ExcludeTaxonomyParams);

export function resolveTaxonomyParameterCompletions(parameter: IAntlersParameter, params: ISuggestionRequest): ICompletionResult | null {
    if (params.nodesInScope.length > 0) {
        const lastSymbolInScope = params.nodesInScope[params.nodesInScope.length - 1];

        if (lastSymbolInScope != null && lastSymbolInScope.currentScope != null) {
            const taxonomyNames = getTaxonomyNames(lastSymbolInScope, params.project),
                blueprintFields = params.project.getTaxonomyBlueprintFields(taxonomyNames),
                fieldNames = blueprintFields.map((f) => f.name),
                rootLeft = getRoot(params.leftWord);

            if (fieldNames.includes(rootLeft)) {
                return exclusiveResult(getConditionCompletionItems(params));
            }
        }
    }

    if (parameter.name == 'collection') {
        if (params.context?.parameterContext != null) {
            return exclusiveResult(makeCollectionNameSuggestions(params.context?.parameterContext.parameter?.getArrayValue() ?? [], params.project));
        }
    }

    if (parameter.name == 'filter' || parameter.name == 'query_scope') {
        return exclusiveResult(makeQueryScopeSuggestions(params.project));
    }

    if (AllSourceParams.includes(parameter.name)) {
        if (params.context?.parameterContext != null) {
            return exclusiveResult(makeTaxonomyNameSuggestions(params.context?.parameterContext.parameter?.getArrayValue() ?? [], params.project));
        }
    }

    return null;
}
