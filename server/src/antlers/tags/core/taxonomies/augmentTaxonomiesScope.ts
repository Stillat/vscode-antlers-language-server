import { AntlersNode } from '../../../../runtime/nodes/abstractNode';
import { Scope } from '../../../scope/scope';
import { makeContentVariables } from "../../../variables/contentVariables";
import { makeRoutableVariables } from "../../../variables/routeableVariables";
import { getTaxonomyNames } from "./utils";

export function augmentTaxonomyScope(node: AntlersNode, scope: Scope): Scope {
    const taxonomyNames = getTaxonomyNames(node, scope.statamicProject),
        fields = scope.statamicProject.getTaxonomyBlueprintFields(taxonomyNames),
        collectionParam = node.findParameter("collection");

    scope.addBlueprintFields(node, fields);
    scope.addVariables([
        {
            name: "first",
            dataType: "boolean",
            sourceName: "*internal.taxonomy",
            sourceField: null,
            introducedBy: node,
        },
        {
            name: "last",
            dataType: "boolean",
            sourceName: "*internal.taxonomy",
            sourceField: null,
            introducedBy: node,
        },
        {
            name: "count",
            dataType: "number",
            sourceName: "*internal.taxonomy",
            sourceField: null,
            introducedBy: node,
        },
        {
            name: "index",
            dataType: "number",
            sourceName: "*internal.taxonomy",
            sourceField: null,
            introducedBy: node,
        },
        {
            name: "total_results",
            dataType: "number",
            sourceName: "*internal.taxonomy",
            sourceField: null,
            introducedBy: node,
        },
        {
            name: "entries_count",
            dataType: "number",
            sourceName: "*internal.taxonomy",
            sourceField: null,
            introducedBy: node,
        },
    ]);
    scope.addVariables(makeRoutableVariables(node));

    if (typeof collectionParam !== "undefined" && collectionParam !== null) {
        const collectionNames = collectionParam.getArrayValue();

        if (collectionNames.length > 0) {
            const collectionFields =
                scope.statamicProject.getBlueprintFields(collectionNames),
                aliasScope = scope.introduceScopedAliasScope(
                    node,
                    "entries",
                    "entries",
                    collectionFields
                );

            aliasScope.addVariables(makeContentVariables(node));
        } else {
            scope.addVariableArray(
                "entries",
                makeRoutableVariables(node).concat(makeContentVariables(node))
            );
        }
    } else {
        scope.addVariableArray(
            "entries",
            makeRoutableVariables(node).concat(makeContentVariables(node))
        );
    }

    return scope;
}
