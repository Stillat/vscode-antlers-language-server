import { makeTagDocWithCodeSample } from '../../../documentation/utils.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { Scope } from '../../scope/scope.js';
import { IAntlersTag } from "../../tagManager.js";
import { makeAssetVariables } from "../../variables/assetVariables.js";

const Asset: IAntlersTag = {
    tagName: "asset",
    hideFromCompletions: false,
    requiresClose: true,
    injectParentScope: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    introducedIn: null,
    parameters: [
        {
            isRequired: true,
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            description: "The path to the file",
            expectsTypes: ["string"],
            isDynamic: false,
            name: "url",
        },
    ],
    augmentScope: (symbol: AntlersNode, scope: Scope) => {
        scope.addVariables(makeAssetVariables(symbol));

        return scope;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample('asset Tag',
            'The `asset` tag can be used to retrive Assets by supplying a URL.',
            `{{ asset url="/url/for/asset.png" }}
    <img src="{{ url }}" alt="{{ alt }}" />
{{ /asset }}`,
            'https://statamic.dev/tags/asset'
        );
    }
};

export default Asset;
