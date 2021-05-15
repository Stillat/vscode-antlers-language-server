import { Scope } from '../../../scope/engine';
import { checkSymbolForScopeAndAlias } from '../../../scope/factories/listFactory';
import { ISymbol } from '../../../types';
import { makeCollectionVariables } from '../../../variables/collectionVariables';
import { getCollectionBlueprintFields } from './utils';

export function augmentCollectionScope(symbol: ISymbol, scope: Scope): Scope {

	if (symbol.methodName != null && symbol.methodName != 'count') {
		scope.addVariables(makeCollectionVariables(symbol));
	}

	if (symbol.reference != null) {
		const fields = getCollectionBlueprintFields(symbol, scope);

		checkSymbolForScopeAndAlias(symbol, scope, fields);
	}

	return scope;
}
