import { IScopeVariable } from '../scope/engine';
import { ISymbol } from '../types';

export function makeGlideVariables(symbol: ISymbol): IScopeVariable[] {
	return [
		{ name: 'width', dataType: 'number', sourceName: '*internal.glide', sourceField: null, introducedBy: symbol },
		{ name: 'height', dataType: 'number', sourceName: '*internal.glide', sourceField: null, introducedBy: symbol },
		{ name: 'url', dataType: 'string', sourceName: '*internal.glide', sourceField: null, introducedBy: symbol },
	];
}
