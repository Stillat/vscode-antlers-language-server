import { IAntlersParameter } from '../../tagManager';

const UserProfileParameters: IAntlersParameter[] = [
    {
        isRequired: false,
        acceptsVariableInterpolation: false,
        allowsVariableReference: true,
        aliases: [],
        name: "id",
        description: "The user ID to fetch.",
        expectsTypes: ["string"],
        isDynamic: false,
    },
    {
        isRequired: false,
        acceptsVariableInterpolation: false,
        allowsVariableReference: true,
        aliases: [],
        name: "email",
        description: "The email address to find the user by.",
        expectsTypes: ["string"],
        isDynamic: false,
    },
    {
        isRequired: false,
        acceptsVariableInterpolation: false,
        allowsVariableReference: true,
        aliases: [],
        name: "field",
        description: "The field to fetch the user by",
        expectsTypes: ["string"],
        isDynamic: false,
    },
    {
        isRequired: false,
        acceptsVariableInterpolation: false,
        allowsVariableReference: true,
        aliases: [],
        name: "value",
        description: "The value to search for.",
        expectsTypes: ["string"],
        isDynamic: false,
    },
];

export { UserProfileParameters };