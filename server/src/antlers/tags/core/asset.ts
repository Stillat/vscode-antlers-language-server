import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { Scope } from '../../scope/scope';
import { IAntlersTag } from "../../tagManager";
import { makeAssetVariables } from "../../variables/assetVariables";

const Asset: IAntlersTag = {
    tagName: "asset",
    hideFromCompletions: false,
    requiresClose: true,
    injectParentScope: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
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
};

export default Asset;
