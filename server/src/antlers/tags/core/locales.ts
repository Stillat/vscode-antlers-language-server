import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { Scope } from '../../scope/scope';
import { IAntlersTag } from "../../tagManager";
import { makeLocaleVariables } from "../../variables/localeVariables";

const Locales: IAntlersTag = {
    tagName: "locales",
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    injectParentScope: false,
    requiresClose: true,
    parameters: [
        {
            isRequired: false,
            name: "id",
            description: "The ID of the content to localize",
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            expectsTypes: ["string"],
            isDynamic: false,
        },
        {
            isRequired: false,
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            name: "sort",
            description: "Sort by a sites key",
            expectsTypes: ["string"],
            isDynamic: false,
        },
        {
            isRequired: false,
            name: "current_first",
            description: "When true, ensures that the current locale is first",
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            expectsTypes: ["boolean"],
            isDynamic: false,
        },
        {
            isRequired: false,
            name: "all",
            description: "When true, all locale data will be returned.",
            acceptsVariableInterpolation: true,
            aliases: [],
            allowsVariableReference: true,
            expectsTypes: ["boolean"],
            isDynamic: false,
        },
        {
            isRequired: true,
            name: "self",
            description: "When true, the current locale will be included.",
            acceptsVariableInterpolation: true,
            aliases: [],
            allowsVariableReference: true,
            expectsTypes: ["boolean"],
            isDynamic: false,
        },
    ],
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.addVariableArray("locale", makeLocaleVariables(node));

        scope.addVariable({
            name: "current",
            dataType: "string",
            sourceField: null,
            sourceName: "*internal.locale",
            introducedBy: node,
        });
        scope.addVariable({
            name: "is_current",
            dataType: "boolean",
            sourceField: null,
            sourceName: "*internal.locale",
            introducedBy: node,
        });
        scope.addVariable({
            name: "exists",
            dataType: "boolean",
            sourceField: null,
            sourceName: "*internal.locale",
            introducedBy: node,
        });
        scope.addVariable({
            name: "permalink",
            dataType: "string",
            sourceField: null,
            sourceName: "*internal.locale",
            introducedBy: node,
        });

        return scope;
    },
};

export default Locales;
