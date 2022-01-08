import { makeTagDoc } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { exclusiveResult, IAntlersParameter, IAntlersTag } from '../../tagManager';
import { makeUserRolesSuggestions } from './user/permissionUtils';

const UserIs: IAntlersTag = {
    tagName: 'user:is',
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
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'user:is Tag',
            'The `user:is` tag can be used to check whether the currently authenticated user has one or more roles.',
            'https://statamic.dev/tags/user-is'
        );
    }
};

export default UserIs;
