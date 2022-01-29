import { makeTagDoc } from '../../../documentation/utils';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { Scope } from '../../scope/scope';
import { IAntlersTag } from "../../tagManager";

const Loop: IAntlersTag = {
    tagName: "loop",
    hideFromCompletions: false,
    injectParentScope: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
	introducedIn: null,
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
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'loop Tag',
            'The `loop` tag is used to create an array of items between two values, and then iterate the created array. Alternatively, a max value can be set using the `times` parameter to loop that number of times.',
            'https://statamic.dev/tags/loop'
        );
    }
};

const RangeTag: IAntlersTag = {
    tagName: "range",
    hideFromCompletions: false,
    injectParentScope: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
	introducedIn: null,
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
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'range Tag',
            'The `range` tag is used to create an array of items between two values, and then iterate the created array. Alternatively, a max value can be set using the `times` parameter to loop that number of times.',
            'https://statamic.dev/tags/loop'
        );
    }
};

export { Loop, RangeTag };
