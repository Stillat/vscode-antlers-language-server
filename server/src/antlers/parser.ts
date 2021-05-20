import { v4 as uuidv4 } from 'uuid';
import { Position } from 'vscode-languageserver-textdocument';
import { DiagnosticSeverity, FoldingRange } from 'vscode-languageserver-types';
import { StatamicProject } from '../projects/statamicProject';
import { trimLeft, trimRight, trimString } from './../utils/strings';
import { resolvePositionScope } from './concerns/resolvesPositionScope';
import { analyzeModifiers } from './modifierAnalyzer';
import { validateSymbolParameters } from './parameterValidator';
import { ScopeEngine } from './scope/engine';
import { TagManager } from './tagManager';
import { getScopeNameFromString, resolveTree, resolveTypedTree } from './tags';
import { getParameters } from './tags/parameterFetcher';
import { EmptySymbol, IAntlersBraceState, IPosition, IErrorLocation, IFoundLineOffset, IFoundOffset, IReportableError, ISeekResult, ISymbol, ITagExtraction, IUnknownCollection, IUnmatchedBrace } from './types';
import { getPotentialMethodName, getPotentialTagName } from './utils';

export interface IDocumentLine {
	data: string[],
	startIndex: number
}

export class AntlersParser {
	readonly _At = '@';
	readonly _LBrace = '{';
	readonly _RBrace = '}';
	readonly _NewLine = "\n";

	private statamicProject: StatamicProject | null = null;
	private currentIndex = 0;
	private currentLine = 0;

	private inputLength = 0;
	private inputChars: string[] = [];
	private current = '';
	private next: string | null = null;
	private prev: string | null = null;
	public runScopeAnalysis = true;
	private lineCache: Map<number, IDocumentLine> = new Map();
	private offSetLines: Map<number, number> = new Map();
	private foldingRanges: FoldingRange[] = [];
	private braceStats: IAntlersBraceState[] = [];
	private openBracketLocations: IPosition[] = [];
	private closeBracketLocations: IPosition[] = [];
	private documentUri = '';
	private isInterpolationMode = false;

	private reportableErrors: IReportableError[] = [];
	private emptyBraces: IErrorLocation[] = [];
	private discoveredMissingBraces: IUnmatchedBrace[] = [];

	private seedOffset = 0;
	private isParsingComment = false;
	private seedLineNumber = 0;

	public symbols: ISymbol[] = [];

	public resolveScope(position: Position): ISymbol[] {
		return resolvePositionScope(this, position);
	}

	public resetOffsetSeed() {
		this.seedOffset = 0;
		this.seedLineNumber = 0;
	}

	public seedOffsets(offset: number, lineNumber: number) {
		this.seedOffset = offset;
		this.seedLineNumber = lineNumber;
	}

	public shouldAnalyze(): boolean {
		if (this.statamicProject == null) {
			return false;
		}

		return !this.statamicProject.isMocked;
	}

	public getMissingBraces(): IUnmatchedBrace[] {
		return this.discoveredMissingBraces;
	}

	public setIsInterpolationMode(isInterpolation: boolean) {
		this.isInterpolationMode = isInterpolation;
	}

	public getAntlersErrors(): IReportableError[] {
		let errors: IReportableError[] = [];

		this.discoveredMissingBraces.forEach((unmatchedBrace: IUnmatchedBrace) => {
			errors.push({
				endLine: unmatchedBrace.endLine,
				endPos: unmatchedBrace.endPos,
				message: 'Expecting "}" but found "' + unmatchedBrace.foundChar + '" instead.',
				startLine: unmatchedBrace.startLine,
				startPos: unmatchedBrace.startPos,
				severity: DiagnosticSeverity.Error
			});
		});

		this.emptyBraces.forEach((emptyBrace: IErrorLocation) => {
			errors.push({
				endLine: emptyBrace.endLine,
				endPos: emptyBrace.endPos,
				severity: emptyBrace.severity,
				startLine: emptyBrace.startLine,
				startPos: emptyBrace.startPos,
				message: 'Antlers braces should not be empty.'
			});
		});

		const parameterErrors = validateSymbolParameters(this.symbols);

		if (parameterErrors.length > 0) {
			errors = errors.concat(parameterErrors);
		}

		errors = errors.concat(this.reportableErrors);

		return errors;
	}

