import { ISymbol } from '../antlers/types';

export function getVariableNames(symbols:ISymbol[]) : string[] {
	const namesToReturn:string[] = [];

	symbols.forEach((symbol:ISymbol) => {
		if (symbol.isTag || symbol.isClosingTag) {
			return;
		}
		
		if (symbol.methodName != null && symbol.methodName.trim().length > 0) {
			return;
		}

		if (symbol.tagPart.includes('[')) {
			return;
		}

		if (!namesToReturn.includes(symbol.tagPart) && symbol.tagPart != '#' && symbol.tagPart != 'slot') {
			namesToReturn.push(symbol.tagPart);
		}
	});

	return namesToReturn;
}
