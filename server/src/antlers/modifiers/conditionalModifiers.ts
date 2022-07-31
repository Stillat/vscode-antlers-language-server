import { IModifier } from '../modifierTypes';

const conditionalModifiers: IModifier[] = [
    {
        name: 'contains_all',
        acceptsType: ['string'],
        returnsType: ['boolean'],
        description: 'Tests if a string contains all of the provided needles.',
        docLink: 'https://statamic.dev/modifiers/contains_all',
        parameters: [
            {
                name: 'needle',
                description: 'The string(s) to search for.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'contains_any',
        acceptsType: ['string'],
        returnsType: ['boolean'],
        description: 'Tests if a string contains all of the provided needles.',
        docLink: 'https://statamic.dev/modifiers/contains_any',
        parameters: [
            {
                name: 'needle',
                description: 'The string(s) to search for.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'ends_with',
        acceptsType: ['string'],
        returnsType: ['boolean'],
        description: 'Tests if a string ends with another string.',
        docLink: 'https://statamic.dev/modifiers/ends_with',
        parameters: [
            {
                name: 'value',
                description: 'The value to check against.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'has_lower_case',
        acceptsType: ['string'],
        returnsType: ['boolean'],
        description: 'Tests if the string contains any lowercase characters.',
        docLink: 'https://statamic.dev/modifiers/has_lower_case',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'has_upper_case',
        acceptsType: ['string'],
        returnsType: ['boolean'],
        description: 'Tests if the string contains any uppercase characters.',
        docLink: 'https://statamic.dev/modifiers/has_upper_case',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'in_array',
        acceptsType: ['array'],
        returnsType: ['boolean'],
        description: 'Tests if an array contains a specific value.',
        docLink: 'https://statamic.dev/modifiers/in_array',
        parameters: [
            {
                name: 'needle',
                description: 'The value(s) to search for.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_after',
        acceptsType: ['string', 'date'],
        returnsType: ['boolean'],
        description: 'Tests if the string contains only alphanumeric characters.',
        docLink: 'https://statamic.dev/modifiers/is_after',
        parameters: [
            {
                name: 'date',
                description: 'The date to compare to.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_alphanumeric',
        acceptsType: ['string'],
        returnsType: ['boolean'],
        description: 'Tests if the string contains only alphanumeric characters.',
        docLink: 'https://statamic.dev/modifiers/is_alphanumeric',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_before',
        acceptsType: ['string', 'date'],
        returnsType: ['boolean'],
        description: 'Tests if a date is before another date.',
        docLink: 'https://statamic.dev/modifiers/is_before',
        parameters: [
            {
                name: 'date',
                description: 'The date to compare to.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_between',
        acceptsType: ['string', 'date'],
        returnsType: ['boolean'],
        description: 'Tests if a date is between two other dates.',
        docLink: 'https://statamic.dev/modifiers/is_between',
        parameters: [
            {
                name: 'start_date',
                description: 'The start date to compare.'
            },
            {
                name: 'end_date',
                description: 'The end date to compare.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_blank',
        acceptsType: ['string'],
        returnsType: ['boolean'],
        description: 'Tests if the string contains only whitespace characters.',
        docLink: 'https://statamic.dev/modifiers/is_blank',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_email',
        acceptsType: ['string'],
        returnsType: ['boolean'],
        description: 'Tests if the string is a valid email address.',
        docLink: 'https://statamic.dev/modifiers/is_email',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_future',
        acceptsType: ['string', 'date'],
        returnsType: ['boolean'],
        description: 'Tests if the date is in the future.',
        docLink: 'https://statamic.dev/modifiers/is_future',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_json',
        acceptsType: ['string'],
        returnsType: ['boolean'],
        description: 'Tests if the string is valid JSON.',
        docLink: 'https://statamic.dev/modifiers/is_json',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_leap_year',
        acceptsType: ['string', 'date'],
        returnsType: ['boolean'],
        description: 'Tests if the date is a leap year.',
        docLink: 'https://statamic.dev/modifiers/is_leap_year',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_numeric',
        acceptsType: ['string', 'number'],
        returnsType: ['boolean'],
        description: 'Tests if the value is a number or numeric string.',
        docLink: 'https://statamic.dev/modifiers/is_numeric',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_past',
        acceptsType: ['string', 'date'],
        returnsType: ['boolean'],
        description: 'Tests if the date is in the past.',
        docLink: 'https://statamic.dev/modifiers/is_past',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_today',
        acceptsType: ['string', 'date'],
        returnsType: ['boolean'],
        description: 'Tests if the date is today.',
        docLink: 'https://statamic.dev/modifiers/is_today',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_uppercase',
        acceptsType: ['string'],
        returnsType: ['boolean'],
        description: 'Tests if the string contains only uppercase characters.',
        docLink: 'https://statamic.dev/modifiers/is_uppercase',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_url',
        acceptsType: ['string'],
        returnsType: ['boolean'],
        description: 'Tests if the string is a valid URL.',
        docLink: 'https://statamic.dev/modifiers/is_url',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_weekday',
        acceptsType: ['string', 'date'],
        returnsType: ['boolean'],
        description: 'Tests if the date is a week day.',
        docLink: 'https://statamic.dev/modifiers/is_weekday',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_weekend',
        acceptsType: ['string', 'date'],
        returnsType: ['boolean'],
        description: 'Tests if the date is a weekend day.',
        docLink: 'https://statamic.dev/modifiers/is_weekend',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_yesterday',
        acceptsType: ['string', 'date'],
        returnsType: ['boolean'],
        description: 'Tests if the date is yesterday.',
        docLink: 'https://statamic.dev/modifiers/is_yesterday',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_tomorrow',
        acceptsType: ['string', 'date'],
        returnsType: ['boolean'],
        description: 'Tests if the date is tomorrow.',
        docLink: null,
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'starts_with',
        acceptsType: ['string'],
        returnsType: ['boolean'],
        description: 'Tests if a value starts with the provided value.',
        docLink: 'https://statamic.dev/modifiers/starts_with',
        parameters: [
            {
                name: 'value',
                description: 'The value to test for.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
];

export { conditionalModifiers };
