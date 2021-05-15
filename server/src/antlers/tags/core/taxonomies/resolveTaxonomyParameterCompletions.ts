import { getConditionCompletionItems } from '../../../../suggestions/defaults/conditionItems';
import { getRoot, ISuggestionRequest } from '../../../../suggestions/suggestionManager';
import { exclusiveResult, IAntlersParameter, ICompletionResult } from '../../../tagManager';
import { getParameterArrayValue } from '../../parameterFetcher';
import { makeCollectionNameSuggestions, makeQueryScopeSuggestions } from '../collection/utils';
import { getTaxonomyNames, makeTaxonomyNameSuggestions } from './utils';

const SourceTaxonomyParams: string[] = ['from', 'taxonomy', 'is', 'use', 'folder'];
const ExcludeTaxonomyParams: string[] = ['not_from', 'not_in', 'dont_use', 'not_taxonomy'];

export { SourceTaxonomyParams, ExcludeTaxonomyParams };

let AllSourceParams: string[] = SourceTaxonomyParams;

AllSourceParams = AllSourceParams.concat(ExcludeTaxonomyParams);

export function resolveTaxonomyParameterCompletions(parameter: IAntlersParameter, params: ISuggestionRequest): ICompletionResult | null {
	if (params.symbolsInScope.length > 0) {
		const lastSymbolInScope = params.symbolsInScope[params.symbolsInScope.length - 1];

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
		return exclusiveResult(makeCollectionNameSuggestions(getParameterArrayValue(params.activeParameter), params.project));
	}

	if (parameter.name == 'filter' || parameter.name == 'query_scope') {
		return exclusiveResult(makeQueryScopeSuggestions(params.project));
	}

	if (AllSourceParams.includes(parameter.name)) {
		return exclusiveResult(makeTaxonomyNameSuggestions(getParameterArrayValue(params.activeParameter), params.project));
	}

	return null;
}
