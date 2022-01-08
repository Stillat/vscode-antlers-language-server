import { makeTagDocWithCodeSample } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';

const UserLogoutUrl: IAntlersTag = {
    tagName: 'user:logout_url',
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
        return makeTagDocWithCodeSample(
            'user:logout_url',
            'The `user:logout_url` tag can be used to retrieve the URL that will sign the current user out.',
            `<a href="{{ user:logout_url }}">Log out</a>`,
            'https://statamic.dev/tags/user-logout_url'
        );
    }
};

export default UserLogoutUrl;
