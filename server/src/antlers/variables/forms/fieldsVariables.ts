import { IScopeVariable } from '../../scope/engine';
import { ISymbol } from '../../types';

export function makeFieldsVariables(symbol: ISymbol): IScopeVariable[] {
	return [
		{ name: 'handle', dataType: 'string', sourceName: '*internal.forms.fields', sourceField: null, introducedBy: symbol },
		{ name: 'display', dataType: 'string', sourceName: '*internal.forms.fields', sourceField: null, introducedBy: symbol },
		{ name: 'type', dataType: 'string', sourceName: '*internal.forms.fields', sourceField: null, introducedBy: symbol },
		{ name: 'field', dataType: 'string', sourceName: '*internal.forms.fields', sourceField: null, introducedBy: symbol },
		{ name: 'error', dataType: 'string', sourceName: '*internal.forms.fields', sourceField: null, introducedBy: symbol },
		{ name: 'instructions', dataType: 'string', sourceName: '*internal.forms.fields', sourceField: null, introducedBy: symbol },
		{ name: 'old', dataType: 'string', sourceName: '*internal.forms.fields', sourceField: null, introducedBy: symbol },
	];
}
