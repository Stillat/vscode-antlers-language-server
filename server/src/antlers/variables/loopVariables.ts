import { IScopeVariable } from '../scope/engine';
import { ISymbol } from '../types';

export function makeLoopVariables(symbol: ISymbol): IScopeVariable[] {
	return [
		{ name: 'first', dataType: 'boolean', sourceField: null, sourceName: '*internal.loop', introducedBy: symbol },
		{ name: 'last', dataType: 'boolean', sourceField: null, sourceName: '*internal.loop', introducedBy: symbol },
		{ name: 'count', dataType: 'integer', sourceField: null, sourceName: '*internal.loop', introducedBy: symbol },
		{ name: 'index', dataType: 'integer', sourceField: null, sourceName: '*internal.loop', introducedBy: symbol },
		{ name: 'order', dataType: 'integer', sourceField: null, sourceName: '*internal.loop', introducedBy: symbol },
	];
}
