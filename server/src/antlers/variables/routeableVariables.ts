import { IScopeVariable } from '../scope/engine';
import { ISymbol } from '../types';

export function makeRoutableVariables(symbol: ISymbol): IScopeVariable[] {
	return [
		{ name: 'title', dataType: 'string', sourceField: null, sourceName: '*internal.routeable', introducedBy: symbol },
		{ name: 'url', dataType: 'string', sourceField: null, sourceName: '*internal.routeable', introducedBy: symbol },
	];
}
