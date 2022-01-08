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
];

export { PartialParameters };
