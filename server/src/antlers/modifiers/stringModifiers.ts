import { IModifier } from '../modifierManager';

const stringModifiers: IModifier[] = [
	{
		name: 'ascii',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Replaces all non-ASCII characters with their closest ASCII counterparts.',
		docLink: 'https://statamic.dev/modifiers/ascii',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'at',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Returns the character at a given zero-based position.',
		docLink: 'https://statamic.dev/modifiers/at',
		parameters: [
			{
				name: 'position',
				description: 'The zero-based position to retrieve a character from.'
			}
		],
		canBeParameter: true
	},

	{
		name: 'backspace',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Removes a specified number of characters from the end of a string.',
		docLink: 'https://statamic.dev/modifiers/backspace',
		parameters: [
			{
				name: 'character_count',
				description: 'The number of characters to remove from the end of the string.'
			}
		],
		canBeParameter: true
	},

	{
		name: 'camelize',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Converts the string into camelCase.',
		docLink: 'https://statamic.dev/modifiers/camelize',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'cdata',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Wraps the string in CDATA XML tags.',
		docLink: 'https://statamic.dev/modifiers/cdata',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'collapse_whitespace',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Trims a string and replaces consecutive whitepsace characters with a single space.',
		docLink: 'https://statamic.dev/modifiers/collapse_whitespace',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'count_substring',
		acceptsType: ['string'],
		returnsType: ['number'],
		description: 'Counts the number of occurrences of a term within the string.',
		docLink: 'https://statamic.dev/modifiers/count_substring',
		parameters: [
			{
				name: 'term',
				description: 'The sub-string to search for'
			}
		],
		canBeParameter: true
	},
	{
		name: 'dashify',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Returns a lowercased and trimmed string, separated by dashes.',
		docLink: 'https://statamic.dev/modifiers/dashify',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'deslugify',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Replaces all hyphens and underscores with spaces.',
		docLink: 'https://statamic.dev/modifiers/deslugify',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'embed_url',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Converts a YouTube or Viemo link into their embed URLs.',
		docLink: 'https://statamic.dev/modifiers/embed_url',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'ensure_left',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Ensures that the string begins with the specified string.',
		docLink: 'https://statamic.dev/modifiers/ensure_left',
		parameters: [
			{
				name: 'start_string',
				description: 'The value that should be at the start of the string.'
			}
		],
		canBeParameter: true
	},
	{
		name: 'ensure_right',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Ensures that the string ends with the specified string.',
		docLink: 'https://statamic.dev/modifiers/ensure_right',
		parameters: [
			{
				name: 'end_string',
				description: 'The value that should be at the end of the string.'
			}
		],
		canBeParameter: true
	},
	{
		name: 'entities',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Encode a string with HTML entities.',
		docLink: 'https://statamic.dev/modifiers/entities',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'excerpt',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Breaks a string at a given marker.',
		docLink: 'https://statamic.dev/modifiers/excerpt',
		parameters: [
			{
				name: 'marker',
				description: 'The string to break by.'
			}
		],
		canBeParameter: false
	},
	{
		name: 'explode',
		acceptsType: ['string'],
		returnsType: ['array'],
		description: 'Breaks a string into an array of strings.',
		docLink: 'https://statamic.dev/modifiers/explode',
		parameters: [
			{
				name: 'delimiter',
				description: 'The string to split the larger string by.'
			}
		],
		canBeParameter: true
	},
	{
		name: 'gravatar',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Converts an email tring to a Gravatar image URL.',
		docLink: 'https://statamic.dev/modifiers/gravatar',
		parameters: [
			{
				name: 'image size',
				description: 'The desired image size.'
			}
		],
		canBeParameter: true
	},
	{
		name: 'insert',
		acceptsType: ['string'],
		returnsType: ['string'],
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
		canBeParameter: true
	},
	{
		name: 'is_email',
		acceptsType: ['string'],
		returnsType: ['boolean'],
		description: 'Returns true if the string is a valid email address.',
		docLink: 'https://statamic.dev/modifiers/is_email',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'is_embeddable',
		acceptsType: ['string'],
		returnsType: ['boolean'],
		description: 'Checks to see if a video URL is embeddable.',
		docLink: 'https://statamic.dev/modifiers/is_embeddable',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'is_lowercase',
		acceptsType: ['string'],
		returnsType: ['boolean'],
		description: 'Returns true if the string contains only lowercase characters.',
		docLink: 'https://statamic.dev/modifiers/is_lowercase',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'is_url',
		acceptsType: ['string'],
		returnsType: ['boolean'],
		description: 'Returns true if a string is a valid URL.',
		docLink: 'https://statamic.dev/modifiers/is_url',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'lcfirst',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Converts the first character of the value to lower case.',
		docLink: 'https://statamic.dev/modifiers/lcfirst',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'length',
		acceptsType: ['string'],
		returnsType: ['number'],
		description: 'Returns the number of items in an array or number of characters in a string.',
		docLink: 'https://statamic.dev/modifiers/length',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'lower',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Converts all characters to lowercase.',
		docLink: 'https://statamic.dev/modifiers/lower',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'md5',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Creates an MD5 hash of the variable.',
		docLink: 'https://statamic.dev/modifiers/md5',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'rawurlencode',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'URL-encode a variable according to RFC-3986.',
		docLink: 'https://statamic.dev/modifiers/rawurlencode',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'read_time',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Returns an estimated read time, in minutes.',
		docLink: 'https://statamic.dev/modifiers/read_time',
		parameters: [
			{
				name: 'words per minute',
				description: 'The words per minute to use as an estimate.'
			}
		],
		canBeParameter: true
	},
	{
		name: 'regex_replace',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Replaces all regex matches with a string.',
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
		canBeParameter: true
	},
	{
		name: 'remove_left',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Ensures that the string never begins with a specified string.',
		docLink: 'https://statamic.dev/modifiers/remove_left/',
		parameters: [
			{
				name: 'value',
				description: 'The value to remove.'
			}
		],
		canBeParameter: true
	},
	{
		name: 'remove_right',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Ensures that a string never ends with a specified string.',
		docLink: 'https://statamic.dev/modifiers/remove_right',
		parameters: [
			{
				name: 'value',
				description: 'The value to remove.'
			}
		],
		canBeParameter: true
	},
	{
		name: 'replace',
		acceptsType: ['string'],
		returnsType: ['string'],
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
		canBeParameter: true
	},
	{
		name: 'reverse',
		acceptsType: ['string', 'array'],
		returnsType: ['string', 'array'],
		description: 'Reverses all characters in a string, or all items in an array.',
		docLink: 'https://statamic.dev/modifiers/reverse',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'safe_truncate',
		acceptsType: ['string'],
		returnsType: ['string'],
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
		canBeParameter: false
	},
	{
		name: 'sanitize',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Converts special characters to HTML entities.',
		docLink: 'https://statamic.dev/modifiers/sanitize',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'segment',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Returns a segment by number from any valid URL or URI.',
		docLink: 'https://statamic.dev/modifiers/segment',
		parameters: [
			{
				name: 'segment',
				description: 'The one-based segment to return.'
			}
		],
		canBeParameter: true
	},
	{
		name: 'singular',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Returns the singular form of an English word.',
		docLink: 'https://statamic.dev/modifiers/singular',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'slugify',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Converts the string into an URL slug.',
		docLink: 'https://statamic.dev/modifiers/slugify',
		parameters: [],
		canBeParameter: false
	},

	{
		name: 'smartypants',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Translates plain ASCII punctuation characters into typographic punctuation HTML entities.',
		docLink: 'https://statamic.dev/modifiers/smartypants',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'spaceless',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Removes excess whitespace and line breaks from a string.',
		docLink: 'https://statamic.dev/modifiers/spaceless',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'substr',
		acceptsType: ['string'],
		returnsType: ['string'],
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
		canBeParameter: false
	},
	{
		name: 'surround',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Surrounds a string with another string.',
		docLink: 'https://statamic.dev/modifiers/surround',
		parameters: [
			{
				name: 'value',
				description: 'The value to surround the string with.'
			}
		],
		canBeParameter: false
	},
	{
		name: 'swap_case',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Returns a case swapped version of the string.',
		docLink: 'https://statamic.dev/modifiers/swap_case',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'tidy',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Returns a string with smart quotes, ellipsis characters, and dashes from Windows-1252 replaced by ASCII equivalents.',
		docLink: 'https://statamic.dev/modifiers/tidy',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'title',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Returns a Title Cased version of the string.',
		docLink: 'https://statamic.dev/modifiers/title',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'trim',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Removes whitespace from the start and end of the string.',
		docLink: 'https://statamic.dev/modifiers/trim',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'truncate',
		acceptsType: ['string'],
		returnsType: ['string'],
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
		canBeParameter: false
	},
	{
		name: 'ucfirst',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Upper cases the first character in the string.',
		docLink: 'https://statamic.dev/modifiers/ucfirst',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'underscored',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Returns a lowercased and trimmed version of the string, separated by underscores.',
		docLink: 'https://statamic.dev/modifiers/underscored',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'upper',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Transforms the string to uppercase.',
		docLink: 'https://statamic.dev/modifiers/upper',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'urldecode',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'URL-decodes the string.',
		docLink: 'https://statamic.dev/modifiers/urldecode',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'urlencode',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'URL-encodes the string.',
		docLink: 'https://statamic.dev/modifiers/urlencode',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'widont',
		acceptsType: ['string'],
		returnsType: ['string'],
		description: 'Attempts to prevent lines with single words.',
		docLink: 'https://statamic.dev/modifiers/widont',
		parameters: [],
		canBeParameter: false
	},
	{
		name: 'word_count',
		acceptsType: ['string'],
		returnsType: ['number'],
		description: 'Returns the number of words in the string.',
		docLink: 'https://statamic.dev/modifiers/word_count',
		parameters: [],
		canBeParameter: false
	},
];

export { stringModifiers };
