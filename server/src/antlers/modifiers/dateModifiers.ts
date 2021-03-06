import { IModifier } from '../modifierTypes';

const dateModifiers: IModifier[] = [
    {
        name: 'days_ago',
        acceptsType: ['string', 'date'],
        returnsType: ['number'],
        description: 'Returns the number of days since a given date.',
        docLink: 'https://statamic.dev/modifiers/days_ago',
        parameters: [],
        canBeParameter: false
    },
    {
        name: 'format_translated',
        acceptsType: ['string', 'date'],
        returnsType: ['string', 'date'],
        description: 'Returns a formatted Carbon datetime/string.',
        docLink: 'https://statamic.dev/modifiers/format',
        parameters: [
            {
                name: 'format',
                description: 'The format to use.'
            }
        ],
        canBeParameter: true
    },
    {
        name: 'format',
        acceptsType: ['string', 'date'],
        returnsType: ['string', 'date'],
        description: 'Formats the date using the provided format using PHP\'s [date variables](https://www.php.net/date).',
        docLink: 'https://statamic.dev/modifiers/format',
        parameters: [
            {
                name: 'format',
                description: 'The format to use.'
            }
        ],
        canBeParameter: true
    },
    {
        name: 'format_localized',
        acceptsType: ['string', 'date'],
        returnsType: ['string', 'date'],
        description: 'Forms the date using server\'s locale, using PHP\'s [strftime format variables](https://www.php.net/strftime).',
        docLink: 'https://statamic.dev/modifiers/format_localized',
        parameters: [
            {
                name: 'format',
                description: 'The format to use.'
            }
        ],
        canBeParameter: true
    },
    {
        name: 'hours_ago',
        acceptsType: ['string', 'date'],
        returnsType: ['number'],
        description: 'Returns the number of hours since the date.',
        docLink: 'https://statamic.dev/modifiers/hours_ago',
        parameters: [],
        canBeParameter: false
    },
    {
        name: 'iso_format',
        acceptsType: ['string', 'date'],
        returnsType: ['string', 'date'],
        description: 'Formats the date using an ISO format.',
        docLink: 'https://statamic.dev/modifiers/iso_format',
        parameters: [
            {
                name: 'format',
                description: 'The format to use.'
            }
        ],
        canBeParameter: false
    },
    {
        name: 'minutes_ago',
        acceptsType: ['string', 'date'],
        returnsType: ['number'],
        description: 'Returns the number of minutes since the date.',
        docLink: 'https://statamic.dev/modifiers/minutes_ago',
        parameters: [],
        canBeParameter: false
    },
    {
        name: 'modify_date',
        acceptsType: ['string', 'date'],
        returnsType: ['string', 'date'],
        description: 'Alters the date by incrementing or decrementing it in a format accepted by PHP\'s [strtotime](https://www.php.net/strtotime) function.',
        docLink: 'https://statamic.dev/modifiers/modify_date',
        parameters: [],
        canBeParameter: true
    },
    {
        name: 'months_ago',
        acceptsType: ['string', 'date'],
        returnsType: ['number'],
        description: 'Returns the number of months since the date.',
        docLink: 'https://statamic.dev/modifiers/months_ago',
        parameters: [],
        canBeParameter: false
    },
    {
        name: 'relative',
        acceptsType: ['string', 'date'],
        returnsType: ['string'],
        description: 'Returns a human readable date difference.',
        docLink: 'https://statamic.dev/modifiers/relative',
        parameters: [
            {
                name: 'add_ago',
                description: 'Whether to add the relative suffix words at the end of the string.'
            }
        ],
        canBeParameter: false
    },
    {
        name: 'seconds_ago',
        acceptsType: ['string', 'date'],
        returnsType: ['number'],
        description: 'Returns the number of seconds since the date.',
        docLink: 'https://statamic.dev/modifiers/seconds_ago',
        parameters: [],
        canBeParameter: false
    },
    {
        name: 'timezone',
        acceptsType: ['string', 'date'],
        returnsType: ['string', 'date'],
        description: 'Applies a timezone to the date.',
        docLink: 'https://statamic.dev/modifiers/timezone',
        parameters: [
            {
                name: 'timezone',
                description: 'The timezone to apply.'
            }
        ],
        canBeParameter: false
    },
    {
        name: 'weeks_ago',
        acceptsType: ['string', 'date'],
        returnsType: ['number'],
        description: 'Returns the number of weeks since the date.',
        docLink: 'https://statamic.dev/modifiers/weeks_ago',
        parameters: [],
        canBeParameter: false
    },
    {
        name: 'years_ago',
        acceptsType: ['string', 'date'],
        returnsType: ['number'],
        description: 'Returns the number of years since the date.',
        docLink: 'https://statamic.dev/modifiers/years_ago',
        parameters: [],
        canBeParameter: false
    },

];

export { dateModifiers };
