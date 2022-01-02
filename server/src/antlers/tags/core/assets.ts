import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { getAllAssetCompletions } from "../../../suggestions/project/assetCompletions";
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { Scope } from '../../scope/scope';
import {
    EmptyCompletionResult,
    exclusiveResult,
    IAntlersParameter,
    IAntlersTag,
} from "../../tagManager";
import { makeAssetVariables } from "../../variables/assetVariables";

const AssetContainerParameters: string[] = ["container", "id", "handle"];

const Assets: IAntlersTag = {
    tagName: "assets",
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
    injectParentScope: false,
    parameters: [
        {
            isRequired: false,
            name: "container",
            aliases: ["id", "handle"],
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            description: "The handle of the asset container",
            expectsTypes: ["string"],
            isDynamic: false,
        },
        {
            isRequired: false,
            name: "folder",
            aliases: [],
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            description: "Filters the resulting assets by specific folder",
            expectsTypes: ["string"],
            isDynamic: false,
        },
        {
            isRequired: false,
            name: "recursive",
            aliases: [],
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            description: "Returns all assets in all subdirectories",
            expectsTypes: ["boolean"],
            isDynamic: false,
        },
        {
            isRequired: false,
            name: "limit",
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            description: "Limits the total results",
            expectsTypes: ["number"],
            isDynamic: false,
        },
        {
            isRequired: false,
            name: "sort",
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            description: "Sort entries by any asset variable",
            expectsTypes: ["string", "array"],
            isDynamic: false,
        },
    ],
    resovleParameterCompletionItems: (
        parameter: IAntlersParameter,
        params: ISuggestionRequest
    ) => {
        if (AssetContainerParameters.includes(parameter.name)) {
            return exclusiveResult(getAllAssetCompletions(params.project));
        }

        return EmptyCompletionResult;
    },
    augmentScope: (symbol: AntlersNode, scope: Scope) => {
        scope.addVariables(makeAssetVariables(symbol));

        let containerName = "";

        if (symbol.name != null && symbol.name.getMethodName() != null) {
            containerName = symbol.name.getMethodName() as string;
        } else {
            const containerParam = symbol.findAnyParameter(AssetContainerParameters);

            if (containerParam != null && containerParam.containsSimpleValue()) {
                containerName = containerParam.value;
            }
        }

        if (containerName.length > 0) {
            scope.injectAssetContainer(symbol, containerName);
        }

        return scope;
    },
    resolveCompletionItems: (params: ISuggestionRequest) => {
        if (
            (params.leftWord == "assets" || params.leftWord == "/assets") &&
            params.leftChar == ":"
        ) {
            return exclusiveResult(getAllAssetCompletions(params.project));
        }
        return EmptyCompletionResult;
    },
};

export default Assets;
