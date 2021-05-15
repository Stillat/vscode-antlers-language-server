import { IBlueprintField, variablesToBlueprintFields } from '../../../projects/blueprints';
import { getParameter, ISymbol } from '../../types';
import { makeLoopVariables } from '../../variables/loopVariables';
import { Scope } from '../engine';

/**
 * Analyzes the provided symbol for "as" and "scope" parameters and applies them to the reference scope.
 * @param symbol The symbol to analyze
 * @param scope The reference scope.
 * @param fields The reference fields.
 */
export function checkSymbolForScopeAndAlias(symbol: ISymbol, scope: Scope, fields: IBlueprintField[] | undefined | null) {
	if (typeof fields === 'undefined' || fields === null) {
		return;
	}

	const aliasParam = getParameter('as', symbol),
		scopeParam = getParameter('scope', symbol);

	fields = fields.concat(variablesToBlueprintFields(makeLoopVariables(symbol)));

	if (aliasParam != null && scopeParam != null) {
		scope.introduceScopedAliasScope(symbol, scopeParam.value, aliasParam.value, fields);
	} else if (aliasParam != null) {
		scope.introduceAliasScope(symbol, aliasParam.value, fields);
	} else if (scopeParam != null) {
		scope.introduceDynamicScopeList(symbol, scopeParam.value, fields);
	} else {
		scope.addBlueprintFields(symbol, fields);
	}
}
