import { IScopeVariable } from '../scope/engine';
import { ISymbol } from '../types';
import { makeContentVariables } from './contentVariables';

export function makeTermVariables(symbol: ISymbol): IScopeVariable[] {
	return makeContentVariables(symbol).concat([
		{ name: 'entries_count', dataType: 'number', sourceName: '*internal.term', sourceField: null, introducedBy: symbol },
		{ name: 'is_term', dataType: 'boolean', sourceName: '*internal.term', sourceField: null, introducedBy: symbol },
		{ name: 'taxonomy', dataType: 'string', sourceName: '*internal.term', sourceField: null, introducedBy: symbol },

	]);
}