	getFoldingRanges(): FoldingRange[] {
		return this.foldingRanges;
	}

	private reset() {
		this.isParsingComment = false;
		this.lineCache.clear();
		this.offSetLines.clear();

		this.currentIndex = 0;
		this.inputChars = [];
		this.current = '';
		this.next = null;
		this.prev = null;

		this.offSetLines.clear();
		this.foldingRanges = [];
		this.braceStats = [];
		this.openBracketLocations = [];
		this.closeBracketLocations = [];

		this.reportableErrors = [];
		this.emptyBraces = [];
		this.symbols = [];
		this.discoveredMissingBraces = [];
		this.currentLine = this.seedLineNumber;
		this.inputLength = 0;
	}

	private checkOffset(index: number) {
		this.current = this.inputChars[index];

		if ((index + 1) < this.inputLength) {
			this.next = this.inputChars[index + 1];
		}

		if (index > 0) {
			this.prev = this.inputChars[index - 1];
		}

		if (this.current == this._NewLine) {
			this.currentLine += 1;
		}
	}

	private isStartingAntlersTag(): boolean {
		if (this.isParsingComment) {
			return false;
		}

		// True when: {{
		// False when: @{{ or other input.
		if (this.prev != this._At && this.current == this._LBrace && this.next == '[') {
			const currentIndexOffset = this.getOffSetFromIndex(this.currentIndex);

			if (currentIndexOffset != null) {
				this.reportableErrors.push({
					startLine: currentIndexOffset.line,
					endLine: currentIndexOffset.line,
					startPos: currentIndexOffset.offset,
					endPos: currentIndexOffset.offset + 1,
					message: 'Possible syntax error: {[ instead of {{.',
					severity: DiagnosticSeverity.Warning
				});
			}
		}

		if (this.prev != this._At && this.current == this._LBrace && this.next == this._LBrace) {
			const currentIndexOffset = this.getOffSetFromIndex(this.currentIndex);
			let offsetToUse = 0;

			if (currentIndexOffset != null) {
				offsetToUse = currentIndexOffset.offset;
			}

			this.openBracketLocations.push({
				line: this.currentLine,
				offset: offsetToUse,
				index: this.currentIndex
			});
			this.braceStats.push({
				line: this.currentLine,
				offset: offsetToUse,
				isDouble: true,
				isOpen: true
			});

			return true;
		}

		return false;
	}

	public searchForNearestLeftBracketsLocation(line: number, offset: number): IFoundLineOffset | null {
		if (offset == 0) {
			return null;
		}

		if (this.lineCache.has(line)) {
			const documentLine = this.lineCache.get(line) as IDocumentLine,
				lineData = documentLine.data;

			if (offset > lineData.length) {
				return null;
			}

			for (let i = offset - 1; i >= 0; i--) {
				if (lineData[i] == '}') {
					break;
				} else if (lineData[i] == '{') {
					return {
						line: line,
						offset: i
					};
				}
			}
		}

		return null;
	}

	public findLeftInterpolationBrackets(minimumOffset: number, currentOffset: number): number | null {
		for (let i = currentOffset; i >= minimumOffset; i--) {
			const curChar = this.inputChars[i];

			if (curChar == "\n") {
				break;
			}

			if (curChar == '{' && this.inputChars[i - 1] != '{') {
				return i;
			}
		}

		return null;
	}

	public isInBrackets(line: number, offset: number): boolean {
		const location = this.searchForNearestLeftBracketsLocation(line, offset);

		if (location == null) {
			return false;
		}

		return true;
	}

	public getTextAt(offset: number, chars: number): string[] {
		return this.inputChars.slice(offset, chars);
	}

	private getOffSetFromIndex(index: number): IPosition | null {
		if (this.offSetLines.has(index)) {
			const lineNumber = this.offSetLines.get(index) as number;

			if (this.lineCache.has(lineNumber)) {
				const documentLine = this.lineCache.get(lineNumber) as IDocumentLine,
					offset = index - documentLine.startIndex + 1;

				return {
					line: lineNumber,
					offset: offset,
					index: index
				};
			}
		}

		return null;
	}

