import { ISymbol } from '../antlers/types';

export class ReferenceManager {
	static partialReferences: Map<string, ISymbol[]> = new Map();
	static cacheReferences: Map<string, ISymbol[]> = new Map();
	static removesPageScope: Map<string, ISymbol> = new Map();

	static clearAllReferences(documentUri: string) {
		this.clearPartialReferences(documentUri);
		this.clearCacheReferences(documentUri);
	}

	static registerPartialReferences(documentUri: string, symbols: ISymbol[]) {
		if (this.partialReferences.has(documentUri) == false) {
			this.partialReferences.set(documentUri, []);
		}

		this.partialReferences.set(documentUri, symbols);
	}

	static registerCacheReferences(documentUri: string, symbols: ISymbol[]) {
		if (this.cacheReferences.has(documentUri) == false) {
			this.cacheReferences.set(documentUri, []);
		}

		this.cacheReferences.set(documentUri, symbols);
	}

	static clearPartialReferences(documentUri: string) {
		if (this.partialReferences.has(documentUri)) {
			this.partialReferences.set(documentUri, []);
		}
	}

	static clearRemovesPageScope(documentUri: string) {
		if (this.removesPageScope.has(documentUri)) {
			this.removesPageScope.delete(documentUri);
		}
	}

	static pageScopeDisabled(documentUri: string): boolean {
		return this.removesPageScope.has(documentUri);
	}

	static clearCacheReferences(documentUri: string) {
		if (this.cacheReferences.has(documentUri)) {
			this.cacheReferences.set(documentUri, []);
		}
	}

	static setRemovesPageScope(documentUri: string, symbol: ISymbol) {
		this.removesPageScope.set(documentUri, symbol);
	}

	static getPartialReferences(documentUri: string): ISymbol[] {
		if (this.partialReferences.has(documentUri) == false) {
			return [];
		}

		return this.partialReferences.get(documentUri) as ISymbol[];
	}

	static getCacheReferencnes(documentUri: string): ISymbol[] {
		if (this.cacheReferences.has(documentUri) == false) {
			return [];
		}

		return this.cacheReferences.get(documentUri) as ISymbol[];
	}

	static hasPartialReferences(documentPath: string) {
		return this.partialReferences.has(documentPath);
	}

	static hasCacheReferences(documentPath: string) {
		return this.cacheReferences.has(documentPath);
	}

}
