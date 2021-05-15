import { Position } from 'vscode-languageserver-textdocument';
import { replaceAllInString, trimString } from '../../utils/strings';
import { AntlersParser } from '../parser';
import { IParameterAttribute, TagManager } from '../tagManager';
import { ISymbol } from '../types';

export interface IScopeSearchResult {
	found: boolean,
	symbol: ISymbol | null
}

export function isPastTagPart(symbol: ISymbol, position: Position): boolean {
	const checkLine = position.line;

	if (checkLine > symbol.parameterContentStartLine) {
		return true;
	}

	if (checkLine < symbol.parameterContentStartLine) {
		return false;
	}

	if (symbol.runtimeName.trim().length == 0) {
		return false;
	}

	if ((position.character + 1) < symbol.parameterContentStart) {
		return false;
	}

	return true;
}

export function isCursorInsideSymbol(symbol: ISymbol, position: Position): boolean {
	if (symbol.startLine == symbol.endLine) {
		if (position.line == symbol.startLine + 1 && (
			position.character > symbol.startOffset &&
			position.character <= symbol.endOffset
		)) {
			return true;
		}
	}

	if (position.line == symbol.startLine && position.character > symbol.startOffset &&
		position.character <= symbol.endOffset) {
		return true;
	}

	if (position.line == symbol.endLine && position.character < symbol.endOffset) {
		return true;
	}

	if (position.line > symbol.startLine && position.line < symbol.endLine) {
		return true;
	}

	return false;
}

export function pathIsInScope(path: string, scope: ISymbol[]): boolean {
	let fullPath = '';
	const parts: string[] = [];

	for (let i = 0; i < scope.length; i++) {
		if (scope[i].runtimeName != null) {
			const adjustName = replaceAllInString(scope[i].runtimeName, ':', '.');

			if (adjustName.includes(path)) {
				return true;
			}

			if (trimString(scope[i].name, '{}').trim().includes(path)) {
				return true;
			}
		}

		parts.push(scope[i].name);
	}

	fullPath = parts.join('.');

	return fullPath.includes(path);
}

export function searchScope(value: string, scope: ISymbol[]): IScopeSearchResult {
	let didFind = false,
		symbol: ISymbol | null = null;

	for (let i = 0; i < scope.length; i++) {
		if (scope[i].name == value) {
			didFind = true;
			symbol = scope[i];
			break;
		}
	}

	return {
		found: didFind,
		symbol: symbol
	};
}

export function isInScope(value: string, scope: ISymbol[]): boolean {

	for (let i = 0; i < scope.length; i++) {
		if (scope[i].name == value) {
			return true;
		}
	}

	return false;
}

export function resolveActiveParameter(position: Position, symbol: ISymbol): IParameterAttribute | null {
	if (typeof symbol === 'undefined' || symbol === null) {
		return null;
	}

	if (symbol.parameterCache == null || symbol.parameterCache.length == 0) {
		return null;
	}

	const checkCharacter = position.character;

	for (let i = 0; i < symbol.parameterCache.length; i++) {
		const thisParam = symbol.parameterCache[i];

		if (checkCharacter >= thisParam.startOffset && checkCharacter < thisParam.endOffset) {
			return thisParam;
		}
	}

	return null;
}

export function resolvePositionScope(parserIntance: AntlersParser, position: Position): ISymbol[] {
	const symbolsInScope: ISymbol[] = [],
		skippedSymbols: ISymbol[] = [];
	let forceSkipLine = -1,
		forceSkipOffset = -1; // Hold a reference to each symbol we've skipped on purpose.

	// Iterate all of the symbols up to the current text document position.
	for (let i = 0; i < parserIntance.symbols.length; i++) {
		const currentSymbol = parserIntance.symbols[i];

		if (currentSymbol.isClosedBy != null) {
			if (currentSymbol.isClosedBy.endLine < position.line) {
				skippedSymbols.push(currentSymbol);
				skippedSymbols.push(currentSymbol.isClosedBy);

				forceSkipLine = currentSymbol.isClosedBy.endLine;
				forceSkipOffset = currentSymbol.isClosedBy.endOffset;
			}
		}

		if (forceSkipLine > -1) {
			if (currentSymbol.endLine < forceSkipLine) {
				continue;
			}

			if (currentSymbol.endLine == forceSkipLine && forceSkipOffset > -1) {
				if (currentSymbol.endOffset < forceSkipOffset) {
					continue;
				}
			}
		}

		if (currentSymbol.startLine > position.line) {
			break;
		}

		// Skip symbols that the current caret position is not aware of.
		if (currentSymbol.startLine == position.line &&
			position.character <= currentSymbol.startOffset) {
			skippedSymbols.push(currentSymbol);
			continue;
		}

		// If the current symbol is actually a tag pair
		// and the current caret position does not
		// fall within the pair, skip everything.
		if (TagManager.requiresClose(currentSymbol) && currentSymbol.isClosedBy != null) {
			const closingSymbol = currentSymbol.isClosedBy as ISymbol;

			if (closingSymbol.startLine < position.line) {
				// In this scenario, the closing appears before the caret's line.
				// {{ /collection:articles }}
				//    [|]
				skippedSymbols.push(currentSymbol);
				skippedSymbols.push(closingSymbol);
				continue;
			} else if (closingSymbol.startLine == position.line &&
				closingSymbol.endOffset < position.character) {
				// In this scenario, the closing tag appears before the caret's character position.
				// {{ /collection:articles}} [|]
				skippedSymbols.push(currentSymbol);
				continue;
			} else {
				// Should be fine.
				symbolsInScope.push(currentSymbol);
			}
		} else {
			// At this point, we are not analyzing a tag closing pair.
			// However, we may encounter a value that is enclosed
			// within the scope of a pair that we skipped.
			//
			// Example: We should _not_ add posts to the scope list.
			// {{ collection:articles as="posts" }}
			//    {{ posts }}
			//    {{ /posts }}
			// {{ /collection:articles}}
			//      [|]
			if (currentSymbol.belongsTo != null) {
				const ownerSymbol = currentSymbol.belongsTo as ISymbol;

				// Check if we've already skipped the symbol that this one belongs to.
				if (skippedSymbols.includes(ownerSymbol)) {
					skippedSymbols.push(currentSymbol);
					continue;
				} else {
					// Should be fine here, as well.
					symbolsInScope.push(currentSymbol);
				}
			} else {
				// Fall back to in scope.
				symbolsInScope.push(currentSymbol);
			}
		}
	}

	return symbolsInScope;
}
