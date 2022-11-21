import { IAntlersParameter } from '../../../tagManager';

const PartialParameters: IAntlersParameter[] = [
    {
        isRequired: false,
        name: "src",
        description: "The name of the partial view",
        acceptsVariableInterpolation: false,
        allowsVariableReference: false,
        aliases: [],
        expectsTypes: ["string"],
        isDynamic: false,
    },
    {
        isRequired: false,
        name: "when",
        description: "A condition to control whether the partial renders",
        allowsVariableReference: true,
        acceptsVariableInterpolation: false,
        aliases: [],
        expectsTypes: ['*'],
        isDynamic: false
    },
    {
        isRequired: false,
        name: "unless",
        description: "A condition to control whether the partial renders",
        allowsVariableReference: true,
        acceptsVariableInterpolation: false,
        aliases: [],
        expectsTypes: ['*'],
        isDynamic: false
    }
];

export { PartialParameters };
