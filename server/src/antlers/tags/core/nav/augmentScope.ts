import { IBlueprintField, variablesToBlueprintFields } from '../../../../projects/blueprints/fields';
import { AntlersNode } from '../../../../runtime/nodes/abstractNode';
import { Scope } from '../../../scope/scope';
import { makeRoutableVariables } from "../../../variables/routeableVariables";

export function augmentNavScope(node: AntlersNode, scope: Scope): Scope {
    scope.addVariables([
        {
            name: "is_published",
            dataType: "boolean",
            sourceField: null,
            sourceName: "*internal.nav",
            introducedBy: node,
        },
        {
            name: "is_page",
            dataType: "boolean",
            sourceField: null,
            sourceName: "*internal.nav",
            introducedBy: node,
        },
        {
            name: "is_entry",
            dataType: "boolean",
            sourceField: null,
            sourceName: "*internal.nav",
            introducedBy: node,
        },
        {
            name: "has_entries",
            dataType: "boolean",
            sourceField: null,
            sourceName: "*internal.nav",
            introducedBy: node,
        },
        {
            name: "is_parent",
            dataType: "boolean",
            sourceField: null,
            sourceName: "*internal.nav",
            introducedBy: node,
        },
        {
            name: "is_current",
            dataType: "boolean",
            sourceField: null,
            sourceName: "*internal.nav",
            introducedBy: node,
        },
        {
            name: "is_external",
            dataType: "boolean",
            sourceField: null,
            sourceName: "*internal.nav",
            introducedBy: node,
        },
        {
            name: "depth",
            dataType: "number",
            sourceField: null,
            sourceName: "*internal.nav",
            introducedBy: node,
        },
        {
            name: "children",
            dataType: "array",
            sourceField: null,
            sourceName: "*internal.nav",
            introducedBy: node,
        },
        {
            name: "first",
            dataType: "boolean",
            sourceField: null,
            sourceName: "*internal.nav",
            introducedBy: node,
        },
        {
            name: "last",
            dataType: "boolean",
            sourceField: null,
            sourceName: "*internal.nav",
            introducedBy: node,
        },
        {
            name: "count",
            dataType: "integer",
            sourceField: null,
            sourceName: "*internal.nav",
            introducedBy: node,
        },
        {
            name: "index",
            dataType: "integer",
            sourceField: null,
            sourceName: "*internal.nav",
            introducedBy: node,
        },
    ]);

    // Check if in "nav" or "collection" mode and populate the values accordingly.
    const collectionNames = scope.statamicProject.getUniqueCollectionNames(),
        currentHandles: string[] = [];
    let isCollection = false;

    if (node.hasMethodPart()) {
        const nodeMethodName = node.getMethodNameValue().trim().toLowerCase();

        if (nodeMethodName.startsWith("collection:")) {
            const handleName = nodeMethodName.split(":").pop() as string;
            isCollection = true;
            currentHandles.push(handleName);
        } else if (nodeMethodName == "pages") {
            isCollection = true;
            currentHandles.push("pages");
        } else {
            isCollection = false;
            currentHandles.push(nodeMethodName);
        }
    } else {
        const handleParam = node.findParameter("handle");

        if (handleParam != null) {
            if (collectionNames.includes(handleParam.value)) {
                isCollection = true;
            } else {
                isCollection = false;
            }

            currentHandles.push(handleParam.value);
        }
    }

    if (isCollection) {
        const blueprintFields: IBlueprintField[] =
            scope.statamicProject.getBlueprintFields(currentHandles);

        scope.addBlueprintFields(node, blueprintFields);
        scope.expandScopedAliasScope(node, "page", "page", blueprintFields);
    } else {
        const blueprintFields: IBlueprintField[] = variablesToBlueprintFields(
            makeRoutableVariables(node)
        );

        scope.addBlueprintFields(node, blueprintFields);
        scope.expandScopedAliasScope(node, "page", "page", blueprintFields);
    }

    return scope;
}
