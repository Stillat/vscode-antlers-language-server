import { ISymbol } from '../antlers/types';

export interface IParsedToken {
	line: number;
	startCharacter: number;
	length: number;
	tokenType: string;
	tokenModifiers: string[];
}

const LangKeywords: string[] = ['if', 'else', 'elseif', '/if', 'unless', 'elseunless', '/unless'];

export class Tokenizer {

	private static tokenizeTagPart(symbol: ISymbol): IParsedToken[] {
		const tokens: IParsedToken[] = [],
			tagChars = symbol.content.split('');

		let startCollectionDetails = false,
			currentPieces: string[] = [],
			contentStart = -1;

		for (let i = 0; i < tagChars.length; i++) {
			const cur = tagChars[i];
			let next: string | null = null;

			if ((i + 1) < tagChars.length) {
				next = tagChars[i + 1];
			}

			if (cur.trim().length == 0) {
				if (startCollectionDetails == false) {
					continue;
				}

				break;
			}

			if (cur != '{' && cur.trim().length > 0 && startCollectionDetails == false) {
				startCollectionDetails = true;
				contentStart = i;
			}

			if (cur != '{') {
				currentPieces.push(cur);
			}

			if (cur == ':' && tokens.length > 0) {
				tokens.push({
					startCharacter: i + symbol.startOffset - 1,
					length: 1,
					line: symbol.startLine,
					tokenType: 'method',
					tokenModifiers: []
				});
				currentPieces = [];
				contentStart = i + 1;
				continue;
			}

			if ((cur == '[' || cur == ']') && tokens.length > 0) {
				tokens.push({
					startCharacter: i + symbol.startOffset - 1,
					length: 1,
					line: symbol.startLine,
					tokenType: 'operator',
					tokenModifiers: []
				});
				currentPieces = [];
				contentStart = i + 1;
				continue;
			}

			if (startCollectionDetails && next == ' ' || next == null || next == ':') {
				const content = currentPieces.join('');
				let contentType = 'property';

				if (symbol.isTag && tokens.length == 0) {
					if (LangKeywords.includes(symbol.runtimeName)) {
						contentType = 'keyword';
					} else {
						contentType = 'class';
					}
				} else {
					if (symbol.currentScope != null) {
						const contentRef = symbol.currentScope.findReference(content);

						if (contentRef != null) {
							contentType = 'variable';
						} else {
							let checkPath = content;

							if (checkPath.startsWith('/')) {
								checkPath = checkPath.substr(1);
							}

							if (symbol.currentScope.parentScope != null) {
								if (symbol.currentScope.hasListInHistory(checkPath)) {
									contentType = 'variable';
								} else {
									contentType = 'property';
								}
							} else {
								contentType = 'property';
							}
						}
					} else {
						contentType = 'property';
					}
				}

				if (contentStart > -1) {
					tokens.push({
						startCharacter: contentStart + symbol.startOffset - 1,
						length: content.length,
						line: symbol.startLine,
						tokenType: contentType,
						tokenModifiers: []
					});
				}

				currentPieces = [];
			}

		}


		return tokens;
	}

	static getTokens(symbols: ISymbol[]): IParsedToken[] {
		let allTokens: IParsedToken[] = [];

		for (let i = 0; i < symbols.length; i++) {
			const symb = symbols[i];

			if (symb.isComment) {
				continue;
			}

			if (symb.parameterCache != null) {
				for (let j = 0; j < symb.parameterCache.length; j++) {
					const thisParam = symb.parameterCache[j];

					if (thisParam.interpolations.length > 0) {
						for (let k = 0; k < thisParam.interpolations.length; k++) {
							const thisInterpolation = thisParam.interpolations[k],
								interpolationSymbols = thisInterpolation.symbols,
								interpolationTokens = this.getTokens(interpolationSymbols);

							for (let l = 0; l < interpolationTokens.length; l++) {
								interpolationTokens[l].startCharacter -= 1;
							}

							// allTokens = allTokens.concat(interpolationTokens);
						}
					}
				}
			}

			if (symb.modifiers != null) {
				for (let j = 0; j < symb.modifiers.modifiers.length; j++) {
					const modifier = symb.modifiers.modifiers[j];

					allTokens.push({
						line: modifier.line, startCharacter: modifier.startOffset - 1, length: modifier.name.length, tokenType: 'function', tokenModifiers: []
					});
					allTokens.push({
						line: modifier.line, startCharacter: modifier.startOffset + modifier.name.length, length: 1, tokenType: 'operator', tokenModifiers: []
					});

					if (modifier.args.length > 0) {
						let lastModifierContent = '';

						for (let k = 0; k < modifier.args.length; k++) {
							const arg = modifier.args[k];
							let argType = 'string';

							// Scope analysis may not have completed at this time.
							if (arg.scopeVariable == null && symb.currentScope != null) {
								arg.scopeVariable = symb.currentScope.findReference(arg.content.trim());
							}

							if (arg.scopeVariable != null || lastModifierContent == '??') {
								argType = 'variable';
							}

							if (arg.content.trim() == '??') {
								argType = 'keyword';
							}

							allTokens.push({
								line: arg.line,
								startCharacter: arg.startOffset - 1,
								length: arg.content.trim().length,
								tokenType: argType,
								tokenModifiers: []
							});

							lastModifierContent = arg.content.trim();
						}
					}
				}
			}

			if (symb.isTag || symb.isClosedBy != null || symb.belongsTo != null || symb.isClosingTag) {
				allTokens = allTokens.concat(this.tokenizeTagPart(symb));
			}
		}

		return allTokens;
	}
}