	private nextNonWhiteSpace(skip = 0): IFoundOffset {
		let charFound = null,
			foundAtIndex = this.currentIndex + skip,
			foundAtOffset = 0;

		for (let i = this.currentIndex + skip; i < this.inputLength; i++) {
			if (this.inputChars[i].trim().length > 0) {
				charFound = this.inputChars[i];
				foundAtIndex = i;

				break;
			}
		}

		const position = this.getOffSetFromIndex(foundAtIndex);

		if (position != null) {
			foundAtOffset = position.offset;
		}

		return {
			char: charFound,
			offset: foundAtOffset,
			index: foundAtIndex
		};
	}

	private isWhitespace(char: string): boolean {
		if (char.trim().length == 0) {
			return true;
		}

		return false;
	}

	private seekTo(find: string, startOffset: number): ISeekResult {
		const result: ISeekResult = {
			found: false,
			content: '',
			offset: -1
		};

		for (let i = startOffset; i < this.inputLength; i++) {
			const current = this.inputChars[i];
			let next: string | null = null,
				prev: string | null = null;

			if ((i - 1) > 0) {
				prev = this.inputChars[i - 1];
			}

			if ((i + 1) < this.inputLength) {
				next = this.inputChars[i + 1];
			}

			if (current == find) {
				result.content += current;
				result.found = true;
				result.offset = i;
				break;
			} else {
				if (prev != null && next != null && prev != this._At && current == this._RBrace && next == this._RBrace) {
					break;
				}

				if (current == this._NewLine) {
					break;
				}

				result.content += current;
			}
		}

		return result;
	}

