import { IModifier } from '../modifierTypes';

const utilityModifiers: IModifier[] = [
    {
        name: 'console_log',
        acceptsType: ['*'],
        returnsType: ['null'],
        description: 'Displays variable data in the browser\'s JavaScript console.',
        docLink: 'https://statamic.dev/modifiers/console_log',
        parameters: [],
        canBeParameter: false
    },
    {
        name: 'decode',
        acceptsType: ['string'],
        returnsType: ['string'],
        description: 'Converts all HTML entities to their applicable character codes.',
        docLink: 'https://statamic.dev/modifiers/decode',
        parameters: [],
        canBeParameter: false
    },
    {
        name: 'dump',
        acceptsType: ['*'],
        returnsType: ['null'],
        description: 'Displays variable data in the browser.',
        docLink: 'https://statamic.dev/modifiers/dump',
        parameters: [],
        canBeParameter: false
    },
    {
        name: 'full_urls',
        acceptsType: ['string'],
        returnsType: ['string'],
        description: 'Replaces root-relative URLs with absolute URLs.',
        docLink: 'https://statamic.dev/modifiers/full_urls',
        parameters: [],
        canBeParameter: false
    },
    {
        name: 'repeat',
        acceptsType: ['string'],
        returnsType: ['string'],
        description: 'Repeats a value a given number of times.',
        docLink: 'https://statamic.dev/modifiers/repeat',
        parameters: [{
            name: 'repeat_count',
            description: 'The number of times to repeat the value.'
        }],
        canBeParameter: true
    },
    {
        name: 'to_spaces',
        acceptsType: ['string'],
        returnsType: ['string'],
        description: 'Converts all tabs to spaces.',
        docLink: 'https://statamic.dev/modifiers/to_spaces',
        parameters: [
            {
                name: 'space_count',
                description: 'The number of spaces to replace tabs with.'
            }
        ],
        canBeParameter: false
    },
    {
        name: 'to_tabs',
        acceptsType: ['string'],
        returnsType: ['string'],
        description: 'Converts spaces to tabs.',
        docLink: 'https://statamic.dev/modifiers/to_tabs',
        parameters: [
            {
                name: 'space_count',
                description: 'The number of spaces to convert to tabs.'
            }
        ],
        canBeParameter: false
    },
    {
        name: 'to_json',
        acceptsType: ['*'],
        returnsType: ['string'],
        description: 'Converts the data to JSON.',
        docLink: 'https://statamic.dev/modifiers/to_json',
        parameters: [],
        canBeParameter: false
    },
];

export { utilityModifiers };
