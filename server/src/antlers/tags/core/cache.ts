import { IProjectDetailsProvider } from '../../../projects/projectDetailsProvider';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import {
    exclusiveResultList,
    IAntlersParameter,
    IAntlersTag
} from "../../tagManager";
import { ICacheContext } from "./contexts/cacheContext";

const Cache: IAntlersTag = {
    tagName: "cache",
    hideFromCompletions: false,
    requiresClose: true,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    resovleParameterCompletionItems: (
        parameter: IAntlersParameter,
        params: ISuggestionRequest
    ) => {
        if (parameter.name == "scope") {
            return exclusiveResultList(["page", "site"]);
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
};

export default Cache;
