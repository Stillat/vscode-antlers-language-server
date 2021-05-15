import { getParameter, getParameterFromLists, ISymbol } from '../../../types';
import { HandleParams } from './parameterCompletions';

const IgnoreFormTagParts: string[] = [
	'set', 'create', 'errors', 'success',
	'submissions', 'submission'
];

export function getFormHandle(symbol: ISymbol): string {
	if (symbol.reference != null && 'tagPart' in symbol.reference) {
		const symbolRef = symbol.reference as ISymbol;

		if (symbolRef.tagPart == 'form:set') {
			return getFormHandle(symbolRef);
		}
	}

	const handleParam = getParameterFromLists(HandleParams, symbol);

	if (symbol.methodName != null && IgnoreFormTagParts.includes(symbol.methodName) == false) {
		return symbol.methodName;
	}

	if (typeof handleParam !== 'undefined' && handleParam !== null) {
		if (handleParam.isDynamicBinding == false && handleParam.containsInterpolation == false) {
			return handleParam.value;
		}
	}

	return '';
}
