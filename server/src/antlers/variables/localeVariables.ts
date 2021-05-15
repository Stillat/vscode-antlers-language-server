import { IScopeVariable } from '../scope/engine';
import { ISymbol } from '../types';

export function makeLocaleVariables(symbol: ISymbol): IScopeVariable[] {
	return [
		{ name: 'url', dataType: 'string', sourceField: null, sourceName: '*internal.locale', introducedBy: symbol },
		{ name: 'name', dataType: 'string', sourceField: null, sourceName: '*internal.locale', introducedBy: symbol },
	];
}
