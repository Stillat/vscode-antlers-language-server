import { analyzeModifiers, ISymbolModifier, ISymbolModifierCollection } from './modifierAnalyzer';
import { IDocumentLine } from './parser';
import { IScopeVariable } from './scope/engine';
import { createSymbol, IPosition } from './types';

export interface ITokenContext {
	manifestType: string,
	reference: IScopeVariable | null
}

export interface IConditionalToken {
	type: ConditionalTokenType,
	content: string,
	start: number,
	end: number,
	startLine: number,
	endLine: number,
	context: ITokenContext | null,
	modifiers: ISymbolModifierCollection | null
}

export enum ConditionalTokenType {
	String = 1,
	EqualityComparison = 2,
	Literal = 3,
	LessThanOrEqual = 4,
	GreaterThanOrEqual = 5,
	NotEqual = 6,
	TernaryIf = 7,
	NullCoalesce = 8,
	TagExpression = 9,
	Or = 10,
	And = 11,
	ModifierTrigger = 12,
	StrictEqualityOperator = 13
}

const Operators: ConditionalTokenType[] = [
	ConditionalTokenType.EqualityComparison,
	ConditionalTokenType.LessThanOrEqual,
	ConditionalTokenType.GreaterThanOrEqual,
	ConditionalTokenType.NotEqual,
	ConditionalTokenType.TernaryIf,
	ConditionalTokenType.NullCoalesce,
	ConditionalTokenType.Or,
	ConditionalTokenType.And,
	ConditionalTokenType.StrictEqualityOperator
];

export class ConditionParser {
	readonly _NewLine = "\n";

	private inputChars: string[] = [];
	private tokens: IConditionalToken[] = [];
	private seedStart = 0;
	private seedLine = 0;
	private isParsingString = false;
	private isParsingTagExpression = false;
	private stringTerminator = '"';
	private currentSegment = '';
	private currentTagSegment = '';
	private currentStart = 0;
	private currentTagSegmentStart = 0;
	private currentIndex = 0;
	private offSetLines: Map<number, number> = new Map();
	private lineCache: Map<number, IDocumentLine> = new Map();

	setStartOffset(startLineNumber: number, startOffset: number) {
		this.seedLine = startLineNumber;
		this.seedStart = startOffset;
	}

	private pushToken(content: string, type: ConditionalTokenType, startIndex: number, endIndex: number) {
		let startLine = 0,
			endLine = 0;
		const startPosition = this.getLine(startIndex),
			endPosition = this.getLine(endIndex);

		if (startPosition != null) {
			startLine = startPosition.line;
		}

		if (endPosition != null) {
			endLine = endPosition.line;
		}

		startLine += this.seedLine;
		endLine += this.seedLine;

		this.tokens.push({
			content: content,
			type: type,
			end: this.seedStart + endIndex,
			start: this.seedStart + startIndex,
			endLine: endLine,
			startLine: startLine,
			context: null,
			modifiers: null
		});
	}

