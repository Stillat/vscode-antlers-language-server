import { IScopeVariable } from '../scope/engine';
import { ISymbol } from '../types';

export function makeCollectionVariables(symbol: ISymbol): IScopeVariable[] {
	return [
		{ name: 'no_results', dataType: 'boolean', sourceField: null, sourceName: '*internal.collection.context', introducedBy: symbol },
		{ name: 'total_results', dataType: 'integer', sourceField: null, sourceName: '*internal.collection.context', introducedBy: symbol }
	];
}