	private scanToEndOfAntlersTag(): ITagExtraction {
		const currentIndexOffset = this.getOffSetFromIndex(this.currentIndex);
		let offsetToUse = 0;

		if (currentIndexOffset != null) {
			offsetToUse = currentIndexOffset.offset;
		}

		const startOffset = offsetToUse,
			startLine = this.currentLine;

		let tag = '',
			paramContent = '',
			paramStartOffset = 0,
			paramStartLine = 0,
			endOffset = offsetToUse,
			endLine = this.currentLine,
			isClosingTag = false,
			hasFoundTagName = false,
			tagName = '',
			hasModifier = false,
			modifierOffset = null,
			tagNameStartOffset = 0;

		const nextNonWhitespace = this.nextNonWhiteSpace(2);
		let reference = null;

		tagNameStartOffset = nextNonWhitespace.offset;

		if (nextNonWhitespace.char == '/') {
			isClosingTag = true;
			tagNameStartOffset += 1;
		}

		for (this.currentIndex; this.currentIndex < this.inputLength; this.currentIndex++) {
			this.checkOffset(this.currentIndex);

			if (this.currentIndex + 2 < this.inputLength) {
				const peek = this.inputChars[this.currentIndex + 2];

				if (peek == '#') {
					this.isParsingComment = true;
				}
			}

			if (this.prev != this._At) {
				if (this.current == ']' && this.next == this._RBrace) {
					const currentIndexOffset = this.getOffSetFromIndex(this.currentIndex);

					if (currentIndexOffset != null) {
						this.reportableErrors.push({
							startLine: currentIndexOffset.line,
							endLine: currentIndexOffset.line,
							startPos: currentIndexOffset.offset,
							endPos: currentIndexOffset.offset + 1,
							message: 'Possible syntax error: ]} instead of }}.',
							severity: DiagnosticSeverity.Warning
						});
					}
				}

				if (this.current == this._RBrace && this.next == this._RBrace) {
					if (this.isParsingComment && this.prev != null && this.prev != '#') {
						tag += '}}';
						this.currentIndex += 1;

						continue;
					}
					tag += '}}';
					this.currentIndex += 1;

					const currentIndexOffset = this.getOffSetFromIndex(this.currentIndex);
					let offsetToUse = 0;

					if (currentIndexOffset != null) {
						offsetToUse = currentIndexOffset.offset;
					}

					this.closeBracketLocations.push({
						line: this.currentLine,
						offset: offsetToUse,
						index: this.currentIndex
					});
					this.braceStats.push({
						line: this.currentLine,
						offset: offsetToUse,
						isDouble: true,
						isOpen: false
					});

					endOffset = offsetToUse + 1;
					endLine = this.currentLine;
					break;
				} else if (this.current == this._RBrace && this.prev != this._RBrace) {
					const currentIndexOffset = this.getOffSetFromIndex(this.currentIndex);

					if (currentIndexOffset != null) {
						offsetToUse = currentIndexOffset.offset;
					}

					if (this.next != this._RBrace) {
						// Unmatched
						/*this.discoveredMissingBraces.push({
							startLine: startLine,
							endLine: this.currentLine,
							startPos: startOffset - 2,
							endPos: offsetToUse,
							foundChar: this.next
						});*/
						tag += this.current;
					} else {
						tag += this.current;
					}
				} else {

					tag += this.current;
				}
			} else {
				tag += this.current;
			}

			if (hasFoundTagName == false && this.currentIndex >= nextNonWhitespace.index) {
				if (this.isWhitespace(this.current)) {
					hasFoundTagName = true;

					const currentIndexOffset = this.getOffSetFromIndex(this.currentIndex);

					if (currentIndexOffset != null) {
						paramStartOffset = currentIndexOffset.offset;
						paramStartLine = this.currentLine;
					}

					const modifierChar = this.nextNonWhiteSpace();

					if (modifierChar.char == '|') {
						if (modifierChar.index + 1 < this.inputLength) {
							const peekChar = this.inputChars[modifierChar.index + 1];

							if (peekChar != '|') {
								hasModifier = true;
								modifierOffset = modifierChar.offset;
							}
						} else {
							hasModifier = true;
							modifierOffset = modifierChar.offset;
						}
					}
				} else {
					if (this.current == '"' || this.current == "'") {
						const results = this.seekTo(this.current, this.currentIndex + 1);

						if (results.found == true) {
							this.currentIndex = results.offset;

							const resolvedContent = this.current + results.content,
								currentIndexOffset = this.getOffSetFromIndex(this.currentIndex);

							tagName += resolvedContent;
							tag += results.content;
							hasFoundTagName = true;

							if (currentIndexOffset != null) {
								paramStartOffset = currentIndexOffset.offset;
								paramStartLine = this.currentLine;
							}

							continue;
						}
					} else {
						tagName += this.current;
					}
				}
			}

			if (hasFoundTagName) {
				paramContent += this.current;
			}
		}

		let adjStartOffset = startOffset;

		if (startLine > 0) {
			adjStartOffset -= 2;
		}

		tagName = tagName.trim();

		const hasContents = trimString(tag, '{}').trim().length > 0;

		const analyzedTagName = getPotentialTagName(tagName),
			anlayzedMethodName = getPotentialMethodName(tagName);
		let runtimeName = analyzedTagName;

		if (anlayzedMethodName.trim().length > 0) {
			runtimeName = analyzedTagName + ':' + anlayzedMethodName;
		}

		if (hasContents) {
			const scopeCandidate = getScopeNameFromString(tag);
			let isScoped = false, scopeName = '';

			if (scopeCandidate != null) {
				isScoped = true;
				scopeName = scopeCandidate;
			}

			const parameterCache = getParameters(paramContent, (paramStartOffset + 2));
			const existingParamNames: string[] = [];

			for (let i = 0; i < parameterCache.length; i++) {
				existingParamNames.push(parameterCache[i].name);

				if (parameterCache[i].interpolations.length > 0 && this.statamicProject != null) {
					for (let j = 0; j < parameterCache[i].interpolations.length; j++) {
						const thisInterpolation = parameterCache[i].interpolations[j],
							wrappedContent = '{{' + thisInterpolation.value + '}}',
							interpolationParser = new AntlersParser();

						interpolationParser.setIsInterpolationMode(true);

						interpolationParser.runScopeAnalysis = true;
						interpolationParser.seedOffsets(thisInterpolation.startOffset - 1, startLine);
						interpolationParser.parseText(this.documentUri, wrappedContent, this.statamicProject);

						thisInterpolation.symbols = interpolationParser.symbols;
					}
				}
			}

			let isComment = false;

			if (tag.startsWith('{{#') && tag.endsWith('#}}')) {
				isComment = true;
				tag = trimLeft(tag, '{{#');
				tag = trimRight(tag, '#}}');
			}

			if (this.seedOffset > 0) {
				// Adjust to account for the wrapped content that is added to parse interpolation symbols.
				endOffset -= 2;
			}

			const newSymbol: ISymbol = {
				id: uuidv4(),
				index: this.symbols.length + 1,
				isComment: isComment,
				tagPart: tagName.trim(),
				currentScope: null,
				scopeVariable: null,
				sourceType: '',
				manifestType: '',
				mustClose: null,
				parameterCache: parameterCache,
				existingParamNames: existingParamNames,
				endOffset: endOffset + this.seedOffset,
				name: analyzedTagName,
				runtimeName: runtimeName,
				runtimeType: null,
				methodName: anlayzedMethodName,
				isTag: TagManager.isKnownTag(runtimeName),
				isClosingTag: isClosingTag,
				content: tag,
				parameterContent: paramContent,
				parameterContentStart: paramStartOffset + 1 + this.seedOffset,
				parameterContentStartLine: paramStartLine,
				startLine: startLine,
				endLine: this.currentLine,
				startOffset: startOffset + this.seedOffset,
				hasModifierSeparator: hasModifier,
				modifierOffset: modifierOffset,
				belongsTo: null,
				isClosedBy: null,
				reference: reference,
				scopeName: scopeName,
				modifiers: null,
				parserInstance: this,
				isInterpolationSymbol: this.isInterpolationMode
			};

			if (TagManager.canResolveSpecialTypes(tagName) && this.statamicProject != null) {
				const specialResults = TagManager.resolveSpecialType(tagName, newSymbol, this.statamicProject);

				if (specialResults.issues != null && specialResults.issues.length > 0) {
					this.reportableErrors = this.reportableErrors.concat(specialResults.issues);
				}

				if (specialResults.context != null) {
					reference = specialResults.context;
				}
			}

			newSymbol.reference = reference;

			newSymbol.modifiers = analyzeModifiers(newSymbol);

			if (this.isInterpolationMode && newSymbol.modifiers != null) {
				for (let m = 0; m < newSymbol.modifiers.modifiers.length; m++) {
					newSymbol.modifiers.modifiers[m].startOffset += 1;
					newSymbol.modifiers.modifiers[m].endOffset += 2;

					for (let ma = 0; ma < newSymbol.modifiers.modifiers[m].args.length; ma++) {
						newSymbol.modifiers.modifiers[m].args[ma].startOffset += 1;
						newSymbol.modifiers.modifiers[m].args[ma].endOffset += 2;
					}
				}

				for (let m = 0; m < newSymbol.modifiers.shorthandModifiers.length; m++) {
					newSymbol.modifiers.shorthandModifiers[m].startOffset += 1;
					newSymbol.modifiers.shorthandModifiers[m].endOffset += 2;

					for (let ma = 0; ma < newSymbol.modifiers.shorthandModifiers[m].args.length; ma++) {
						newSymbol.modifiers.shorthandModifiers[m].args[ma].startOffset += 1;
						newSymbol.modifiers.shorthandModifiers[m].args[ma].endOffset += 2;
					}
				}

				for (let m = 0; m < newSymbol.modifiers.paramModifiers.length; m++) {
					newSymbol.modifiers.paramModifiers[m].startOffset += 1;
					newSymbol.modifiers.paramModifiers[m].endOffset += 2;

					for (let ma = 0; ma < newSymbol.modifiers.paramModifiers[m].args.length; ma++) {
						newSymbol.modifiers.paramModifiers[m].args[ma].startOffset += 1;
						newSymbol.modifiers.paramModifiers[m].args[ma].endOffset += 2;
					}
				}
			}

			this.symbols.push(newSymbol);
		} else {
			paramStartLine = startLine;
			paramStartOffset = endOffset;

			this.symbols.push({
				id: uuidv4(),
				index: this.symbols.length + 1,
				isComment: false,
				tagPart: '',
				currentScope: null,
				scopeVariable: null,
				sourceType: '',
				manifestType: '',
				mustClose: null,
				parameterCache: null,
				existingParamNames: [],
				name: '',
				runtimeName: '',
				methodName: '',
				content: tag,
				parameterContent: '',
				parameterContentStart: startOffset + this.seedOffset,
				parameterContentStartLine: paramStartLine,
				isClosingTag: false,
				isClosedBy: null,
				belongsTo: null,
				endOffset: endOffset + this.seedOffset,
				hasModifierSeparator: false,
				isTag: false,
				modifierOffset: null,
				modifiers: null,
				reference: null,
				runtimeType: null,
				scopeName: '',
				startLine: startLine,
				endLine: this.currentLine,
				startOffset: startOffset + this.seedOffset,
				parserInstance: this,
				isInterpolationSymbol: this.isInterpolationMode
			});

			this.emptyBraces.push({
				endLine: endLine,
				endPos: endOffset,
				severity: DiagnosticSeverity.Information,
				startLine: startLine,
				startPos: startOffset - 2
			});
		}

		this.isParsingComment = false;

		return {
			tagName: tagName,
			isClosingTag: isClosingTag,
			contents: tag,
			endLine: endLine,
			endOffset: endOffset,
			startLine: startLine,
			startOffset: adjStartOffset
		};
	}

