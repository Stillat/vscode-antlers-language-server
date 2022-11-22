import { IAntlersParameter } from '../../tagManager';

const LocaleParameters: IAntlersParameter[] = [
    {
        isRequired: false,
        name: "id",
        description: "The ID of the content to localize.",
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
        description: "Sort by a site's key.",
        expectsTypes: ["string"],
        isDynamic: false,
    },
    {
        isRequired: false,
        name: "current_first",
        description: "When true, ensures that the current locale is first.",
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
    {
        isRequired: false,
        name: "collection_term_workaround",
        description: "Disables the behavior introduced in https://github.com/statamic/cms/pull/6466.",
        acceptsVariableInterpolation: true,
        aliases: [],
        allowsVariableReference: true,
        expectsTypes: ["boolean"],
        isDynamic: false,
    }
];

export { LocaleParameters };
