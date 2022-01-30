import { IModifier } from '../modifierTypes';

const mathModifiers: IModifier[] = [
    {
        name: 'add',
        acceptsType: ['number'],
        returnsType: ['number'],
        description: 'Adds two values together.',
        docLink: 'https://statamic.dev/modifiers/add',
        parameters: [
            {
                name: 'value',
                description: 'The value to add.'
            }
        ],
        canBeParameter: true
    },
    {
        name: '+',
        acceptsType: ['number'],
        returnsType: ['number'],
        description: 'Adds two values together.',
        docLink: 'https://statamic.dev/modifiers/add',
        parameters: [
            {
                name: 'value',
                description: 'The value to add.'
            }
        ],
        canBeParameter: false
    },
    {
        name: 'ceil',
        acceptsType: ['number'],
        returnsType: ['number'],
        description: 'Rounds the value to the next whole number.',
        docLink: 'https://statamic.dev/modifiers/ceil',
        parameters: [],
        canBeParameter: false
    },
    {
        name: 'divide',
        acceptsType: ['number'],
        returnsType: ['number'],
        description: 'Divides two values.',
        docLink: 'https://statamic.dev/modifiers/divide',
        parameters: [
            {
                name: 'value',
                description: 'The value to divide.'
            }
        ],
        canBeParameter: true
    },
    {
        name: 'floor',
        acceptsType: ['number'],
        returnsType: ['number'],
        description: 'Rounds a number down to the next whole number.',
        docLink: 'https://statamic.dev/modifiers/floor',
        parameters: [],
        canBeParameter: true
    },
    {
        name: 'format_number',
        acceptsType: ['number'],
        returnsType: ['string'],
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
        canBeParameter: true
    },
    {
        name: 'mode',
        acceptsType: ['number'],
        returnsType: ['number'],
        description: '',
        docLink: '',
        parameters: [],
        canBeParameter: true
    },
    {
        name: 'multiply',
        acceptsType: ['number'],
        returnsType: ['number'],
        description: 'Multiplies two values.',
        docLink: 'https://statamic.dev/modifiers/multiply',
        parameters: [
            {
                name: 'value',
                description: 'The value to multiply.'
            }
        ],
        canBeParameter: true
    },
    {
        name: '*',
        acceptsType: ['number'],
        returnsType: ['number'],
        description: 'Multiplies two values.',
        docLink: 'https://statamic.dev/modifiers/multiply',
        parameters: [
            {
                name: 'value',
                description: 'The value to multiply.'
            }
        ],
        canBeParameter: false
    },
    {
        name: 'round',
        acceptsType: ['number'],
        returnsType: ['number'],
        description: 'Rounds a number to a specified precision.',
        docLink: 'https://statamic.dev/modifiers/round',
        parameters: [
            {
                name: 'precision',
                description: 'The number of digits after the decimal point.'
            }
        ],
        canBeParameter: true
    },
    {
        name: 'subtract',
        acceptsType: ['number'],
        returnsType: ['number'],
        description: 'Subtracts two values.',
        docLink: 'https://statamic.dev/modifiers/subtract',
        parameters: [
            {
                name: 'value',
                description: 'The value to subtract.'
            }
        ],
        canBeParameter: true
    },
    {
        name: '-',
        acceptsType: ['number'],
        returnsType: ['number'],
        description: 'Subtracts two values.',
        docLink: 'https://statamic.dev/modifiers/subtract',
        parameters: [
            {
                name: 'value',
                description: 'The value to subtract.'
            }
        ],
        canBeParameter: false
    },
];

export { mathModifiers };
