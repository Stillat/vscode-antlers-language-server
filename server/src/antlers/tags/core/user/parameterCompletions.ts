import { getPermissionSuggestions } from '../../../../suggestions/permissionSuggestions.js';
import { getAbsoluteRoot } from '../../../../suggestions/suggestionManager.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { exclusiveResult, IAntlersParameter, ICompletionResult } from '../../../tagManager.js';

export function resolveUserParameterCompletionItems(parameter: IAntlersParameter, params: ISuggestionRequest): ICompletionResult | null {
    const checkName = getAbsoluteRoot(parameter.name);

    if (params.context?.parameterContext != null && ['do', 'permission'].includes(checkName)) {
        return exclusiveResult(getPermissionSuggestions(params.context?.parameterContext.parameter?.value ?? '', params));
    }

    return null;
}
