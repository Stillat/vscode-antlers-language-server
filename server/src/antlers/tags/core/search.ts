import { CompletionItem } from "vscode-languageserver-types";
import { makeTagDoc } from '../../../documentation/utils';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { tagToCompletionItem } from '../../documentedLabel';
import { Scope } from '../../scope/scope';
import { IScopeVariable } from '../../scope/types';
import { 
    EmptyCompletionResult,
    exclusiveResultList,
    IAntlersParameter,
    IAntlersTag,
    nonExclusiveResult,
} from "../../tagManager";


const SearchResultsTag: IAntlersTag = {
    tagName: "search:results",
    allowsArbitraryParameters: false,
    requiresClose: true,
    allowsContentClose: false,
    hideFromCompletions: false,
    injectParentScope: false,
    introducedIn: null,
    parameters: [
        {
            name: "index",
            description: "The index to search in.",
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: true,
            expectsTypes: ["string"],
            isDynamic: false,
            isRequired: false,
        },
        {
            name: "query",
            description: "The query string parameter to use.",
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: true,
            expectsTypes: ["string"],
            isDynamic: false,
            isRequired: false,
        },
        {
            name: "limit",
            description: "The maximum number of search results to return.",
            allowsVariableReference: false,
            acceptsVariableInterpolation: false,
            aliases: [],
            isRequired: false,
            isDynamic: false,
            expectsTypes: ["number"],
        },
        {
            name: "offset",
            description: "The number of results to skip.",
            allowsVariableReference: false,
            acceptsVariableInterpolation: false,
            aliases: [],
            isRequired: false,
            isDynamic: false,
            expectsTypes: ["number"],
        },
        {
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            aliases: null,
            description: "Sets whether or not to paginate entry results.",
            expectsTypes: ["boolean"],
            isRequired: false,
            name: "paginate",
            isDynamic: false,
        },
        {
            name: "as",
            description: "Specifies an alias for search results.",
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            expectsTypes: ["string"],
            isDynamic: false,
            isRequired: false,
        },
        {
            name: "supplement_data",
            description: "Controls whether non-indexed fields are returned.",
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            aliases: [],
            expectsTypes: ["boolean"],
            isDynamic: false,
            isRequired: false,
        },
    ],
    resovleParameterCompletionItems: (
        parameter: IAntlersParameter,
        params: ISuggestionRequest
    ) => {
        if (parameter.name == "index") {
            return exclusiveResultList(params.project.getSearchIndexes());
        }

        return null;
    },
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.addVariables([
            {
                name: "no_results",
                dataType: "boolean",
                sourceField: null,
                sourceName: "*internal.search.results",
                introducedBy: node,
            },
            {
                name: "total_results",
                dataType: "number",
                sourceField: null,
                sourceName: "*internal.search.results",
                introducedBy: node,
            },
        ]);

        const asParam = node.findParameter("as");

        if (asParam != null && asParam.value.trim().length > 0) {
            scope.addVariableArray(
                asParam.value,
                makeDefaultSearchResultVariables(node)
            );
        } else {
            scope.addVariables(makeDefaultSearchResultVariables(node));
        }

        return scope;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'search:results Tag',
            'The `search:results` tag provides access to all data that was returned as a result of a user\'s search.',
            'https://statamic.dev/tags/search'
        );
    }
};

const SearchCompletionItems: CompletionItem[] = [
    tagToCompletionItem(SearchResultsTag)
];

function makeDefaultSearchResultVariables(node: AntlersNode): IScopeVariable[] {
    return [
        {
            name: "url",
            dataType: "string",
            sourceField: null,
            sourceName: "*internal.search.results",
            introducedBy: node,
        },
        {
            name: "title",
            dataType: "string",
            sourceField: null,
            sourceName: "*internal.search.results",
            introducedBy: node,
        },
        {
            name: "content",
            dataType: "string",
            sourceField: null,
            sourceName: "*internal.search.results",
            introducedBy: node,
        },
        {
            name: "first",
            dataType: "boolean",
            sourceField: null,
            sourceName: "*internal.search.results",
            introducedBy: node,
        },
        {
            name: "last",
            dataType: "boolean",
            sourceField: null,
            sourceName: "*internal.search.results",
            introducedBy: node,
        },
        {
            name: "is_entry",
            dataType: "boolean",
            sourceField: null,
            sourceName: "*internal.search.results",
            introducedBy: node,
        },
        {
            name: "is_term",
            dataType: "boolean",
            sourceField: null,
            sourceName: "*internal.search.results",
            introducedBy: node,
        },
        {
            name: "count",
            dataType: "number",
            sourceField: null,
            sourceName: "*internal.search.results",
            introducedBy: node,
        },
        {
            name: "index",
            dataType: "number",
            sourceField: null,
            sourceName: "*internal.search.results",
            introducedBy: node,
        },
        {
            name: "search_score",
            dataType: "number",
            sourceField: null,
            sourceName: "*internal.search.results",
            introducedBy: node,
        },
        {
            name: "_highlightResult",
            dataType: "array",
            sourceField: null,
            sourceName: "*internal.search.results",
            introducedBy: node,
        },
    ];
}

const BaseSearchTag: IAntlersTag = {
    tagName: "search",
    allowsArbitraryParameters: false,
    requiresClose: true,
    allowsContentClose: false,
    hideFromCompletions: false,
    injectParentScope: false,
    introducedIn: null,
    parameters: [],
    resolveCompletionItems: (params: ISuggestionRequest) => {
        if (
            params.isPastTagPart == false &&
            (params.leftWord == "search" || params.leftWord == "/search") &&
            params.leftChar == ":"
        ) {
            return nonExclusiveResult(SearchCompletionItems);
        }

        return EmptyCompletionResult;
    },
};

export { BaseSearchTag, SearchResultsTag };
