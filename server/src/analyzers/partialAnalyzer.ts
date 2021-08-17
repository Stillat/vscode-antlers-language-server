import { getParameter, ISymbol } from '../antlers/types';

export function getViewName(symbol:ISymbol) {
	if (symbol.name != 'partial') {
		return null;
	}

	let partialName = '';

	if (symbol.methodName != null && symbol.methodName.trim().length > 0) {
		partialName = symbol.methodName;
	} else {
		const srcParam = getParameter('src', symbol);

		if (srcParam != null) {
			partialName = srcParam.value;
		}
	}
	return partialName;
}
