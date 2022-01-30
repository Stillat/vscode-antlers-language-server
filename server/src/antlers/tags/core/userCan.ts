import { makeTagDoc } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';
import { resolveUserParameterCompletionItems } from './user/parameterCompletions';

const UserCan: IAntlersTag = {
    tagName: 'user:can',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: false,
    allowsContentClose: true,
    introducedIn: null,
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
            'user:can Tag',
            'The `user:can` tag is used to check if the currently authenticated user has a specific set of permissions. When used as a tag pair, the tag contents will only be rendered if the user has the specified permissions.',
            'https://statamic.dev/tags/user-can'
        );
    }
};

export default UserCan;
