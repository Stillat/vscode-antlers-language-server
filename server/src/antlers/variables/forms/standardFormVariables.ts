import { IScopeVariable } from '../../scope/engine';
import { ISymbol } from '../../types';

export function makeStandardFormVariables(symbol: ISymbol): IScopeVariable[] {
	return [
		{ name: 'success', dataType: 'string', sourceField: null, sourceName: '*internal.forms', introducedBy: symbol },
		{ name: 'submission_created', dataType: 'boolean', sourceField: null, sourceName: '*internal.forms', introducedBy: symbol },
	];
}
