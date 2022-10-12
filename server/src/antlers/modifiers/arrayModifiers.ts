import { IModifier } from '../modifierTypes';
import { augmentGroupByScope } from './scopeAugmentation/augmentGroupByScope';
import { augmentSplitScope } from './scopeAugmentation/augmentSplitScope';

const arrayModifiers: IModifier[] = [
    {
        name: 'key_by',
        acceptsType: ['array'],
        returnsType: ['array'],
        description: 'Re-keys the array or collection using the provided field name.',
        docLink: null,
        parameters: [
            {
                name: 'field',
                description: 'The field to re-key the array or collection by.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false,
    },
    {
        name: 'as',
        acceptsType: ['array'],
        returnsType: ['array'],
        description: 'Alias the array variable with a key.',
        docLink: 'https://statamic.dev/modifiers/as',
        parameters: [
            {
                name: 'alias',
                description: 'The alias name.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'ampersand_list',
        acceptsType: ['array'],
        returnsType: ['string'],
        description: 'Converts the array into a comma delimited string, with an ampersand before the last item.',
        docLink: 'https://statamic.dev/modifiers/ampersand_list',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'collapse',
        acceptsType: ['array'],
        returnsType: ['array'],
        description: 'Collapses an array of arrays into a single, flat, array.',
        docLink: 'https://statamic.dev/modifiers/collapse',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'contains',
        acceptsType: ['array', 'string'],
        returnsType: ['boolean'],
        description: 'Tests if the value contains another value.',
        docLink: 'https://statamic.dev/modifiers/contains',
        parameters: [
            {
                name: 'needle',
                description: 'The value to check for.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'count',
        acceptsType: ['array'],
        returnsType: ['number'],
        description: 'Returns the number of items in the array.',
        docLink: 'https://statamic.dev/modifiers/count',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'dl',
        acceptsType: ['array'],
        returnsType: ['string'],
        description: 'Turns an associative array into an HTML definition list.',
        docLink: 'https://statamic.dev/modifiers/dl',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'explode',
        acceptsType: ['string'],
        returnsType: ['array'],
        description: 'Breaks a string into an array on a given delimiter.',
        docLink: 'https://statamic.dev/modifiers/explode',
        parameters: [
            {
                name: 'delimiter',
                description: 'The delimiter to break the string apart on.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'flatten',
        acceptsType: ['array'],
        returnsType: ['array'],
        description: 'Flattens a multi-dimensional array.',
        docLink: 'https://statamic.dev/modifiers/flatten',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'flip',
        acceptsType: ['array'],
        returnsType: ['array'],
        description: 'Swaps the array keys with their values.',
        docLink: 'https://statamic.dev/modifiers/flip',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'group_by',
        acceptsType: ['array'],
        returnsType: ['array'],
        description: 'Groups the array items by the given key.',
        docLink: 'https://statamic.dev/modifiers/group_by',
        parameters: [
            {
                name: 'key',
                description: 'The key to group by.'
            }
        ],
        canBeParameter: true,
        augmentScope: augmentGroupByScope,
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
                description: 'The value to check for.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'is_empty',
        acceptsType: ['array'],
        returnsType: ['boolean'],
        description: 'Tests if the array is empty.',
        docLink: 'https://statamic.dev/modifiers/is_empty',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'join',
        acceptsType: ['array'],
        returnsType: ['string'],
        description: 'Turn an array into a string by gluing together all the data.',
        docLink: 'https://statamic.dev/modifiers/join',
        parameters: [
            {
                name: 'glue',
                description: 'The string to combine the parts by.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'joinplode',
        acceptsType: ['array'],
        returnsType: ['string'],
        description: 'Turn an array into a string by gluing together all the data.',
        docLink: null,
        parameters: [
            {
                name: 'glue',
                description: 'The string to combine the parts by.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'limit',
        acceptsType: ['array'],
        returnsType: ['array'],
        description: 'Limits the number of items returned in the array',
        docLink: 'https://statamic.dev/modifiers/limit',
        parameters: [
            {
                name: 'count',
                description: 'The maximum number of items to return.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'list',
        acceptsType: ['array'],
        returnsType: ['string'],
        description: 'Converts the array into a comma-separated string.',
        docLink: 'https://statamic.dev/modifiers/list',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'offset',
        acceptsType: ['array'],
        returnsType: ['array'],
        description: 'Offsets the items returned in the array.',
        docLink: 'https://statamic.dev/modifiers/offset',
        parameters: [
            {
                name: 'offset',
                description: 'The one-based index to start retrieving items.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'ol',
        acceptsType: ['array'],
        returnsType: ['string'],
        description: 'Turns the array into an HTML ordered list.',
        docLink: 'https://statamic.dev/modifiers/ol',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'option_list',
        acceptsType: ['array'],
        returnsType: ['string'],
        description: 'Turns an array into a pipe-delimited string.',
        docLink: 'https://statamic.dev/modifiers/option_list',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'pluck',
        acceptsType: ['array'],
        returnsType: ['array'],
        description: 'Plucks a value from a collection of items.',
        parameters: [
            {
                name: 'value',
                description: 'The value to pluck from the array or collection.'
            }
        ],
        canBeParameter: true,
        docLink: null,
        isDeprecated: false
    },
    {
        name: 'pad',
        acceptsType: ['array'],
        returnsType: ['array'],
        description: 'Pads the array to a specified length with the given value.',
        docLink: 'https://statamic.dev/modifiers/pad',
        parameters: [
            {
                name: 'length',
                description: 'The desired length of the array.'
            },
            {
                name: 'value',
                description: 'The value to pad the array with.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'piped',
        acceptsType: ['array'],
        returnsType: ['string'],
        description: 'Turns an array into a pipe-delimited string.',
        docLink: 'https://statamic.dev/modifiers/piped',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'sentence_list',
        acceptsType: ['array'],
        returnsType: ['string'],
        description: 'Turns the array into a comma-delimited list, with the word "and" before the last item.',
        docLink: 'https://statamic.dev/modifiers/sentence_list',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'shuffle',
        acceptsType: ['array'],
        returnsType: ['array'],
        description: 'Randomizes the order of array elements.',
        docLink: 'https://statamic.dev/modifiers/shuffle',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'sort',
        acceptsType: ['array'],
        returnsType: ['array'],
        description: 'Sorts the array by a key in ascending or descending order.',
        docLink: 'https://statamic.dev/modifiers/sort',
        parameters: [
            {
                name: 'key',
                description: 'The key to sort by.'
            },
            {
                name: 'order',
                description: 'The sort direction. `asc` or `desc`.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'sum',
        acceptsType: ['array'],
        returnsType: ['number'],
        description: 'Returns the sum of all items in the array.',
        docLink: 'https://statamic.dev/modifiers/sum',
        parameters: [
            {
                name: 'key',
                description: 'The value to sum.'
            }
        ],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'ul',
        acceptsType: ['array'],
        returnsType: ['string'],
        description: 'Turns the array into an HTML unordered list.',
        docLink: 'https://statamic.dev/modifiers/ul',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'unique',
        acceptsType: ['array'],
        returnsType: ['array'],
        description: 'Returns all unique items in the array.',
        docLink: 'https://statamic.dev/modifiers/unique',
        parameters: [],
        canBeParameter: false,
        isDeprecated: false
    },
    {
        name: 'where',
        acceptsType: ['array'],
        returnsType: ['array'],
        description: 'Filters the array by a given key and value.',
        docLink: 'https://statamic.dev/modifiers/where',
        parameters: [
            {
                name: 'key',
                description: 'The property to filter by.'
            },
            {
                name: 'value',
                description: 'The value to compare to.'
            }
        ],
        canBeParameter: true,
        isDeprecated: false
    },
    {
        name: 'split',
        acceptsType: ['array'],
        returnsType: ['array'],
        description: 'Splits an array into smaller arrays with the provided size.',
        canBeParameter: true,
        docLink: '',
        parameters: [
            {
                name: 'size',
                description: 'The size of each new array'
            }
        ],
        augmentScope: augmentSplitScope,
        isDeprecated: false
    },
    {
        name: 'compact',
        acceptsType: ['string'],
        returnsType: ['array'],
        description: 'Accepts a comma-delimited list of variable names and return an array with their values.',
        canBeParameter: true,
        docLink: '',
        parameters: [
            {
                name: 'variables',
                description: 'A comma-delimited list of variable names.'
            }
        ],
        isDeprecated: false
    }
];

export { arrayModifiers };
