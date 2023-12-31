import { IBlueprintField, variablesToBlueprintFields } from '../../../projects/blueprints/fields.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { makeLoopVariables } from "../../variables/loopVariables.js";
import { Scope } from '../scope.js';

/**
 * Analyzes the provided node for "as" and "scope" parameters and applies them to the reference scope.
 * @param node The node to analyze
 * @param scope The reference scope.
 * @param fields The reference fields.
 */
export function checkSymbolForScopeAndAlias(node: AntlersNode, scope: Scope, fields: IBlueprintField[] | undefined | null) {
    if (typeof fields === "undefined" || fields === null) {
        return;
    }

    const aliasParam = node.findParameter("as"),
        scopeParam = node.findParameter("scope");

    fields = fields.concat(variablesToBlueprintFields(makeLoopVariables(node)));

    if (aliasParam != null && scopeParam != null) {
        scope.introduceScopedAliasScope(
            node,
            scopeParam.value,
            aliasParam.value,
            fields
        );
    } else if (aliasParam != null) {
        scope.introduceAliasScope(node, aliasParam.value, fields);
    } else if (scopeParam != null) {
        scope.introduceDynamicScopeList(node, scopeParam.value, fields);
    } else {
        scope.addBlueprintFields(node, fields);
    }
}
