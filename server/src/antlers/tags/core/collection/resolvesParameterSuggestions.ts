import { getConditionCompletionItems } from '../../../../suggestions/defaults/conditionItems';
import { getAbsoluteRoot, getRoot, ISuggestionRequest } from '../../../../suggestions/suggestionManager';
import { exclusiveResult, IAntlersParameter, ICompletionResult } from '../../../tagManager';
import { getParameterArrayValue } from '../../parameterFetcher';
import { makeCollectionNameSuggestions, makeStatusSuggestions, makeQueryScopeSuggestions, makeTaxonomySuggestions, makeSingleCollectionNameSuggestions, getCollectionBlueprintFields } from './utils';

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

		if (params.symbolsInScope.length > 0) {
			const lastSymbolInScope = params.symbolsInScope[params.symbolsInScope.length - 1];

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
			return exclusiveResult(makeStatusSuggestions(getParameterArrayValue(params.activeParameter)));
		}

		if (checkName == 'taxonomy') {
			const taxonomyName = getRoot(parameter.name);

			if (params.project.hasTaxonomy(taxonomyName)) {
				return exclusiveResult(makeTaxonomySuggestions(getParameterArrayValue(params.activeParameter), taxonomyName, params.project));
			}
		}
	}

	if (parameter.name == 'filter' || parameter.name == 'query_scope') {
		return exclusiveResult(makeQueryScopeSuggestions(params.project));
	}

	if (params.symbolsInScope.length > 0) {
		const lastSymbolInScope = params.symbolsInScope[params.symbolsInScope.length - 1];

		if (lastSymbolInScope.methodName != null) {
			if (singleCollectionTagActivators.includes(lastSymbolInScope.methodName)) {
				if (singleCollectionParamNames.includes(parameter.name)) {
					return exclusiveResult(makeSingleCollectionNameSuggestions(params.project));
				}
			}
		}
	}

	if (collectionParamNames.includes(parameter.name)) {
		return exclusiveResult(makeCollectionNameSuggestions(getParameterArrayValue(params.activeParameter), params.project));
	}

	return null;
}
