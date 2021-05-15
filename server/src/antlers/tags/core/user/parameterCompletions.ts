import { getPermissionSuggestions } from '../../../../suggestions/permissionSuggestions';
import { getAbsoluteRoot, ISuggestionRequest } from '../../../../suggestions/suggestionManager';
import { exclusiveResult, IAntlersParameter, ICompletionResult } from '../../../tagManager';

export function resolveUserParameterCompletionItems(parameter: IAntlersParameter, params: ISuggestionRequest): ICompletionResult | null {
	const checkName = getAbsoluteRoot(parameter.name);

	if (params.activeParameter != null && ['do', 'permission'].includes(checkName)) {
		return exclusiveResult(getPermissionSuggestions(params.activeParameter.value, params));
	}

	return null;
}
