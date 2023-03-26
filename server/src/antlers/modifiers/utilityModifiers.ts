import { IModifier } from '../modifierTypes';

const utilityModifiers: IModifier[] = [
    {
        name: 'console_log',
        acceptsType: ['*'],
        returnsType: ['null'],
        forFieldType: [],
        description: 'Displays variable data in the browser\'s JavaScript console.',
        docLink: 'https://statamic.dev/modifiers/console_log',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'decode',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Converts all HTML entities to their character codes.',
        docLink: 'https://statamic.dev/modifiers/decode',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'dump',
        acceptsType: ['*'],
        returnsType: ['null'],
        forFieldType: [],
        description: 'Displays variable data in the browser.',
        docLink: 'https://statamic.dev/modifiers/dump',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'full_urls',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Replaces root-relative URLs with absolute URLs.',
        docLink: 'https://statamic.dev/modifiers/full_urls',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'repeat',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Repeats a value a given number of times.',
        docLink: 'https://statamic.dev/modifiers/repeat',
        parameters: [{
            name: 'times',
            description: 'The number of times to repeat the value.'
        }],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'to_spaces',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Converts all tabs to spaces.',
        docLink: 'https://statamic.dev/modifiers/to_spaces',
        parameters: [
            {
                name: 'space_count',
                description: 'The number of spaces to replace tabs with.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'to_tabs',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Converts spaces to tabs.',
        docLink: 'https://statamic.dev/modifiers/to_tabs',
        parameters: [
            {
                name: 'space_count',
                description: 'The number of spaces to convert to tabs.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'to_json',
        acceptsType: ['*'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Converts the data to JSON',
        docLink: 'https://statamic.dev/modifiers/to_json',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'to_bool',
        acceptsType: ['*'],
        returnsType: ['boolean'],
        forFieldType: [],
        description: 'Converts the data to a boolean/truthy value.',
        parameters: [],
        canBeParameter: false,
        docLink: null,
        isDeprecated: false
    }
];

export { utilityModifiers };
