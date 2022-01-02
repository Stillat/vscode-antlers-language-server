import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { exclusiveResult, IAntlersParameter, IAntlersTag } from '../../tagManager';
import { makeUserGroupSuggestions } from './user/permissionUtils';

const UserNotIn: IAntlersTag = {
    tagName: 'user:not_in',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
    injectParentScope: false,
    parameters: [
        {
            isRequired: true,
            acceptsVariableInterpolation: false,
            aliases: ['groups'],
            allowsVariableReference: false,
            name: 'group',
            description: 'The groups to check against',
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
    }
};

export default UserNotIn;
