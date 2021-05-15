import { dynamicParameter, IAntlersParameter } from '../tagManager';
import { ISymbol } from '../types';

export function returnDynamicParameter(symbol: ISymbol, paramName: string): IAntlersParameter | null {
	if (paramName.trim().length > 0) {
		return dynamicParameter(paramName);
	}

	return null;
}
