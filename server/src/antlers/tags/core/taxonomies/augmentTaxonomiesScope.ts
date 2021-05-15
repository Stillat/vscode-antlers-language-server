import { Scope } from '../../../scope/engine';
import { getParameter, ISymbol } from '../../../types';
import { makeContentVariables } from '../../../variables/contentVariables';
import { makeRoutableVariables } from '../../../variables/routeableVariables';
import { getParameterArrayValue } from '../../parameterFetcher';
import { getTaxonomyNames } from './utils';

export function augmentTaxonomyScope(symbol: ISymbol, scope: Scope): Scope {
	const taxonomyNames = getTaxonomyNames(symbol, scope.statamicProject),
		fields = scope.statamicProject.getTaxonomyBlueprintFields(taxonomyNames),
		collectionParam = getParameter('collection', symbol);

	scope.addBlueprintFields(symbol, fields);
	scope.addVariables([
		{ name: 'first', dataType: 'boolean', sourceName: '*internal.taxonomy', sourceField: null, introducedBy: symbol },
		{ name: 'last', dataType: 'boolean', sourceName: '*internal.taxonomy', sourceField: null, introducedBy: symbol },
		{ name: 'count', dataType: 'number', sourceName: '*internal.taxonomy', sourceField: null, introducedBy: symbol },
		{ name: 'index', dataType: 'number', sourceName: '*internal.taxonomy', sourceField: null, introducedBy: symbol },
		{ name: 'total_results', dataType: 'number', sourceName: '*internal.taxonomy', sourceField: null, introducedBy: symbol },
		{ name: 'entries_count', dataType: 'number', sourceName: '*internal.taxonomy', sourceField: null, introducedBy: symbol },
	]);
	scope.addVariables(makeRoutableVariables(symbol));

	if (typeof collectionParam !== 'undefined' && collectionParam !== null) {
		const collectionNames = getParameterArrayValue(collectionParam);

		if (collectionNames.length > 0) {
			const collectionFields = scope.statamicProject.getBlueprintFields(collectionNames),
				aliasScope = scope.introduceScopedAliasScope(symbol, 'entries', 'entries', collectionFields);

			aliasScope.addVariables(makeContentVariables(symbol));
		} else {
			scope.addVariableArray('entries', makeRoutableVariables(symbol).concat(makeContentVariables(symbol)));
		}
	} else {
		scope.addVariableArray('entries', makeRoutableVariables(symbol).concat(makeContentVariables(symbol)));
	}

	return scope;
}