	private getLine(index: number): IPosition | null {
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

	private pushCurrent() {
		if (this.currentSegment.trim().length > 0) {

			this.pushToken(
				this.currentSegment,
				ConditionalTokenType.Literal,
				this.currentStart,
				this.currentIndex
			);

			this.currentSegment = '';
		}
	}

	parseText(text: string) {
		this.tokens = [];
		this.isParsingString = false;
		this.isParsingTagExpression = false;
		this.stringTerminator = '"';
		this.currentSegment = '';
		this.currentTagSegment = '';
		this.currentStart = 0;
		this.currentTagSegmentStart = 0;
		this.currentIndex = 0;
		this.offSetLines.clear();
		this.lineCache.clear();

		this.inputChars = text.replace(/(\r\n|\n|\r)/gm, "\n").split('');

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

		for (let i = 0; i < this.inputChars.length; i++) {
			this.currentIndex = i;

			const current = this.inputChars[i];
			let prev: string | null = null,
				next: string | null = null;

			if (i > 0) {
				prev = this.inputChars[i - 1];
			}

			if (i < this.inputChars.length) {
				next = this.inputChars[i + 1];
			}

			if (current == "'" || current == '"') {
				if (this.isParsingString && current == this.stringTerminator) {
					this.isParsingString = false;
					this.pushToken(this.currentSegment, ConditionalTokenType.String, this.currentStart, i);

					this.currentSegment = '';
					i += 1;
					this.currentStart = i;
					continue;
				}

				this.isParsingString = true;
				this.stringTerminator = current;

				if (this.currentSegment.trim().length > 0) {
					this.pushToken(this.currentSegment, ConditionalTokenType.Literal, this.currentStart, i);
				}

				this.currentStart = i;
				this.currentSegment = '';

				continue;
			} else if (this.isParsingString && current == '\\' && (next != null && next == this.stringTerminator)) {
				this.currentSegment += this.stringTerminator;
				i += 2;
				continue;
			} else if (this.isParsingString == false && current == '=' && (next != null && next == '=')) {
				this.pushCurrent();

				if ((i + 2) < this.inputChars.length && this.inputChars[i + 2] == '=') {
					this.currentSegment = '';
					this.pushToken('===', ConditionalTokenType.StrictEqualityOperator, this.currentStart, i + 2);
					this.currentStart = i + 3;

					i += 2;
					continue;
				}

				this.currentSegment = '';
				this.pushToken('==', ConditionalTokenType.EqualityComparison, this.currentStart, i + 1);
				this.currentStart = i + 1;

				i += 1;
				continue;
			} else if (this.isParsingString == false && current == '>' && (next != null && next == '=')) {
				this.pushCurrent();

				this.currentSegment = '';
				this.pushToken('>=', ConditionalTokenType.GreaterThanOrEqual, this.currentStart, i + 1);
				this.currentStart = i + 1;

				i += 1;
				continue;
			} else if (this.isParsingString == false && current == '<' && (next != null && next == '=')) {
				this.pushCurrent();

				this.currentSegment = '';
				this.pushToken('<=', ConditionalTokenType.LessThanOrEqual, this.currentStart, i + 1);
				this.currentStart = i + 2;

				i += 1;
				continue;
			} else if (this.isParsingString == false && current == '!' && (next != null && next == '=')) {
				this.pushCurrent();

				this.currentSegment = '';
				this.pushToken('!=', ConditionalTokenType.NotEqual, this.currentStart, i + 1);
				this.currentStart = i + 2;

				i += 1;
				continue;
			} else if (this.isParsingString == false && current == '?' && (next != null && next == ' ') && prev == ' ') {
				this.pushCurrent();

				this.currentSegment = '';
				this.pushToken('?', ConditionalTokenType.TernaryIf, this.currentStart, i + 1);
				this.currentStart = i + 1;

				continue;
			} else if (this.isParsingString == false && current == '|' && (next == null || (next != null && next != '|')) && prev != '|') {
				this.pushCurrent();

				this.currentSegment = '';
				this.pushToken('|', ConditionalTokenType.ModifierTrigger, this.currentStart, i + 1);
				this.currentStart = i + 1;

				continue;
			} else if (this.isParsingString == false && current == '?' && (next != null && next == '?') && prev == ' ') {
				this.pushCurrent();

				this.currentSegment = '';
				this.pushToken('??', ConditionalTokenType.NullCoalesce, this.currentStart, i + 1);
				this.currentStart = i;

				i += 1;
				continue;
			} else if (this.isParsingString == false && current == '|' && (next != null && next == '|') && prev == ' ') {
				this.pushCurrent();

				this.currentSegment = '';
				this.pushToken('||', ConditionalTokenType.Or, this.currentStart, i + 1);
				this.currentStart = i + 2;

				i += 1;
				continue;
			} else if (this.isParsingString == false && current == '&' && (next != null && next == '&') && prev == ' ') {
				this.pushCurrent();

				this.currentSegment = '';
				this.pushToken('&&', ConditionalTokenType.And, this.currentStart, i + 1);
				this.currentStart = i + 2;

				i += 1;
				continue;
			} else if (current == '{') {
				this.isParsingTagExpression = true;
				this.currentSegment += current;
				this.currentTagSegmentStart = i;
				this.currentTagSegment = '{';
			} else if (current == '}') {
				if (this.isParsingTagExpression) {
					this.currentTagSegment += '}';
					this.isParsingTagExpression = false;
					this.pushToken(this.currentTagSegment, ConditionalTokenType.TagExpression, this.currentTagSegmentStart, i);
					if (this.isParsingString == false) {
						this.currentSegment = '';
					}
				}
				continue;
			} else if (next == null) {
				this.currentSegment += current;
				this.pushCurrent();
			} else {
				if (this.isParsingTagExpression) {
					this.currentTagSegment += current;
				}

				if (this.isParsingString == false && current == ' ') {
					this.pushCurrent();

					this.currentStart = i + 1;
					continue;
				}

				this.currentSegment += current;
				this.currentIndex = i;
			}
		}

		this.analyzeConditionModifiers();
	}

	private analyzeConditionModifiers() {
		let tokenHistory: IConditionalToken[] = [],
			foundModifier = false;

		for (let i = 0; i < this.tokens.length; i++) {
			const token = this.tokens[i];

			if (Operators.includes(token.type)) {
				if (tokenHistory.length > 0) {
					this.parseModifiers(tokenHistory);
				}

				tokenHistory = [];
				foundModifier = false;
				continue;
			}

			if (token.type == ConditionalTokenType.ModifierTrigger) {
				foundModifier = true;
			}

			tokenHistory.push(token);
		}

		if (tokenHistory.length > 0) {
			this.parseModifiers(tokenHistory);
		}
	}

	private parseModifiers(tokens: IConditionalToken[]) {
		let mockedInnerContent = '';
		const constructionStartLine = tokens[0].startLine,
			constructionEndLine = tokens[tokens.length - 1].endLine,
			constructionStartOffset = tokens[0].start,
			constructionEndOffset = tokens[tokens.length - 1].end;

		for (let i = 0; i < tokens.length; i++) {
			mockedInnerContent += tokens[i].content;
		}

		const mockedSymbol = createSymbol(constructionStartLine, constructionEndLine, constructionStartOffset, constructionEndOffset, mockedInnerContent),
			modifierResults = analyzeModifiers(mockedSymbol),
			processedShorthandModifiers: ISymbolModifier[] = [],
			processedParamModifiers: ISymbolModifier[] = [],
			processedTokens: IConditionalToken[] = [];


		// Let's rewrite the lines and offsets.
		if (modifierResults.hasShorthandModifiers) {
			for (let i = 0; i < modifierResults.shorthandModifiers.length; i++) {
				const thisModifier = modifierResults.shorthandModifiers[i];

				if (processedShorthandModifiers.includes(thisModifier)) {
					continue;
				}

				processedShorthandModifiers.push(thisModifier);

				for (let j = 0; j < tokens.length; j++) {
					const thisToken = tokens[j];

					if (processedTokens.includes(thisToken)) {
						continue;
					}

					if (thisToken.content.trim() == thisModifier.content.trim()) {
						processedTokens.push(thisToken);

						thisModifier.startOffset = thisToken.start;
						thisModifier.endOffset = thisToken.end;
						thisModifier.line = thisToken.startLine;
						continue;
					}
				}
			}
		}

		if (modifierResults.hasParamModifiers) {
			for (let i = 0; i < modifierResults.paramModifiers.length; i++) {
				const thisModifier = modifierResults.paramModifiers[i];

				if (processedParamModifiers.includes(thisModifier)) {
					continue;
				}

				processedParamModifiers.push(thisModifier);

				for (let j = 0; j < tokens.length; j++) {
					const thisToken = tokens[j];

					if (processedTokens.includes(thisToken)) {
						continue;
					}

					if (thisToken.content.trim() == thisModifier.content.trim()) {
						processedTokens.push(thisToken);

						thisModifier.startOffset = thisToken.start;
						thisModifier.endOffset = thisToken.end;
						thisModifier.line = thisToken.startLine;
						continue;
					}
				}
			}
		}

		tokens[0].modifiers = modifierResults;
	}

	getTokens(): IConditionalToken[] {
		return this.tokens;
	}

	getTokenCount(): number {
		return this.tokens.length;
	}

	getToken(index: number): IConditionalToken {
		return this.tokens[index];
	}

}
