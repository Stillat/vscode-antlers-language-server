import { makeTagDoc } from '../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { exclusiveResult, IAntlersParameter, IAntlersTag } from '../../tagManager.js';
import { makeUserGroupSuggestions } from './user/permissionUtils.js';

const UserNotIn: IAntlersTag = {
    tagName: 'user:not_in',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
    injectParentScope: false,
    introducedIn: null,
    parameters: [
        {
            isRequired: true,
            acceptsVariableInterpolation: false,
            aliases: ['groups'],
            allowsVariableReference: false,
            name: 'group',
            description: 'The groups to check against.',
            expectsTypes: ['string', 'array'],
            isDynamic: false
        }
    ],
    resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
        if (parameter.name == 'groups' || parameter.name == 'group') {
            if (params.context?.parameterContext != null) {
                return exclusiveResult(makeUserGroupSuggestions(params.context.parameterContext.parameter?.getArrayValue() ?? [], params.project));
            }
        }

        return null;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'user:not_in Tag',
            'The `user:not_in` tag can be used to check if the currently authenticated user does not belong to one or more user groups. When used as a tag pair, the tag contents will be rendered if the user does not belong to the specified groups.',
            'https://statamic.dev/tags/user-in#not-in'
        );
    }
};

export default UserNotIn;
