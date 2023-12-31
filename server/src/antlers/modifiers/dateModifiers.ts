import { IModifier } from '../modifierTypes.js';

const dateModifiers: IModifier[] = [
    {
        name: 'days_ago',
        acceptsType: ['string', 'date'],
        returnsType: ['number'],
        forFieldType: ['date'],
        description: 'Returns the number of days since a given date.',
        docLink: 'https://statamic.dev/modifiers/days_ago',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'format_translated',
        acceptsType: ['string', 'date'],
        returnsType: ['string', 'date'],
        forFieldType: ['date'],
        description: 'Returns a formatted Carbon datetime/string.',
        docLink: 'https://statamic.dev/modifiers/format',
        parameters: [
            {
                name: 'format',
                description: 'The format to use.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'format',
        acceptsType: ['string', 'date'],
        returnsType: ['string', 'date'],
        forFieldType: ['date'],
        description: 'Formats the date using the provided format using PHP\'s [date variables](https://www.php.net/date).',
        hoverDescription: `Formats the date using the provided format using PHP\'s [date variables](https://www.php.net/date).

## Formatting Options

See [PHP: DateTimeInterface::format](https://www.php.net/manual/en/datetime.format.php) for all available options.

| Format Character | Description | Example |
|:----|----|---|
| Day | --- | --- |
| d | Day of the month, 2 digits with leading zeros | 01 to 31 |
| D |A textual representation of a day | Mon - Sun |
| j | Day of the month, without leading zeros | 1 - 31 |
| l | The day of the week | Sunday - Saturday |
| N | ISO 8601 representation of the day of the week | 1 (Monday) - 7 (Sunday) |
| S | English ordinal suffix for the day | st, nd, rt, or th |
| w | Numeric day of the week | 0 (Sunday) - 6 (Saturday) |
| z | Day of the year, starting at 0 | 0 - 365 |
| Week | --- | --- |
| W | ISO 8601 week number of the year, starting on Monday | 42 |
| Month | --- | --- |
| F | Text representation of the month | January - December |
| m | Numeric representation of the month, with leading zeros | 01 - 12 |
| M | A short text representation of the month | Jan - Dec |
| n | Numeric representation of the month | 1 - 12 |
| t | Number of days in the month | 28 - 31 |
| Year | --- | --- |
| L | Indicates if it's a leap year | 1 if true, 0 otherwise |
| Y | Four digit representation of the year | 2022 |
| y | Two digit representation of the year | 22 |
| Time | --- | --- |
| a | Lowercase Anti meridiem and Post meridiem | am or pm |
| A | Uppercase Anti meridiem and Post meridiem | AM or PM |
| g | 12-hour hour format without leading zeros | 1 - 12 |
| G | 24-hour hour format without leading zeros | 0 - 23 |
| h | 12-hour hour format with leading zeros | 01 - 12 |
| H | 24-hour hour format with leading zeros | 00 - 23 |
| i | Minutes with leading zeros | 00 - 59 |
| s | Seconds with leading zeros | 00 - 59 |
| Timezone | --- | --- |
| e | Timezone identifier | UTC, GMT |
| I | Indicates if date is in daylight saving time | 1 if true, 0 otherwise |
| T | Timezone appreviation | EST, MDT, +05 |
`,
        docLink: 'https://statamic.dev/modifiers/format',
        parameters: [
            {
                name: 'format',
                description: 'The format to use.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'format_localized',
        acceptsType: ['string', 'date'],
        returnsType: ['string', 'date'],
        forFieldType: ['date'],
        description: 'Formats the date using server\'s locale, using PHP\'s [strftime format variables](https://www.php.net/strftime).',
        docLink: 'https://statamic.dev/modifiers/format_localized',
        parameters: [
            {
                name: 'format',
                description: 'The format to use.'
            }
        ],
        canBeParameter: true,
        isDeprecated: true,
        getDeprecatedMessage() {
            return 'The format_localized modifier is deprecated. Alternatives, such as the iso_format modifier, should be used instead.'
        },
    },
    {
        name: 'hours_ago',
        acceptsType: ['string', 'date'],
        returnsType: ['number'],
        forFieldType: ['date'],
        description: 'Returns the number of hours since the date.',
        docLink: 'https://statamic.dev/modifiers/hours_ago',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'iso_format',
        acceptsType: ['string', 'date'],
        returnsType: ['string', 'date'],
        forFieldType: ['date'],
        description: 'Formats the date using an ISO format.',
        docLink: 'https://statamic.dev/modifiers/iso_format',
        parameters: [
            {
                name: 'format',
                description: 'The format to use.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'minutes_ago',
        acceptsType: ['string', 'date'],
        returnsType: ['number'],
        forFieldType: ['date'],
        description: 'Returns the number of minutes since the date.',
        docLink: 'https://statamic.dev/modifiers/minutes_ago',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'modify_date',
        acceptsType: ['string', 'date'],
        returnsType: ['string', 'date'],
        forFieldType: ['date'],
        description: 'Alters the date by incrementing or decrementing it in a format accepted by PHP\'s [strtotime](https://www.php.net/strtotime) function.',
        docLink: 'https://statamic.dev/modifiers/modify_date',
        parameters: [],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'months_ago',
        acceptsType: ['string', 'date'],
        returnsType: ['number'],
        forFieldType: ['date'],
        description: 'Returns the number of months since the date.',
        docLink: 'https://statamic.dev/modifiers/months_ago',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'relative',
        acceptsType: ['string', 'date'],
        returnsType: ['string'],
        forFieldType: ['date'],
        description: 'Returns a human readable date difference.',
        docLink: 'https://statamic.dev/modifiers/relative',
        parameters: [
            {
                name: 'add_ago',
                description: 'Whether to add the relative suffix words at the end of the string.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'seconds_ago',
        acceptsType: ['string', 'date'],
        returnsType: ['number'],
        forFieldType: ['date'],
        description: 'Returns the number of seconds since the date.',
        docLink: 'https://statamic.dev/modifiers/seconds_ago',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'timezone',
        acceptsType: ['string', 'date'],
        returnsType: ['string', 'date'],
        forFieldType: ['date'],
        description: 'Applies a timezone to the date.',
        docLink: 'https://statamic.dev/modifiers/timezone',
        parameters: [
            {
                name: 'timezone',
                description: 'The timezone to apply.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'weeks_ago',
        acceptsType: ['string', 'date'],
        returnsType: ['number'],
        forFieldType: ['date'],
        description: 'Returns the number of weeks since the date.',
        docLink: 'https://statamic.dev/modifiers/weeks_ago',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'years_ago',
        acceptsType: ['string', 'date'],
        returnsType: ['number'],
        forFieldType: ['date'],
        description: 'Returns the number of years since the date.',
        docLink: 'https://statamic.dev/modifiers/years_ago',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },

];

export { dateModifiers };
