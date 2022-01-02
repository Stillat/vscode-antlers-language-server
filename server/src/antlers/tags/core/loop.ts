import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { Scope } from '../../scope/scope';
import { IAntlersTag } from "../../tagManager";

const Loop: IAntlersTag = {
    tagName: "loop",
    hideFromCompletions: false,
    injectParentScope: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.addVariable({
            name: "value",
            dataType: "*",
            sourceName: "*internal.loop.value",
            sourceField: null,
            introducedBy: node,
        });

        return scope;
    },
    parameters: [
        {
            name: "times",
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            aliases: [],
            expectsTypes: ["number"],
            description: "The number of iterations",
            isRequired: false,
            isDynamic: false,
        },
        {
            name: "from",
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            aliases: [],
            expectsTypes: ["number"],
            description: "The value to start iterating from. Default 1",
            isRequired: false,
            isDynamic: false,
        },
        {
            name: "to",
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            aliases: [],
            expectsTypes: ["number"],
            description: "The value to stop iterating at",
            isRequired: false,
            isDynamic: false,
        },
    ],
};

const RangeTag: IAntlersTag = {
    tagName: "range",
    hideFromCompletions: false,
    injectParentScope: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.addVariable({
            name: "value",
            dataType: "*",
            sourceName: "*internal.loop.value",
            sourceField: null,
            introducedBy: node,
        });

        return scope;
    },
    parameters: [
        {
            name: "times",
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            aliases: [],
            expectsTypes: ["number"],
            description: "The number of iterations",
            isRequired: false,
            isDynamic: false,
        },
        {
            name: "from",
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            aliases: [],
            expectsTypes: ["number"],
            description: "The value to start iterating from. Default 1",
            isRequired: false,
            isDynamic: false,
        },
        {
            name: "to",
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            aliases: [],
            expectsTypes: ["number"],
            description: "The value to stop iterating at",
            isRequired: false,
            isDynamic: false,
        },
    ],
};

export { Loop, RangeTag };
