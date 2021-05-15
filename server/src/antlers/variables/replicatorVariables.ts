import { IScopeVariable } from '../scope/engine';
import { ISymbol } from '../types';

export function makeReplicatorVariables(symbol: ISymbol): IScopeVariable[] {
	return [
		{ name: 'type', dataType: 'string', sourceName: '*internal.replicator', sourceField: null, introducedBy: symbol },
	];
}
