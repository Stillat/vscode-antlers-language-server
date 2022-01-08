import { IAntlersParameter } from '../../../tagManager';

const ThemePathParameters: IAntlersParameter[] = [
    {
        isRequired: true,
        acceptsVariableInterpolation: false,
        aliases: [],
        allowsVariableReference: true,
        name: 'src',
        description: 'The relative path to the file',
        expectsTypes: ['string'],
        isDynamic: false
    },
    {
        isRequired: false,
        acceptsVariableInterpolation: false,
        aliases: [],
        allowsVariableReference: true,
        name: 'cache_bust',
        description: 'Whether to output the last modified date',
        expectsTypes: ['boolean'],
        isDynamic: false
    },
    {
        isRequired: false,
        acceptsVariableInterpolation: false,
        aliases: [],
        allowsVariableReference: true,
        name: 'version',
        description: 'Whether to check a versioning manifest to produce the final URL',
        expectsTypes: ['boolean'],
        isDynamic: false
    },
    {
        isRequired: false,
        acceptsVariableInterpolation: false,
        aliases: [],
        allowsVariableReference: true,
        name: 'absolute',
        description: 'Generate absolute URLs or not',
        expectsTypes: ['boolean'],
        isDynamic: false
    },
    {
        isRequired: false,
        acceptsVariableInterpolation: false,
        aliases: [],
        allowsVariableReference: true,
        name: 'locale',
        description: 'The locale the path should be generated in',
        expectsTypes: ['string'],
        isDynamic: false
    }
];

export { ThemePathParameters };
