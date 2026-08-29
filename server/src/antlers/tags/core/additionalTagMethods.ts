import { makeTagDoc } from '../../../documentation/utils.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { Scope } from '../../scope/scope.js';
import { exclusiveResultList, IAntlersParameter, IAntlersTag } from '../../tagManager.js';
import { makeFieldsVariables } from '../../variables/forms/fieldsVariables.js';
import { makeGlideVariables } from '../../variables/glideVariables.js';
import { createDefinitionAlias } from '../alias.js';
import FormHandleParam from './form/formHandleParam.js';
import { GlideParameters, resolveGlideParameterCompletions } from './glideParameters.js';
import GlideDataUrl from './glideDataUrl.js';
import GetAllErrors from './getErrors/getAllErrors.js';
import TaxonomyParameters from './taxonomies/parameters.js';

const sourceParameter: IAntlersParameter = {
    name: 'src',
    description: 'The source file or entry point.',
    aliases: [],
    acceptsVariableInterpolation: true,
    allowsVariableReference: true,
    expectsTypes: ['string', 'array'],
    isDynamic: false,
    isRequired: true,
};

const providerParameter: IAntlersParameter = {
    name: 'provider',
    description: 'The OAuth provider to use.',
    aliases: ['for'],
    acceptsVariableInterpolation: true,
    allowsVariableReference: true,
    expectsTypes: ['string'],
    isDynamic: false,
    isRequired: true,
};

const FormFieldsTag: IAntlersTag = {
    tagName: 'form:fields',
    hideFromCompletions: false,
    requiresClose: true,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    injectParentScope: true,
    introducedIn: null,
    parameters: [
        FormHandleParam,
        {
            name: 'scope',
            description: 'A prefix applied to each field variable.',
            aliases: [],
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: false,
        },
        {
            name: 'get',
            description: 'A nested field handle to retrieve.',
            aliases: [],
            acceptsVariableInterpolation: true,
            allowsVariableReference: true,
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: false,
        },
        {
            name: 'only',
            description: 'A pipe-delimited list of fields to include.',
            aliases: [],
            acceptsVariableInterpolation: true,
            allowsVariableReference: true,
            expectsTypes: ['string', 'array'],
            isDynamic: false,
            isRequired: false,
        },
        {
            name: 'except',
            description: 'A pipe-delimited list of fields to exclude.',
            aliases: [],
            acceptsVariableInterpolation: true,
            allowsVariableReference: true,
            expectsTypes: ['string', 'array'],
            isDynamic: false,
            isRequired: false,
        },
    ],
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.addVariables(makeFieldsVariables(node));

        return scope;
    },
    resolveDocumentation: () => makeTagDoc(
        'form:fields Tag',
        'The `form:fields` tag loops over the renderable fields in the current form.',
        'https://statamic.dev/tags/form-fields'
    ),
};

const GlideGenerateTag: IAntlersTag = {
    tagName: 'glide:generate',
    hideFromCompletions: false,
    requiresClose: true,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    injectParentScope: false,
    introducedIn: null,
    parameters: GlideParameters,
    resovleParameterCompletionItems: resolveGlideParameterCompletions,
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.addVariables(makeGlideVariables(node));

        return scope;
    },
    resolveDocumentation: () => makeTagDoc(
        'glide:generate Tag',
        'The `glide:generate` tag generates an image and exposes its URL and dimensions inside the tag pair.',
        'https://statamic.dev/tags/glide'
    ),
};

const GlideDataUriTag = createDefinitionAlias(GlideDataUrl, 'glide:data_uri');
GlideDataUriTag.resolveDocumentation = () => makeTagDoc(
    'glide:data_uri Tag',
    'The `glide:data_uri` tag is an alias of `glide:data_url`.',
    'https://statamic.dev/tags/glide'
);

const ViteContentTag: IAntlersTag = {
    tagName: 'vite:content',
    hideFromCompletions: false,
    requiresClose: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    injectParentScope: false,
    introducedIn: null,
    parameters: [sourceParameter],
    resolveDocumentation: () => makeTagDoc(
        'vite:content Tag',
        'The `vite:content` tag returns the contents of a Vite-managed asset.',
        'https://statamic.dev/tags/vite'
    ),
};

