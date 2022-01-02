import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { EmptyCompletionResult, exclusiveResult, IAntlersParameter, IAntlersTag, ICompletionResult } from '../../tagManager';
import { getAllRolesSuggestions, makeUserRolesSuggestions } from './user/permissionUtils';

const Is: IAntlersTag = {
    tagName: 'is',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
    injectParentScope: false,
    parameters: [
        {
            isRequired: true,
            acceptsVariableInterpolation: false,
            aliases: ['roles'],
            allowsVariableReference: false,
            name: 'role',
            description: 'The roles to check against',
            expectsTypes: ['string', 'array'],
            isDynamic: false
        }
    ],
    resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
        if (parameter.name == 'roles' || parameter.name == 'role') {
            if (params.context?.parameterContext != null) {
                return exclusiveResult(makeUserRolesSuggestions(params.context.parameterContext.parameter?.getArrayValue() ?? [], params.project));

            }
        }

        return null;
    },
    resolveCompletionItems: (params: ISuggestionRequest): ICompletionResult => {
        if ((params.leftWord == 'is' || params.leftWord == '/is') && params.leftChar == ':') {
            return exclusiveResult(getAllRolesSuggestions(params.project));
        }

        return EmptyCompletionResult;
    }
};

export default Is;
