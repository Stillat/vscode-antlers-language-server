import { IModifier } from '../modifierTypes.js';

const stringModifiers: IModifier[] = [
    {
        name: 'ascii',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Replaces all non-ASCII characters with their closest ASCII counterparts.',
        docLink: 'https://statamic.dev/modifiers/ascii',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'at',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Returns the character at a given zero-based position.',
        docLink: 'https://statamic.dev/modifiers/at',
        parameters: [
            {
                name: 'position',
                description: 'The zero-based position to retrieve a character from.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },

    {
        name: 'backspace',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Removes a specified number of characters from the end of a string.',
        docLink: 'https://statamic.dev/modifiers/backspace',
        parameters: [
            {
                name: 'character_count',
                description: 'The number of characters to remove from the end of the string.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },

    {
        name: 'camelize',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Converts the string into camelCase.',
        docLink: 'https://statamic.dev/modifiers/camelize',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'cdata',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Wraps the string in CDATA XML tags.',
        docLink: 'https://statamic.dev/modifiers/cdata',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'collapse_whitespace',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Trims a string and replaces consecutive whitespace characters with a single space.',
        docLink: 'https://statamic.dev/modifiers/collapse_whitespace',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'count_substring',
        acceptsType: ['string'],
        returnsType: ['number'],
        forFieldType: [],
        description: 'Counts the number of occurrences of a term within the string.',
        docLink: 'https://statamic.dev/modifiers/count_substring',
        parameters: [
            {
                name: 'term',
                description: 'The sub-string to search for.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'dashify',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Returns a lower-cased and trimmed string, separated by dashes.',
        docLink: 'https://statamic.dev/modifiers/dashify',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'deslugify',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Replaces all hyphens and underscores with spaces.',
        docLink: 'https://statamic.dev/modifiers/deslugify',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'embed_url',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: ['video'],
        description: 'Converts a YouTube or Viemo link into their embed URLs.',
        docLink: 'https://statamic.dev/modifiers/embed_url',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'trackable_embed_url',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Get the embed URL when given a YouTube or Vimeo link that\'s direct to the page.',
        docLink: null,
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'ensure_left',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Ensures that the string begins with the specified string.',
        docLink: 'https://statamic.dev/modifiers/ensure_left',
        parameters: [
            {
                name: 'start_string',
                description: 'The value that should be at the start of the string.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'ensure_right',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Ensures that the string ends with the specified string.',
        docLink: 'https://statamic.dev/modifiers/ensure_right',
        parameters: [
            {
                name: 'end_string',
                description: 'The value that should be at the end of the string.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'entities',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Encode a string with HTML entities.',
        docLink: 'https://statamic.dev/modifiers/entities',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'excerpt',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Breaks a string at a given marker.',
        docLink: 'https://statamic.dev/modifiers/excerpt',
        parameters: [
            {
                name: 'marker',
                description: 'The substring to break on.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'explode',
        acceptsType: ['string'],
        returnsType: ['array'],
        forFieldType: [],
        description: 'Breaks a string into an array of strings.',
        docLink: 'https://statamic.dev/modifiers/explode',
        parameters: [
            {
                name: 'delimiter',
                description: 'The string to split the larger string by.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'gravatar',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Converts an email string to a Gravatar image URL.',
        docLink: 'https://statamic.dev/modifiers/gravatar',
        parameters: [
            {
                name: 'image size',
                description: 'The desired image size.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'insert',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Inserts a string at the position provided.',
        docLink: 'https://statamic.dev/modifiers/insert',
        parameters: [
            {
                name: 'value',
                description: 'The value to insert.'
            },
            {
                name: 'position',
                description: 'The zero based position to insert the text at.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'is_email',
        acceptsType: ['string'],
        returnsType: ['boolean'],
        forFieldType: [],
        description: 'Returns true if the string is a valid email address.',
        docLink: 'https://statamic.dev/modifiers/is_email',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_embeddable',
        acceptsType: ['string'],
        returnsType: ['boolean'],
        forFieldType: ['video'],
        description: 'Checks to see if a video URL is embeddable.',
        docLink: 'https://statamic.dev/modifiers/is_embeddable',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_lowercase',
        acceptsType: ['string'],
        returnsType: ['boolean'],
        forFieldType: [],
        description: 'Returns true if the string contains only lowercase characters.',
        docLink: 'https://statamic.dev/modifiers/is_lowercase',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_url',
        acceptsType: ['string'],
        returnsType: ['boolean'],
        forFieldType: [],
        description: 'Returns true if a string is a valid URL.',
        docLink: 'https://statamic.dev/modifiers/is_url',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'lcfirst',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Converts the first character of the value to lower case.',
        docLink: 'https://statamic.dev/modifiers/lcfirst',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'length',
        acceptsType: ['string'],
        returnsType: ['number'],
        forFieldType: [],
        description: 'Returns the number of items in an array or number of characters in a string.',
        docLink: 'https://statamic.dev/modifiers/length',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'lower',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Converts all characters to lowercase.',
        docLink: 'https://statamic.dev/modifiers/lower',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'md5',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Creates an MD5 hash of the variable.',
        docLink: 'https://statamic.dev/modifiers/md5',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'rawurlencode',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'URL-encode a variable according to RFC-3986.',
        docLink: 'https://statamic.dev/modifiers/rawurlencode',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'read_time',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Returns an estimated read time, in minutes.',
        docLink: 'https://statamic.dev/modifiers/read_time',
        parameters: [
            {
                name: 'words per minute',
                description: 'The words per minute to use as an estimate.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'regex_replace',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Replaces all regex matches within a string.',
        docLink: 'https://statamic.dev/modifiers/regex_replace',
        parameters: [
            {
                name: 'pattern',
                description: 'The regex pattern.',
            },
            {
                name: 'replace',
                description: 'The replacement value.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'remove_left',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Ensures that the string never begins with a specified string.',
        docLink: 'https://statamic.dev/modifiers/remove_left/',
        parameters: [
            {
                name: 'value',
                description: 'The value to remove.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'remove_right',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Ensures that a string never ends with a specified string.',
        docLink: 'https://statamic.dev/modifiers/remove_right',
        parameters: [
            {
                name: 'value',
                description: 'The value to remove.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'replace',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Replaces all occurrences of a string with a different value.',
        docLink: 'https://statamic.dev/modifiers/replace',
        parameters: [
            {
                name: 'needle',
                description: 'The string to search for.'
            },
            {
                name: 'value',
                description: 'The value to replace all occurrences with.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'reverse',
        acceptsType: ['string', 'array'],
        returnsType: ['string', 'array'],
        forFieldType: [],
        description: 'Reverses all characters in a string, or all items in an array.',
        docLink: 'https://statamic.dev/modifiers/reverse',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'safe_truncate',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Truncates a string to a given length.',
        docLink: 'https://statamic.dev/modifiers/safe_truncate',
        parameters: [
            {
                name: 'length',
                description: 'The desired string length.'
            },
            {
                name: 'suffix',
                description: 'An optional suffix to append to the string if truncation occurs.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'sanitize',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Converts special characters to HTML entities.',
        docLink: 'https://statamic.dev/modifiers/sanitize',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'segment',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Returns a segment by number from any valid URL or URI.',
        docLink: 'https://statamic.dev/modifiers/segment',
        parameters: [
            {
                name: 'segment',
                description: 'The one-based segment to return.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'singular',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Returns the singular form of an English word.',
        docLink: 'https://statamic.dev/modifiers/singular',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'slugify',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Converts the string into an URL slug.',
        docLink: 'https://statamic.dev/modifiers/slugify',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },

    {
        name: 'smartypants',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Translates plain ASCII punctuation characters into typographic punctuation HTML entities.',
        docLink: 'https://statamic.dev/modifiers/smartypants',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'spaceless',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Removes excess whitespace and line breaks from a string.',
        docLink: 'https://statamic.dev/modifiers/spaceless',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'substr',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Returns a portion of a string based on provided a start index, and optional length.',
        docLink: 'https://statamic.dev/modifiers/substr',
        parameters: [
            {
                name: 'start',
                description: 'The 0-based index to start searching.'
            },
            {
                name: 'length',
                description: 'An optional length for the string to find.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'surround',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Surrounds a string with another string.',
        docLink: 'https://statamic.dev/modifiers/surround',
        parameters: [
            {
                name: 'value',
                description: 'The value to surround the string with.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'swap_case',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Returns a case swapped version of the string.',
        docLink: 'https://statamic.dev/modifiers/swap_case',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'tidy',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Returns a string with smart quotes, ellipsis characters, and dashes from Windows-1252 replaced by ASCII equivalents.',
        docLink: 'https://statamic.dev/modifiers/tidy',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'title',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Returns a Title Cased version of the string.',
        docLink: 'https://statamic.dev/modifiers/title',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'trim',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Removes whitespace from the start and end of the string.',
        docLink: 'https://statamic.dev/modifiers/trim',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'truncate',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Truncates a string to a given length.',
        docLink: 'https://statamic.dev/modifiers/truncate',
        parameters: [
            {
                name: 'length',
                description: 'The maximum string length.'
            },
            {
                name: 'suffix',
                description: 'An optional suffix to append to the string if truncation occurs.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'ucfirst',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Upper cases the first character in the string.',
        docLink: 'https://statamic.dev/modifiers/ucfirst',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'underscored',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Returns a lower-cased and trimmed version of the string, separated by underscores.',
        docLink: 'https://statamic.dev/modifiers/underscored',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'upper',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Transforms the string to uppercase.',
        docLink: 'https://statamic.dev/modifiers/upper',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'urldecode',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'URL-decodes the string.',
        docLink: 'https://statamic.dev/modifiers/urldecode',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'urlencode',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'URL-encodes the string.',
        docLink: 'https://statamic.dev/modifiers/urlencode',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'widont',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Attempts to prevent lines with single words.',
        docLink: 'https://statamic.dev/modifiers/widont',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'word_count',
        acceptsType: ['string'],
        returnsType: ['number'],
        forFieldType: [],
        description: 'Returns the number of words in the string.',
        docLink: 'https://statamic.dev/modifiers/word_count',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'add_slashes',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Adds slashes before characters that need to be escaped.',
        docLink: 'https://statamic.dev/modifiers/add_slashes',
        canBeParameter: false,
        parameters: [],
        isDeprecated: false
    },
    {
        name: 'antlers',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Parses the provided value as Antlers, and returns the result.',
        docLink: null,
        canBeParameter: false,
        parameters: [],
        isDeprecated: false,
    },
    {
        name: 'bard_items',
        acceptsType: ['string'],
        returnsType: ['array'],
        forFieldType: ['bard'],
        description: 'Converts a Bard value to a flat array of nodes and marks.',
        docLink: null,
        canBeParameter: false,
        parameters: [],
        isDeprecated: false,
    },
    {
        name: 'bard_text',
        acceptsType: ['array', 'string'],
        returnsType: ['string'],
        forFieldType: ['bard'],
        description: 'Converts a Bard value to plain text (excluding sets).',
        docLink: null,
        canBeParameter: false,
        parameters: [],
        isDeprecated: false,
    },
    {
        name: 'bard_html',
        acceptsType: ['array', 'string'],
        returnsType: ['string'],
        forFieldType: ['bard'],
        description: 'Converts a Bard value to HTML (excluding sets).',
        docLink: null,
        canBeParameter: false,
        parameters: [],
        isDeprecated: false,
    },
    {
        name: 'mark',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Wraps matched words and phrases in <mark> tags.',
        docLink: null,
        canBeParameter: false,
        parameters: [
            {
                name: 'search',
                description: 'The search word or phrase to wrap in <mark> tags.'
            }
        ],
        isDeprecated: false,
    },
    {
        name: 'regex_mark',
        acceptsType: ['string'],
        returnsType: ['string'],
        forFieldType: [],
        description: 'Wraps matched words and phrases in <mark> tags using regular expressions.',
        docLink: null,
        canBeParameter: false,
        parameters: [
            {
                name: 'pattern',
                description: 'The search pattern used to wrap content in <mark> tags.'
            }
        ],
        isDeprecated: false,
    }
];

export { stringModifiers };
