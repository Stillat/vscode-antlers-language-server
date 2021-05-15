import { trimLeft } from '../../../../utils/strings';
import { dynamicParameter, IAntlersParameter } from '../../../tagManager';
import { ISymbol } from '../../../types';

export function resolveConditionalParmaters(symbol: ISymbol, paramName: string): IAntlersParameter | null {
	let checkName = trimLeft(paramName, ':');

	if (checkName.includes(':')) {
		checkName = checkName.split(':')[0];
	}

	if (checkName == 'status' || checkName == 'taxonomy' || symbol.currentScope != null && symbol.currentScope.containsReference(checkName)) {
		return dynamicParameter(paramName);
	}

	return null;
}
