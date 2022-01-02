import { getPermissionSuggestions } from '../../../../suggestions/permissionSuggestions';
import { getAbsoluteRoot } from '../../../../suggestions/suggestionManager';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { exclusiveResult, IAntlersParameter, ICompletionResult } from '../../../tagManager';

export function resolveUserParameterCompletionItems(parameter: IAntlersParameter, params: ISuggestionRequest): ICompletionResult | null {
    const checkName = getAbsoluteRoot(parameter.name);

    if (params.context?.parameterContext != null && ['do', 'permission'].includes(checkName)) {
        return exclusiveResult(getPermissionSuggestions(params.context?.parameterContext.parameter?.value ?? '', params));
    }

    return null;
}