	getNextMeaningfulWordToLeft(line: number, char: number): string | null {
		if (this.lineCache.has(line)) {
			const documentLine = this.lineCache.get(line),
				lineChars = documentLine?.data;

			if (lineChars != null && char < lineChars.length) {
				const wordChars: string[] = [];
				let wordCount = 0;

				for (let i = char; i >= 0; i--) {
					if (lineChars[i] == ' ' && i == char) {
						continue;
					}

					if (lineChars[i] == ' ' || lineChars[i] == ':') {
						wordCount += 1;
					}

					if (wordCount == 2) {
						return wordChars.reverse().join('');
					}

					if (i > 0 && lineChars[i] == '{' && lineChars[i - 1] == '{') {
						return wordChars.reverse().join('');
					}

					if (wordCount > 0) {
						wordChars.push(lineChars[i]);
					}
				}
			}
		}

		return null;
	}

	getWordToLeft(line: number, char: number): string | null {
		if (this.lineCache.has(line)) {
			const documentLine = this.lineCache.get(line),
				lineChars = documentLine?.data;

			if (lineChars != null && char < lineChars.length) {
				const wordChars: string[] = [];

				for (let i = char; i >= 0; i--) {
					if (lineChars[i] == ' ' && i == char) {
						continue;
					}

					if (lineChars[i] == ' ') {
						break;
					}

					wordChars.push(lineChars[i]);
				}

				return wordChars.reverse().join('');
			}
		}

		return null;
	}

