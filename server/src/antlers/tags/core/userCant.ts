import { makeTagDoc } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';
import { resolveUserParameterCompletionItems } from './user/parameterCompletions';

const UserCant: IAntlersTag = {
    tagName: 'user:cant',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: false,
    allowsContentClose: true,
    resovleParameterCompletionItems: resolveUserParameterCompletionItems,
    parameters: [
        {
            name: 'do',
            acceptsVariableInterpolation: false,
            aliases: ['permission'],
            allowsVariableReference: false,
            description: 'The permissions to check against',
            expectsTypes: ['string'],
            isRequired: true,
            isDynamic: false
        }
    ],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'user:cant Tag',
            'The `user:cant` tag is used to check if the currently authenticated user does not have a specific set of permissions. When used as a tag pair, the tag contents will only be rendered if the user does not have the specified permissions.',
            'https://statamic.dev/tags/user-can#cant'
        );
    }
};

export default UserCant;
