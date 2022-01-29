import { makeTagDocWithCodeSample } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { exclusiveResultList, IAntlersParameter, IAntlersTag } from '../../tagManager';

const OAuth: IAntlersTag = {
    tagName: 'oauth',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
	introducedIn: null,
    parameters: [{
        name: 'provider',
        description: 'The OAuth provider to be used',
        aliases: [],
        isRequired: true,
        acceptsVariableInterpolation: true,
        allowsVariableReference: false,
        isDynamic: false,
        expectsTypes: ['string']
    }, {
        name: 'redirect',
        description: 'The URL to be taken to after authenticating',
        aliases: [],
        isRequired: true,
        acceptsVariableInterpolation: true,
        allowsVariableReference: false,
        isDynamic: false,
        expectsTypes: ['string']
    }],
    resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
        if (parameter.name == 'provider') {
            return exclusiveResultList(params.project.getOAuthProviders());
        }

        return null;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample(
            'oauth Tag',
            'The `oauth` tag can be used to generate login URls for various third-party services.',
            `<a href="{{ oauth provider="github" }}">Sign In with Github</a>`,
            'https://statamic.dev/tags/oauth'
        );
    }
};

export default OAuth;
