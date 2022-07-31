import { IModifier } from '../modifierTypes';

const markupModifiers: IModifier[] = [
    {
        name: 'chunk',
        acceptsType: ['array'],
        returnsType: ['array'],
        description: 'Breaks the array or collection into smaller arrays of a given size.',
        docLink: 'https://statamic.dev/modifiers/chunk',
        parameters: [
            {
                name: 'chunk_size',
                description: 'The maximum length of each new chunk.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'favicon',
        acceptsType: ['string'],
        returnsType: ['string'],
        description: 'Generates a favicon HTML meta tag for the given value.',
        docLink: 'https://statamic.dev/modifiers/favicon',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'first',
        acceptsType: ['string', 'array'],
        returnsType: ['*'],
        description: 'Returns the specified number of characters from the beginning of the string.',
        docLink: 'https://statamic.dev/modifiers/first',
        parameters: [
            {
                name: 'count',
                description: 'The number of characters to return.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'last',
        acceptsType: ['string', 'array'],
        returnsType: ['*'],
        description: 'Returns the specified number of characters from the end of the string.',
        docLink: 'https://statamic.dev/modifiers/last',
        parameters: [
            {
                name: 'count',
                description: 'The number of characters to return.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'link',
        acceptsType: ['string'],
        returnsType: ['string'],
        description: 'Generates an HTML link for the provided value.',
        docLink: 'https://statamic.dev/modifiers/link',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'mailto',
        acceptsType: ['string'],
        returnsType: ['string'],
        description: 'Generates a mailto HTML link for the provided value.',
        docLink: 'https://statamic.dev/modifiers/mailto',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'markdown',
        acceptsType: ['string'],
        returnsType: ['string'],
        description: 'Parses the value as Markdown and returns the HTML.',
        docLink: 'https://statamic.dev/modifiers/markdown',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'nl2br',
        acceptsType: ['string'],
        returnsType: ['string'],
        description: 'Replaces line breaks with HTML `<br>` tags.',
        docLink: 'https://statamic.dev/modifiers/nl2br',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'obfuscate',
        acceptsType: ['string'],
        returnsType: ['string'],
        description: 'Modifies the input string by replacing it with special characters, making it harder for bots but remains readable to site visitors.',
        docLink: 'https://statamic.dev/modifiers/obfuscate',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'obfuscate_email',
        acceptsType: ['string'],
        returnsType: ['string'],
        description: 'Obfuscates an email address with special HTML characters.',
        docLink: 'https://statamic.dev/modifiers/obfuscate_email',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'strip_tags',
        acceptsType: ['string'],
        returnsType: ['string'],
        description: 'Removes HTML tags from the string.',
        docLink: 'https://statamic.dev/modifiers/strip_tags',
        parameters: [
            {
                name: 'tags',
                description: 'The HTML tag(s) to remove from the string.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'table',
        acceptsType: ['array'],
        returnsType: ['string'],
        description: 'Turns a [Table FieldType](https://statamic.dev/fieldtypes/table) array into an HTML table.',
        docLink: 'https://statamic.dev/modifiers/table',
        parameters: [
            {
                name: 'content_markdown',
                description: 'Whether to parse cell contents as Markdown.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'textile',
        acceptsType: ['string'],
        returnsType: ['string'],
        description: 'Parses a string with [Textile](http://demo.textilewiki.com/theme-default/) and returns the HTML.',
        docLink: 'https://statamic.dev/modifiers/textile',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'wrap',
        acceptsType: ['string'],
        returnsType: ['string'],
        description: 'Wraps a string with a given HTML tag.',
        docLink: 'https://statamic.dev/modifiers/wrap',
        parameters: [
            {
                name: 'expression',
                description: 'The HTML tag or Emmet-style expression to wrap the value in.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
];

export { markupModifiers };
