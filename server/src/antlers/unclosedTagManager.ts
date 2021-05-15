import { Position } from 'vscode-languageserver-textdocument';
import { ISymbol } from './types';

export class UnclosedTagManager {
	static unclosedSymbols: Map<string, ISymbol[]> = new Map();

	static clear(documentUri: string) {
		this.unclosedSymbols.delete(documentUri);
	}

	static registerSymbols(documentUri: string, symbols: ISymbol[]) {
		this.unclosedSymbols.set(documentUri, symbols);
	}

	static getUnclosedTags(documentUri: string, position: Position): ISymbol[] {
		const symbolsToReturn: ISymbol[] = [];

		if (this.unclosedSymbols.has(documentUri) == false) {
			return symbolsToReturn;
		}

		const docSymbols = this.unclosedSymbols.get(documentUri) as ISymbol[];

		if (docSymbols.length == 0) {
			return symbolsToReturn;
		}

		const checkLine = position.line - 1;

		for (let i = 0; i < docSymbols.length; i++) {
			const thisSymbol = docSymbols[i];

			if (thisSymbol.endLine == checkLine && position.character > thisSymbol.endOffset) {
				symbolsToReturn.push(thisSymbol);
			} else if (checkLine > thisSymbol.endLine) {
				symbolsToReturn.push(thisSymbol);
			}

		}

		return symbolsToReturn;
	}

	static hasUnclosedTags(documentUri: string, position: Position): boolean {
		if (this.unclosedSymbols.has(documentUri) == false) {
			return false;
		}

		const unclosedSymbols = this.getUnclosedTags(documentUri, position);

		return unclosedSymbols.length > 0;
	}

}
