import { makeTagDoc } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';

const UserLogout: IAntlersTag = {
    tagName: 'user:logout',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    parameters: [{
        name: 'redirect',
        description: 'An optional URL to redirect the user after being logged out',
        aliases: [],
        isRequired: false,
        acceptsVariableInterpolation: true,
        allowsVariableReference: false,
        isDynamic: false,
        expectsTypes: ['string']
    }],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'user:logout Tag',
            'The `user:logout` tag will sign out the currently authenticated user. An optional `redirect` parameter may be used to redirect the visitor to a different page after being logged out.',
            'https://statamic.dev/tags/user-logout'
        );
    }
};

export default UserLogout;
