import { makeTagDocWithCodeSample } from '../../../documentation/utils';
import { IProjectDetailsProvider } from '../../../projects/projectDetailsProvider';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { exclusiveResultList, IAntlersParameter, IAntlersTag } from "../../tagManager";
import { ICacheContext } from "./contexts/cacheContext";

const Cache: IAntlersTag = {
    tagName: "cache",
    hideFromCompletions: false,
    requiresClose: true,
    injectParentScope: false,
    introducedIn: null,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    resovleParameterCompletionItems: (
        parameter: IAntlersParameter,
        params: ISuggestionRequest
    ) => {
        if (parameter.name == "scope") {
            return exclusiveResultList(["page", "site", "user"]);
        }

        return null;
    },
    parameters: [
        {
            isRequired: false,
            name: "for",
            description: "The duration the cache is valid for",
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            expectsTypes: ["string"],
            isDynamic: false,
        },
        {
            isRequired: false,
            name: "key",
            description: "An arbitrary name the cache entry may be referenced by",
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            expectsTypes: ["string"],
            isDynamic: false,
        },
        {
            isRequired: false,
            name: "scope",
            description: " The scope of the cached value. Either site or page.",
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            expectsTypes: ["string"],
            isDynamic: false,
        },
    ],
    resolveSpecialType: (node: AntlersNode, project: IProjectDetailsProvider) => {
        const keyParameter = node.findParameter("key");
        let cacheContext: ICacheContext | null = null;

        if (keyParameter != null) {
            const cacheKeyValue = keyParameter.value;

            if (cacheKeyValue.trim().length > 0) {
                cacheContext = {
                    key: cacheKeyValue,
                    reference: node,
                };
            }
        }

        return {
            context: cacheContext,
            issues: [],
        };
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample(
            'cache Tag',
            'The `cache` tag can be used to save the results of an expensive template operation. The duration of the cache can be configured.',
            `{{ cache for="10 minutes" }}
    {{# Template code that won't be re-rendered for at least 10 minutes. #}}
{{ /cache }}`,
            'https://statamic.dev/tags/cache'
        );
    }
};

export default Cache;
