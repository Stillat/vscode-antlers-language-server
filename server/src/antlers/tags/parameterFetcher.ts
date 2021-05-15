/* eslint-disable no-cond-assign */
import { paginatedRegex } from '../../patterns';
import { assertMatchIs, trimLeft, trimRight } from '../../utils/strings';
import { getModifierStartOffset } from '../modifierAnalyzer';
import { ModifierManager } from '../modifierManager';
import { IParameterAttribute, IVariableInterpolation } from '../tagManager';
import { ISymbol } from '../types';

const attributeRegex = new RegExp('[\\s\\r\\t\\n:]([a-z0-9\\-_:]+)[\\s\\r\\t\\n]*=[\\s\\r\\t\\n]*([\'"])((?:\\\\\\2|(?!\\2).)*)\\2', 'ig');
const interpolationRegex = new RegExp('{([a-z0-9\\-_|:,]+)}', 'ig');

export function getIsPaginated(symbol: ISymbol): boolean {
	return assertMatchIs(paginatedRegex, symbol.content, 1, 'true');
}

function getVariableInterpolation(value: string, parameter: IParameterAttribute): IVariableInterpolation[] {
	const interpolations: IVariableInterpolation[] = [];
	let match: RegExpMatchArray | null = null;

	while (match = interpolationRegex.exec(value)) {
		const offset = parameter.contentStartsAt + (match.index ?? 0),
			endOffset = offset + match[0].length,
			value = match[1];

		interpolations.push({
			endOffset: endOffset,
			startOffset: offset,
			value: value,
			symbols: []
		});
	}

	if (value == '{}' && interpolations.length == 0) {
		interpolations.push({
			startOffset: parameter.contentStartsAt - 1,
			endOffset: parameter.contentStartsAt + 1,
			symbols: [],
			value: value
		});
	}

	return interpolations;
}

export function getParameterValue(parameterAttribute: IParameterAttribute | undefined | null, defaultValue: string): string {
	if (typeof parameterAttribute !== 'undefined' && parameterAttribute !== null) {
		return parameterAttribute.value;
	}

	return defaultValue;
}

export function getParameterArrayValue(parameterAttribute: IParameterAttribute | undefined | null): string[] {
	if (typeof parameterAttribute !== 'undefined' && parameterAttribute !== null) {
		return parameterAttribute.value.split('|');
	}

	return [];
}

function getFlagParameters(contents: string, startOffset: number): IParameterAttribute[] {
	let currentSegment = '';
	const inputChars = contents.split(''),
		discoveredAttributes: IParameterAttribute[] = [],
		modifierStartOffset = getModifierStartOffset(contents);

	for (let i = 0; i < inputChars.length; i++) {
		const current = inputChars[i];
		let prev: string | null = null,
			next: string | null = null;

		currentSegment += current;

		if (i > 0) {
			prev = inputChars[i - 1];
		}

		if ((i + 1) < inputChars.length) {
			next = inputChars[i + 1];
		}

		if (current == ' ' || current == '}') {
			if (currentSegment.includes('=') || currentSegment.includes('"') || currentSegment.includes("'")) {
				currentSegment = '';
				continue;
			}

			if (currentSegment.trim().length > 0) {
				const paramEnd = i - 1,
					adjustContent = trimRight(currentSegment, ' '),
					trimDelta = currentSegment.length - adjustContent.length,
					paramStart = paramEnd - adjustContent.length;


				if (paramStart < modifierStartOffset && adjustContent.trim() != '|') {
					const modifierRef = ModifierManager.getRegisteredModifier(adjustContent.trim());

					discoveredAttributes.push({
						containsInterpolation: false,
						contentStartsAt: paramStart + startOffset,
						endOffset: paramEnd + startOffset - trimDelta,
						interpolations: [],
						isCompound: false,
						isDynamicBinding: false,
						name: adjustContent.trim(),
						startOffset: paramStart + startOffset,
						value: adjustContent.trim(),
						isModifier: (modifierRef != null),
						modifier: modifierRef
					});
				}

				currentSegment = '';
				continue;
			}
		}
	}

	return discoveredAttributes;
}

export function getParameters(contents: string, startOffset: number): IParameterAttribute[] {
	let results: IParameterAttribute[] = [];
	let match: RegExpMatchArray | null = null;

	while (match = attributeRegex.exec(contents)) {
		// Calculate the offset in the document.
		let isDynamicBinding = false;
		const containsInterpolation = false,
			offset = startOffset + (match.index ?? 0) - 1,
			endOffset = offset + match[0].length - 2,
			contentStartsAt = offset + match[1].trim().length + 2,
			analysisName = trimLeft(match[1], ':'),
			isCompound = analysisName.includes(':');

		if (match[0] != null) {
			const trimmedInput = match[0].trim();

			if (trimmedInput.startsWith(':')) {
				isDynamicBinding = true;
			}
		}

		const lookupName = match[1].trim(),
			modifierRef = ModifierManager.getRegisteredModifier(lookupName);

		const parameter: IParameterAttribute = {
			name: match[1],
			value: match[3],
			isCompound: isCompound,
			endOffset: endOffset,
			contentStartsAt: contentStartsAt,
			startOffset: offset,
			isDynamicBinding: isDynamicBinding,
			containsInterpolation: containsInterpolation,
			interpolations: [],
			isModifier: (modifierRef != null),
			modifier: modifierRef
		};

		const variableInterpolations = getVariableInterpolation(match[3], parameter);

		parameter.interpolations = variableInterpolations;

		if (variableInterpolations.length > 0) {
			parameter.containsInterpolation = true;
		}

		results.push(parameter);
	}

	const flagParameters = getFlagParameters(contents, startOffset);

	if (flagParameters.length > 0) {
		results = results.concat(flagParameters);
	}

	return results;
}
