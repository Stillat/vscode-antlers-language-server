import { makeTagDoc } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { exclusiveResult, IAntlersParameter, IAntlersTag } from '../../tagManager';
import { makeUserGroupSuggestions } from './user/permissionUtils';

const UserIn: IAntlersTag = {
    tagName: 'user:in',
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
            'user:in Tag',
            'The `user:in` tag can be used to check if the currently authenticated user belongs to one or more user groups. When used as a tag pair, the tag contents will only be rendered if the user belongs to the specified groups.',
            'https://statamic.dev/tags/user-in'
        );
    }
};

export default UserIn;