const TaxonomyCountTag: IAntlersTag = {
    tagName: 'taxonomy:count',
    hideFromCompletions: false,
    requiresClose: false,
    allowsContentClose: false,
    allowsArbitraryParameters: true,
    injectParentScope: false,
    introducedIn: null,
    parameters: TaxonomyParameters,
    resolveDocumentation: () => makeTagDoc(
        'taxonomy:count Tag',
        'The `taxonomy:count` tag returns the number of matching taxonomy terms.',
        'https://statamic.dev/tags/taxonomy'
    ),
};

const ProtectPasswordFormTag: IAntlersTag = {
    tagName: 'protect:password_form',
    hideFromCompletions: false,
    requiresClose: true,
    allowsContentClose: false,
    allowsArbitraryParameters: true,
    injectParentScope: false,
    introducedIn: null,
    parameters: [],
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.addVariables([
            { name: 'errors', dataType: 'array', sourceName: '*internal.protect.password_form', sourceField: null, introducedBy: node },
            { name: 'error', dataType: 'string', sourceName: '*internal.protect.password_form', sourceField: null, introducedBy: node },
            { name: 'no_token', dataType: 'boolean', sourceName: '*internal.protect.password_form', sourceField: null, introducedBy: node },
            { name: 'invalid_token', dataType: 'boolean', sourceName: '*internal.protect.password_form', sourceField: null, introducedBy: node },
        ]);

        return scope;
    },
    resolveDocumentation: () => makeTagDoc(
        'protect:password_form Tag',
        'The `protect:password_form` tag renders the form used to unlock password-protected content.',
        'https://statamic.dev/protecting-content'
    ),
};

const OAuthLoginUrlTag: IAntlersTag = {
    tagName: 'oauth:login_url',
    hideFromCompletions: false,
    requiresClose: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    injectParentScope: false,
    introducedIn: null,
    parameters: [
        providerParameter,
        {
            name: 'redirect',
            description: 'The URL to visit after authentication.',
            aliases: [],
            acceptsVariableInterpolation: true,
            allowsVariableReference: true,
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: false,
        },
    ],
    resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
        if (parameter.name == 'provider' || parameter.name == 'for') {
            return exclusiveResultList(params.project.getOAuthProviders());
        }

        return null;
    },
    resolveDocumentation: () => makeTagDoc(
        'oauth:login_url Tag',
        'The `oauth:login_url` tag generates a login URL for an OAuth provider.',
        'https://statamic.dev/tags/oauth'
    ),
};

const OAuthDisconnectFormTag: IAntlersTag = {
    tagName: 'oauth:disconnect_form',
    hideFromCompletions: false,
    requiresClose: true,
    allowsContentClose: false,
    allowsArbitraryParameters: true,
    injectParentScope: false,
    introducedIn: null,
    parameters: [providerParameter],
    resovleParameterCompletionItems: OAuthLoginUrlTag.resovleParameterCompletionItems,
    resolveDocumentation: () => makeTagDoc(
        'oauth:disconnect_form Tag',
        'The `oauth:disconnect_form` tag renders a form that disconnects an OAuth provider from the current user.',
        'https://statamic.dev/tags/oauth'
    ),
};

const GetErrorAllTag = createDefinitionAlias(GetAllErrors, 'get_error:all');
GetErrorAllTag.resolveDocumentation = () => makeTagDoc(
    'get_error:all Tag',
    'The `get_error:all` tag retrieves every validation error message.',
    'https://statamic.dev/tags/get_errors'
);

export {
    FormFieldsTag,
    GetErrorAllTag,
    GlideDataUriTag,
    GlideGenerateTag,
    OAuthDisconnectFormTag,
    OAuthLoginUrlTag,
    ProtectPasswordFormTag,
    TaxonomyCountTag,
    ViteContentTag,
};
