import { IAntlersParameter } from '../../../tagManager.js';

const GetErrorsParameters: IAntlersParameter[] = [
    {
        name: "bag",
        description: "The error message bag to retrieve errors from.",
        aliases: [],
        acceptsVariableInterpolation: false,
        allowsVariableReference: false,
        expectsTypes: ['string'],
        isDynamic: false,
        isRequired: false
    }
];

export { GetErrorsParameters };
