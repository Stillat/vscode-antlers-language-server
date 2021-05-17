/* eslint-disable no-cond-assign */
import { Position } from 'vscode-languageserver-textdocument';
import { IModifier, ModifierManager } from './modifierManager';
import { IScopeVariable } from './scope/engine';
import { getParameters } from './tags/parameterFetcher';
import { getParameter, ISymbol } from './types';

const modifierRegex = /(?<!\|)\|([\sA-z][^|"}]*)/gm;

export interface ISymbolModifierCollection {
	/**
	 * Indicates if the collection has any valid modifiers.
	 */
	hasModifiers: boolean,
	/**
	 * Indicates if the collection contains parameter-style modifiers.
	 */
	hasParamModifiers: boolean,
	/**
	 * Indicates if the collection contains shorthand-style modifiers.
	 */
	hasShorthandModifiers: boolean,
	/**
	 * Indicates if the collection contains a mix of both modifier styles.
	 */
	hasMixedStyles: boolean,
	/**
	 * A collection of all modifiers, from both sources.
	 */
	modifiers: ISymbolModifier[],
	/**
	 * A collection of all parameter-style modifiers.
	 */
	paramModifiers: ISymbolModifier[],
	/**
	 * A collection of all shorthand-style modifiers.
	 */
	shorthandModifiers: ISymbolModifier[],
	/**
	 * The last modifier in the modifier call chain.
	 */
	trailingModifier: ISymbolModifier | null,
	/**
	 * The most specific return type from the last modifier in the call chain.
	 */
	manifestType: string
}

export interface ISymbolModifier {
	/**
	 * The parser content of the modifier.
	 */
	content: string,
	/**
	 * The source of the modifier instance.
	 * 
	 * Possible values are:
	 *     * shorthand
	 *     * parameter
	 */
	source: string,
	/**
	 * The parsed name of the modifier.
	 */
	name: string,
	/**
	 * The start offset of the modifier.
	 */
	startOffset: number,
	/**
	 * The end offset of the modifier.
	 */
	endOffset: number,
	/**
	 * The line the modifier appears on in the source document.
	 */
	line: number,
	/**
	 * Indicates if the modifier references a known registered modifier.
	 */
	hasRegisteredModifier: boolean,
	/**
	 * The modifier reference, if available.
	 */
	modifier: IModifier | null,
	/**
	 * A list of user-supplied arguments to the modifier.
	 */
	args: IModifierArgument[]
}

export interface IModifierArgument {
	/**
	 * The content of the modifier argument.
	 */
	content: string,
	/**
	 * The order in which the modifier appears in the call stack.
	 */
	order: number,
	/**
	 * The start offset of the modifier.
	 */
	startOffset: number,
	/**
	 * The end offset of the modifier,
	 */
	endOffset: number,
	/**
	 * The line the modifier appears on.
	 */
	line: number,
	/**
	 * The attached scope variable, if any.
	 */
	scopeVariable: IScopeVariable | null
}

export interface IActiveModifier {
	modifier: ISymbolModifier,
	activeParam: number | null
}

function getActiveParameter(position: Position, modifier: ISymbolModifier): number | null {
	const contentChars: string[] = modifier.content.split('');
	let isParsingString = false,
		stringTerminator = '"',
		currentParameterCount = 0;

	for (let i = 0; i < contentChars.length; i++) {
		const current = contentChars[i];
		let prev: string | null = null,
			next: string | null = null;

		if (i > 0) {
			prev = contentChars[i - 1];
		}

		if (i + 1 < contentChars.length) {
			next = contentChars[i + 1];
		}

		if (isParsingString == false) {
			if (current == '"' || current == "'") {
				isParsingString = true;
				stringTerminator = current;

				continue;
			}
		} else if (isParsingString == true && current == stringTerminator) {
			isParsingString = false;
			continue;
		}

		if ((current == ':') && isParsingString == false) {
			currentParameterCount += 1;

			if ((i + modifier.startOffset) >= position.character) {
				break;
			}
		}
	}

	if (currentParameterCount == 0) {
		return null;
	}

	return currentParameterCount - 1;
}

export function getActiveModifier(symbol: ISymbol, position: Position): IActiveModifier | null {
	if (symbol.modifiers == null) {
		return null;
	}

	for (let i = 0; i < symbol.modifiers.modifiers.length; i++) {
		const thisModifier = symbol.modifiers.modifiers[i];

		if (thisModifier.line == position.line) {
			const checkStart = thisModifier.startOffset,
				checkEnd = thisModifier.endOffset;

			if (position.character >= checkStart && position.character <= checkEnd) {
				const activeModifierParameter = getActiveParameter(position, thisModifier);

				return {
					activeParam: activeModifierParameter,
					modifier: thisModifier
				};
			}
		}
	}

	return null;
}

function analyzeContentForModifiers(symbol: ISymbol, contentToAnalyze: string, startOffset: number, source: string): ISymbolModifier[] {
	const modifiers: ISymbolModifier[] = [];
	let match: RegExpMatchArray | null = null,
		modifierOrder = 0;

	while (match = modifierRegex.exec(contentToAnalyze)) {
		if (typeof match[1] === 'undefined') {
			continue;
		}

		if (match.index != null) {
			if (contentToAnalyze.charAt(match.index - 1) == '|') {
				continue;
			}
		}

		const modifierStart = (match.index ?? 0) + startOffset,
			matchContent = match[1],
			chars = matchContent.split(''),
			args: IModifierArgument[] = [];

		let name = '',
			hasFoundName = false,
			modifierNameStart = -1,
			modifierNameEnd = -1,
			modifierEnd = - 1,
			contentStartOffset = - 1,
			argumentOrder = 0,
			currentPieces: string[] = [];

		for (let i = 0; i < chars.length; i++) {
			const cur = chars[i];
			let next: string | null = null;

			if ((i + 1) < chars.length) {
				next = chars[i + 1];
			}

			if (cur.trim().length == 0 && hasFoundName == false && currentPieces.length == 0) {
				continue;
			}

			if (hasFoundName == false && modifierNameStart == -1) {
				modifierNameStart = i + modifierStart;
			}

			if (next == null || (cur.trim().length == 0 && currentPieces.length > 0) || [':'].includes(cur)) {
				if (hasFoundName == false) {
					name = currentPieces.join('');
					modifierNameEnd = i + modifierStart;
					contentStartOffset = i;
					hasFoundName = true;
					currentPieces = [];
					modifierOrder += 1;
				} else {
					if (next == null) {
						currentPieces.push(cur);
					}

					const argName = currentPieces.join('');

					args.push({
						content: argName,
						endOffset: i + modifierStart,
						line: symbol.startLine,
						order: argumentOrder,
						startOffset: contentStartOffset + modifierStart + 1,
						scopeVariable: null
					});
					currentPieces = [];
					contentStartOffset = i;
					argumentOrder += 1;
					continue;
				}
			}

			if ([':'].includes(cur) == false) {
				currentPieces.push(cur);
			}

		}

		if (args.length > 0) {
			modifierEnd = args[args.length - 1].endOffset;
		} else {
			modifierEnd = modifierNameEnd;
		}
		const modifierReference = ModifierManager.getModifier(name),
			isRegistered = (modifierReference != null);

		modifiers.push({
			args: args,
			content: matchContent,
			endOffset: modifierEnd,
			hasRegisteredModifier: isRegistered,
			line: symbol.startLine,
			modifier: modifierReference,
			name: name,
			source: source,
			startOffset: modifierNameStart
		});

	}

	return modifiers;
}

function analyzeParamModifiers(symbol: ISymbol): ISymbolModifier[] {
	const modifierParam = getParameter('modifier', symbol);

	if (typeof modifierParam === 'undefined' || modifierParam === null) {
		return [];
	}

	let contentToAnalyze = modifierParam.value,
		wasModified = false;

	if (contentToAnalyze.startsWith('|') == false) {
		contentToAnalyze = '|' + contentToAnalyze;
		wasModified = true;
	}

	const modifiers = analyzeContentForModifiers(symbol, contentToAnalyze, modifierParam.contentStartsAt, 'parameter');

	if (wasModified) {
		for (let i = 0; i < modifiers.length; i++) {
			modifiers[i].startOffset -= 1;
			modifiers[i].endOffset -= 1;
		}
	}

	return modifiers;
}

export function getModifierStartOffset(content: string): number {
	let isParsingString = false,
		stringTerminator = '"';
	const contentChars: string[] = content.split('');

	for (let i = 0; i < contentChars.length; i++) {
		const current = contentChars[i];
		let prev: string | null = null,
			next: string | null = null;

		if (i > 0) {
			prev = contentChars[i - 1];
		}

		if (i + 1 < contentChars.length) {
			next = contentChars[i + 1];
		}

		if (isParsingString == false) {
			if (current == '"' || current == "'") {
				isParsingString = true;
				stringTerminator = current;

				continue;
			}
		} else if (isParsingString == true && current == stringTerminator) {
			isParsingString = false;
			continue;
		}

		if (current == '|' && isParsingString == false) {
			return i;
		}
	}

	return -1;
}

export function analyzeModifiers(symbol: ISymbol): ISymbolModifierCollection {
	let adjustedContent = symbol.parameterContent;

	if (adjustedContent.trim().length == 0) {
		adjustedContent = symbol.tagPart;
	}

	let contentToAnalyze = adjustedContent,
		paramModifiers: ISymbolModifier[] = [],
		shorthandModifiers: ISymbolModifier[] = [],
		hasModifiers = false,
		hasParamModifiers = false,
		hasShorthandModifiers = false,
		hasMixedStyles = false;
	const contentChars = contentToAnalyze.split(''),
		paramsInContext = getParameters(contentToAnalyze, 0);


	// Handles the case where the Antlers variable contains the "modifier" parameter.
	paramModifiers = analyzeParamModifiers(symbol);

	// If we have any parameters within our content to analyze, let's
	// just get rid of them completely. We want to preserve the
	// offsets - so instead of replacing them with an empty
	// string, we will fill their ranges with new spaces.
	for (let i = 0; i < paramsInContext.length; i++) {
		const param = paramsInContext[i];

		if (param.value == param.name) {
			continue;
		}

		for (let j = param.startOffset; j <= param.endOffset; j++) {
			contentChars[j] = ' ';
		}
	}

	contentToAnalyze = contentChars.join('');

	if (contentToAnalyze.trim().length > 0) {
		shorthandModifiers = analyzeContentForModifiers(symbol, contentToAnalyze, symbol.parameterContentStart, 'shorthand');
	}

	let allModifiers: ISymbolModifier[] = paramModifiers;

	allModifiers = allModifiers.concat(shorthandModifiers);

	if (paramModifiers.length > 0) {
		hasParamModifiers = true;
		hasModifiers = true;
	}

	if (shorthandModifiers.length > 0) {
		hasShorthandModifiers = true;
		hasModifiers = true;
	}

	if (hasShorthandModifiers && hasParamModifiers) {
		hasMixedStyles = true;
	}

	let trailingModifier: ISymbolModifier | null = null,
		lastEndOffset = -1,
		manifestType = '';

	for (let i = 0; i < allModifiers.length; i++) {
		if (allModifiers[i].endOffset > lastEndOffset) {
			trailingModifier = allModifiers[i];
			lastEndOffset = trailingModifier.endOffset;
		}
	}

	if (trailingModifier != null && trailingModifier.modifier != null) {
		if (trailingModifier.modifier.name == 'macro') {
			if (trailingModifier.args.length > 0) {
				manifestType = ModifierManager.getMacroManifestingType(trailingModifier.args[0].content.trim());
			}
		} else {
			manifestType = ModifierManager.getProbableReturnType(trailingModifier.modifier);
		}
	} else if (trailingModifier != null) {
		if (trailingModifier.name.trim() == 'macro' && trailingModifier.args.length > 0) {
			manifestType = ModifierManager.getMacroManifestingType(trailingModifier.args[0].content.trim());
		}
	}

	return {
		hasMixedStyles: hasMixedStyles,
		hasModifiers: hasModifiers,
		hasParamModifiers: hasParamModifiers,
		hasShorthandModifiers: hasShorthandModifiers,
		modifiers: allModifiers,
		paramModifiers: paramModifiers,
		shorthandModifiers: shorthandModifiers,
		manifestType: manifestType,
		trailingModifier: trailingModifier
	};
}
