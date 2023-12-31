import { IModifier } from '../modifierTypes.js';

const mathModifiers: IModifier[] = [
    {
        name: 'add',
        acceptsType: ['number'],
        returnsType: ['number'],
        forFieldType: [],
        description: 'Adds two values together.',
        docLink: 'https://statamic.dev/modifiers/add',
        parameters: [
            {
                name: 'value',
                description: 'The value to add.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: '+',
        acceptsType: ['number'],
        returnsType: ['number'],
        forFieldType: [],
        description: 'Adds two values together.',
        docLink: 'https://statamic.dev/modifiers/add',
        parameters: [
            {
                name: 'value',
                description: 'The value to add.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'ceil',
        acceptsType: ['number'],
        returnsType: ['number'],
        forFieldType: [],
        description: 'Rounds the value to the next whole number.',
        docLink: 'https://statamic.dev/modifiers/ceil',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'divide',
        acceptsType: ['number'],
        returnsType: ['number'],
        forFieldType: [],
        description: 'Divides two values.',
        docLink: 'https://statamic.dev/modifiers/divide',
        parameters: [
            {
                name: 'value',
                description: 'The value to divide.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'floor',
        acceptsType: ['number'],
        returnsType: ['number'],
        forFieldType: [],
        description: 'Rounds a number down to the next whole number.',
        docLink: 'https://statamic.dev/modifiers/floor',
        parameters: [],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'format_number',
        acceptsType: ['number'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Formats a number.',
        docLink: 'https://statamic.dev/modifiers/format_number',
        parameters: [
            {
                name: 'precision',
                description: 'Number of decimal places before rounding.'
            },
            {
                name: 'decimal_separator',
                description: 'The decimal separator (defaults to `.`).'
            },
            {
                name: 'thousands_separator',
                description: 'The thousands separator (default `,`).'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'mode',
        acceptsType: ['number'],
        returnsType: ['number'],
        forFieldType: [],
        description: '',
        docLink: '',
        parameters: [],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'multiply',
        acceptsType: ['number'],
        returnsType: ['number'],
        forFieldType: [],
        description: 'Multiplies two values.',
        docLink: 'https://statamic.dev/modifiers/multiply',
        parameters: [
            {
                name: 'value',
                description: 'The value to multiply.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: '*',
        acceptsType: ['number'],
        returnsType: ['number'],
        forFieldType: [],
        description: 'Multiplies two values.',
        docLink: 'https://statamic.dev/modifiers/multiply',
        parameters: [
            {
                name: 'value',
                description: 'The value to multiply.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'round',
        acceptsType: ['number'],
        returnsType: ['number'],
        forFieldType: [],
        description: 'Rounds a number to a specified precision.',
        docLink: 'https://statamic.dev/modifiers/round',
        parameters: [
            {
                name: 'precision',
                description: 'The number of digits after the decimal point.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'subtract',
        acceptsType: ['number'],
        returnsType: ['number'],
        forFieldType: [],
        description: 'Subtracts two values.',
        docLink: 'https://statamic.dev/modifiers/subtract',
        parameters: [
            {
                name: 'value',
                description: 'The value to subtract.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: '-',
        acceptsType: ['number'],
        returnsType: ['number'],
        forFieldType: [],
        description: 'Subtracts two values.',
        docLink: 'https://statamic.dev/modifiers/subtract',
        parameters: [
            {
                name: 'value',
                description: 'The value to subtract.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
];

export { mathModifiers };