	getCharToRight(line: number, char: number): string | null {
		if (this.lineCache.has(line)) {
			const documentLine = this.lineCache.get(line),
				lineChars = documentLine?.data;

			if (lineChars != null && char < lineChars.length) {
				return lineChars[char + 1];
			}
		}

		return null;
	}

	getWordToRight(line: number, char: number): string | null {
		if (this.lineCache.has(line)) {
			const documentLine = this.lineCache.get(line),
				lineChars = documentLine?.data;

			if (lineChars != null && char < lineChars.length) {
				const wordChars: string[] = [];

				for (let i = char; i < lineChars.length; i++) {
					if (lineChars[i] == ' ' && i == char) {
						continue;
					}

					if (lineChars[i] == ' ') {
						break;
					}

					wordChars.push(lineChars[i]);
				}

				return wordChars.join('');
			}
		}

		return null;
	}

	getSymbol(index: number): ISymbol {
		return this.symbols[index];
	}

	getSymbols(): ISymbol[] {
		return this.symbols;
	}

	getSymbolCount(): number {
		return this.symbols.length;
	}

	locateParentOfType(symbolType: string): ISymbol | null {
		if (this.symbols.length == 0) {
			return null;
		}

		let refStack = 0;

		for (let i = this.symbols.length - 1; i >= 0; i--) {
			const currentSymbol = this.symbols[i];

			if (currentSymbol.tagPart == '/' + symbolType) {
				refStack += 1;
				continue;
			} else if (currentSymbol.tagPart == symbolType) {
				if (refStack == 0) {
					return currentSymbol;
				} else {
					refStack -= 1;
					continue;
				}
			}
		}

		return null;
	}

