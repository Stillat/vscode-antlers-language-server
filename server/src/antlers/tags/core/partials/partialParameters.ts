import { IAntlersParameter } from '../../../tagManager.js';

const PartialParameters: IAntlersParameter[] = [
    {
        isRequired: false,
        name: "src",
        description: "The name of the partial view.",
        acceptsVariableInterpolation: false,
        allowsVariableReference: false,
        aliases: [],
        expectsTypes: ["string"],
        isDynamic: false,
    },
    {
        isRequired: false,
        name: "when",
        description: "A condition to control whether the partial renders. The partial will not render unless it receives a truthy value.",
        allowsVariableReference: true,
        acceptsVariableInterpolation: false,
        aliases: [],
        expectsTypes: ['*'],
        isDynamic: false
    },
    {
        isRequired: false,
        name: "unless",
        description: "A condition to control whether the partial renders. The partial will not render unless it receives a falsey value.",
        allowsVariableReference: true,
        acceptsVariableInterpolation: false,
        aliases: [],
        expectsTypes: ['*'],
        isDynamic: false
    }
];

export { PartialParameters };
