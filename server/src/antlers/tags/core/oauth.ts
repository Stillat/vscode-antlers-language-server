import { CompletionItem } from 'vscode-languageserver-types';
import { makeTagDocWithCodeSample } from '../../../documentation/utils.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { tagToCompletionItem } from '../../documentedLabel.js';
import { Scope } from '../../scope/scope.js';
import { EmptyCompletionResult, exclusiveResult, exclusiveResultList, IAntlersParameter, IAntlersTag } from '../../tagManager.js';
import { OAuthDisconnectFormTag, OAuthLoginUrlTag } from './additionalTagMethods.js';

const OAuthCompletionItems: CompletionItem[] = [
    tagToCompletionItem(OAuthLoginUrlTag),
    tagToCompletionItem(OAuthDisconnectFormTag),
];

const OAuth: IAntlersTag = {
    tagName: 'oauth',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: false,
    allowsContentClose: true,
    introducedIn: null,
    parameters: [{
        name: 'provider',
        description: 'The OAuth provider to be used.',
        aliases: [],
        isRequired: false,
        acceptsVariableInterpolation: true,
        allowsVariableReference: false,
        isDynamic: false,
        expectsTypes: ['string']
    }, {
        name: 'redirect',
        description: 'The URL to be redirected to after authenticating.',
        aliases: [],
        isRequired: false,
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
    resolveCompletionItems: (params: ISuggestionRequest) => {
        if (
            params.isPastTagPart == false &&
            (params.leftWord == 'oauth' || params.leftWord == '/oauth') &&
            params.leftChar == ':'
        ) {
            return exclusiveResult(OAuthCompletionItems);
        }

        return EmptyCompletionResult;
    },
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.addVariables([
            { name: 'name', dataType: 'string', sourceName: '*internal.oauth', sourceField: null, introducedBy: node },
            { name: 'label', dataType: 'string', sourceName: '*internal.oauth', sourceField: null, introducedBy: node },
            { name: 'connected', dataType: 'boolean', sourceName: '*internal.oauth', sourceField: null, introducedBy: node },
            { name: 'url', dataType: 'string', sourceName: '*internal.oauth', sourceField: null, introducedBy: node },
        ]);

        return scope;
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