	parseText(documentUri: string, text: string, statamicProject: StatamicProject) {
		this.reset();
		this.documentUri = documentUri;

		this.statamicProject = statamicProject;

		this.inputChars = text.replace(/(\r\n|\n|\r)/gm, "\n").split('');
		this.inputLength = this.inputChars.length;

		// Build up the line cache.
		let lineCount = 0;
		for (let i = 0; i < this.inputChars.length; i++) {
			const cur = this.inputChars[i];

			if (cur == this._NewLine) {
				lineCount++;
				continue;
			}

			this.offSetLines.set(i, lineCount);

			if (this.lineCache.has(lineCount) == false) {
				this.lineCache.set(lineCount, {
					startIndex: i,
					data: []
				});
			}

			this.lineCache.get(lineCount)?.data.push(this.inputChars[i]);
		}

		for (this.currentIndex = 0; this.currentIndex < this.inputLength; this.currentIndex++) {
			this.checkOffset(this.currentIndex);
			if (this.isStartingAntlersTag()) {
				const antlersTag = this.scanToEndOfAntlersTag();
			}
		}

		// Resolve the hierarchy and scope tree.
		resolveTree(this.statamicProject, this);

		if (this.runScopeAnalysis) {
			const scopeEngine = new ScopeEngine(this.statamicProject, this.documentUri);
			scopeEngine.analyzeScope(this.symbols);

			for (let i = 0; i < this.symbols.length; i++) {
				const symb = this.symbols[i];

				if (symb.parameterCache != null) {
					for (let j = 0; j < symb.parameterCache.length; j++) {
						const thisParam = symb.parameterCache[j];

						if (thisParam.containsInterpolation) {
							for (let l = 0; l < thisParam.interpolations.length; l++) {
								const thisInterpolation = thisParam.interpolations[l];

								if (thisInterpolation.symbols.length > 0) {
									for (let is = 0; is < thisInterpolation.symbols.length; is++) {
										thisInterpolation.symbols[is].currentScope = symb.currentScope;
									}
								}
							}
						}
					}
				}
			}

			resolveTypedTree(this.statamicProject, this);
		}

		// Analyzes modifiers for any variables.
		for (let i = 0; i < this.symbols.length; i++) {
			const symb = this.symbols[i];

			if (symb.currentScope == null) {
				continue;
			}

			if (symb.modifiers != null) {
				for (let j = 0; j < symb.modifiers.modifiers.length; j++) {
					const thisModifier = symb.modifiers.modifiers[j];

					if (thisModifier.args.length > 0) {
						for (let k = 0; k < thisModifier.args.length; k++) {
							const thisArg = thisModifier.args[k];

							thisArg.scopeVariable = symb.currentScope.findReference(thisArg.content.trim());
						}
					}
				}
			}
		}

		// Experimental folding range support.
		for (let i = 0; i < this.symbols.length; i++) {
			const curSymbol = this.symbols[i];

			if (curSymbol.isClosedBy != null) {
				this.foldingRanges.push({
					startLine: curSymbol.startLine,
					endLine: curSymbol.isClosedBy.startLine
				});
			}
		}

		if (this.symbols.length == 0) {
			const placeholderSymbol = EmptySymbol;

			placeholderSymbol.startOffset += this.seedOffset;
			placeholderSymbol.endOffset += this.seedOffset;
			placeholderSymbol.startLine += this.seedLineNumber;
			placeholderSymbol.parserInstance = this;

			this.symbols.push(placeholderSymbol);
		}
	}

}
