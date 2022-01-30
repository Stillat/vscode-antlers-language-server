import { AntlersNode } from '../../../../runtime/nodes/abstractNode';
import { checkSymbolForScopeAndAlias } from "../../../scope/factories/listFactory";
import { Scope } from '../../../scope/scope';
import { makeCollectionVariables } from "../../../variables/collectionVariables";
import { getCollectionBlueprintFields } from "./utils";

export function augmentCollectionScope(node: AntlersNode, scope: Scope): Scope {
    if (node.isClosingTag) {
        return scope;
    }

    if (node.hasMethodPart() && node.getMethodNameValue() != "count") {
        scope.addVariables(makeCollectionVariables(node));
    }

    if (node.reference != null) {
        const fields = getCollectionBlueprintFields(node, scope);

        checkSymbolForScopeAndAlias(node, scope, fields);
    }

    return scope;
}
