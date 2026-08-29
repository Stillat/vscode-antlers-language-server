import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';
import { makeTagDoc } from '../../../documentation/utils.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { Scope } from '../../scope/scope.js';
import {
    EmptyCompletionResult,
    exclusiveResult,
    exclusiveResultList,
    IAntlersParameter,
    IAntlersTag,
    nonExclusiveResult,
} from '../../tagManager.js';
import { createDefinitionAlias } from '../alias.js';
import { returnDynamicParameter } from '../dynamicParameterResolver.js';
import { StructureTag } from './nav/nav.js';

const queryParameters: IAntlersParameter[] = [
    {
        name: 'sort',
        description: 'The field and direction used to sort the results.',
        aliases: [],
        acceptsVariableInterpolation: true,
        allowsVariableReference: true,
        expectsTypes: ['string'],
        isDynamic: false,
        isRequired: false,
    },
    {
        name: 'limit',
        description: 'The maximum number of results to return.',
        aliases: [],
        acceptsVariableInterpolation: false,
        allowsVariableReference: true,
        expectsTypes: ['number'],
        isDynamic: false,
        isRequired: false,
    },
    {
        name: 'offset',
        description: 'The number of results to skip.',
        aliases: [],
        acceptsVariableInterpolation: false,
        allowsVariableReference: true,
        expectsTypes: ['number'],
        isDynamic: false,
        isRequired: false,
    },
    {
        name: 'paginate',
        description: 'Whether the results should be paginated.',
        aliases: [],
        acceptsVariableInterpolation: false,
        allowsVariableReference: true,
        expectsTypes: ['boolean', 'number'],
        isDynamic: false,
        isRequired: false,
    },
    {
        name: 'as',
        description: 'The variable name used to expose the results.',
        aliases: [],
        acceptsVariableInterpolation: false,
        allowsVariableReference: false,
        expectsTypes: ['string'],
        isDynamic: false,
        isRequired: false,
    },
    {
        name: 'filter',
        description: 'The query scope used to filter the results.',
        aliases: ['query_scope'],
        acceptsVariableInterpolation: true,
        allowsVariableReference: true,
        expectsTypes: ['string'],
        isDynamic: false,
        isRequired: false,
    },
];

const CanTag: IAntlersTag = {
    tagName: 'can',
    hideFromCompletions: false,
    requiresClose: false,
    allowsContentClose: true,
    allowsArbitraryParameters: false,
    injectParentScope: false,
    introducedIn: null,
    parameters: [
        {
            name: 'permission',
            description: 'The permission the current user must have.',
            aliases: ['do'],
            acceptsVariableInterpolation: true,
            allowsVariableReference: true,
            expectsTypes: ['string', 'array'],
            isDynamic: false,
            isRequired: false,
        },
    ],
    resolveDocumentation: () => makeTagDoc(
        'can Tag',
        'The `can` tag renders its contents when the current user has the requested permission.',
        'https://statamic.dev/tags/can'
    ),
};

const ChildrenTag = createDefinitionAlias(StructureTag, 'children');
ChildrenTag.parameters = [
    ...StructureTag.parameters,
    {
        name: 'of',
        description: 'The URL whose direct children should be returned.',
        aliases: [],
        acceptsVariableInterpolation: true,
        allowsVariableReference: true,
        expectsTypes: ['string'],
        isDynamic: false,
        isRequired: false,
    },
];
ChildrenTag.resolveCompletionItems = () => EmptyCompletionResult;
ChildrenTag.resolveDocumentation = () => makeTagDoc(
    'children Tag',
    'The `children` tag returns the direct children of the current URL or a URL supplied with the `of` parameter.',
    'https://statamic.dev/tags/children'
);

