import { IScopeVariable } from '../scope/engine';
import { ISymbol } from '../types';

export function makeArrayVariables(symbol: ISymbol): IScopeVariable[] {
	return [
		{ sourceName: '*internal.array', sourceField: null, dataType: '*', name: 'value', introducedBy: symbol },
		{ sourceName: '*internal.array', sourceField: null, dataType: '*', name: 'key', introducedBy: symbol }
	];
}
