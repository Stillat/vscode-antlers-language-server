import { IScopeVariable } from '../scope/engine';
import { ISymbol } from '../types';

export function makeEntryVariables(symbol: ISymbol): IScopeVariable[] {
	return [
		{ name: 'collection', dataType: 'string', sourceName: '*internal.entry', sourceField: null, introducedBy: symbol },
		{ name: 'date', dataType: 'string', sourceName: '*internal.entry', sourceField: null, introducedBy: symbol },
		{ name: 'datestamp', dataType: 'number', sourceName: '*internal.entry', sourceField: null, introducedBy: symbol },
		{ name: 'datestring', dataType: 'string', sourceName: '*internal.entry', sourceField: null, introducedBy: symbol },
		{ name: 'has_timestamp', dataType: 'boolean', sourceName: '*internal.entry', sourceField: null, introducedBy: symbol },
		{ name: 'is_entry', dataType: 'boolean', sourceName: '*internal.entry', sourceField: null, introducedBy: symbol },
		{ name: 'order', dataType: 'number', sourceName: '*internal.entry', sourceField: null, introducedBy: symbol },
		{ name: 'order_type', dataType: 'string', sourceName: '*internal.entry', sourceField: null, introducedBy: symbol },
		{ name: 'timestamp', dataType: 'number', sourceName: '*internal.entry', sourceField: null, introducedBy: symbol },

	];
}