const DictionaryTag: IAntlersTag = {
    tagName: 'dictionary',
    hideFromCompletions: false,
    requiresClose: true,
    allowsContentClose: false,
    allowsArbitraryParameters: true,
    injectParentScope: false,
    introducedIn: null,
    parameters: [
        {
            name: 'handle',
            description: 'The dictionary handle to query.',
            aliases: [],
            acceptsVariableInterpolation: true,
            allowsVariableReference: true,
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: false,
        },
        {
            name: 'search',
            description: 'A value used to search the dictionary options.',
            aliases: [],
            acceptsVariableInterpolation: true,
            allowsVariableReference: true,
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: false,
        },
        ...queryParameters,
    ],
    resolveDynamicParameter: returnDynamicParameter,
    resolveCompletionItems: (params: ISuggestionRequest) => {
        if (
            params.isPastTagPart == false &&
            (params.leftWord == 'dictionary' || params.leftWord == '/dictionary') &&
            params.leftChar == ':'
        ) {
            return nonExclusiveResult([
                'countries',
                'currencies',
                'file',
                'languages',
                'locales',
                'timezones',
            ].map((label): CompletionItem => ({ label, kind: CompletionItemKind.Field })));
        }

        return EmptyCompletionResult;
    },
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.addVariables([
            { name: 'value', dataType: 'string', sourceName: '*internal.dictionary', sourceField: null, introducedBy: node },
            { name: 'label', dataType: 'string', sourceName: '*internal.dictionary', sourceField: null, introducedBy: node },
        ]);

        return scope;
    },
    resolveDocumentation: () => makeTagDoc(
        'dictionary Tag',
        'The `dictionary` tag queries options from a registered dictionary.',
        'https://statamic.dev/tags/dictionary'
    ),
};

const GetSiteTag: IAntlersTag = {
    tagName: 'get_site',
    hideFromCompletions: false,
    requiresClose: false,
    allowsContentClose: true,
    allowsArbitraryParameters: false,
    injectParentScope: false,
    introducedIn: null,
    parameters: [
        {
            name: 'handle',
            description: 'The handle of the site to retrieve.',
            aliases: [],
            acceptsVariableInterpolation: true,
            allowsVariableReference: true,
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: false,
        },
        {
            name: 'as',
            description: 'The variable name used to expose the site data.',
            aliases: [],
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: false,
        },
    ],
    resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
        if (parameter.name == 'handle') {
            return exclusiveResultList(params.project.getSiteNames());
        }

        return null;
    },
    resolveCompletionItems: (params: ISuggestionRequest) => {
        if (
            params.isPastTagPart == false &&
            (params.leftWord == 'get_site' || params.leftWord == '/get_site') &&
            params.leftChar == ':'
        ) {
            return exclusiveResult(params.project.getSiteNames().map((label): CompletionItem => ({
                label,
                kind: CompletionItemKind.Field,
            })));
        }

        return EmptyCompletionResult;
    },
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.addVariables([
            { name: 'handle', dataType: 'string', sourceName: '*internal.site', sourceField: null, introducedBy: node },
            { name: 'name', dataType: 'string', sourceName: '*internal.site', sourceField: null, introducedBy: node },
            { name: 'locale', dataType: 'string', sourceName: '*internal.site', sourceField: null, introducedBy: node },
            { name: 'short_locale', dataType: 'string', sourceName: '*internal.site', sourceField: null, introducedBy: node },
            { name: 'url', dataType: 'string', sourceName: '*internal.site', sourceField: null, introducedBy: node },
        ]);

        return scope;
    },
    resolveDocumentation: () => makeTagDoc(
        'get_site Tag',
        'The `get_site` tag retrieves data for a specific site in a multisite installation.',
        'https://statamic.dev/tags/get_site'
    ),
};

const UsersTag: IAntlersTag = {
    tagName: 'users',
    hideFromCompletions: false,
    requiresClose: true,
    allowsContentClose: false,
    allowsArbitraryParameters: true,
    injectParentScope: false,
    introducedIn: null,
    parameters: [
        {
            name: 'group',
            description: 'The user groups to include.',
            aliases: [],
            acceptsVariableInterpolation: true,
            allowsVariableReference: true,
            expectsTypes: ['string', 'array'],
            isDynamic: false,
            isRequired: false,
        },
        {
            name: 'role',
            description: 'The user roles to include.',
            aliases: [],
            acceptsVariableInterpolation: true,
            allowsVariableReference: true,
            expectsTypes: ['string', 'array'],
            isDynamic: false,
            isRequired: false,
        },
        ...queryParameters,
    ],
    resolveDynamicParameter: returnDynamicParameter,
    resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
        if (parameter.name == 'group') {
            return exclusiveResultList(params.project.getUniqueUserGroupNames());
        }

        if (parameter.name == 'role') {
            return exclusiveResultList(params.project.getUniqueUserRoleNames());
        }

        return null;
    },
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.injectUserFields(node);

        return scope;
    },
    resolveDocumentation: () => makeTagDoc(
        'users Tag',
        'The `users` tag queries and loops over users.',
        'https://statamic.dev/tags/users'
    ),
};

export { CanTag, ChildrenTag, DictionaryTag, GetSiteTag, UsersTag };
