import { IAntlersParameter } from '../../../tagManager';

const TaxonomyParameters: IAntlersParameter[] = [
    {
        name: 'from',
        description: 'The taxonomy to use',
        aliases: ['taxonomy', 'is', 'use', 'folder'],
        acceptsVariableInterpolation: false,
        allowsVariableReference: false,
        expectsTypes: ['string', 'array'],
        isDynamic: false,
        isRequired: false
    },
    {
        name: 'not_from',
        description: 'Taxonomies to exclude',
        aliases: ['not_in', 'not_folder', 'dont_use', 'not_taxonomy'],
        allowsVariableReference: false,
        acceptsVariableInterpolation: false,
        expectsTypes: ['string', 'array'],
        isRequired: false,
        isDynamic: false
    },
    {
        name: 'min_count',
        description: 'The minimum number of entries a taxonomy term must have to be returned',
        acceptsVariableInterpolation: false,
        aliases: [],
        allowsVariableReference: false,
        expectsTypes: ['number'],
        isDynamic: false,
        isRequired: false
    },
    {
        name: 'collection',
        description: 'Filter the terms to those that appear in the specified collections',
        acceptsVariableInterpolation: false,
        allowsVariableReference: false,
        aliases: [],
        expectsTypes: ['string', 'array'],
        isDynamic: false,
        isRequired: false
    },
    {
        name: 'sort',
        description: 'The field to sort terms by',
        acceptsVariableInterpolation: false,
        aliases: [],
        allowsVariableReference: false,
        expectsTypes: ['string'],
        isDynamic: false,
        isRequired: false
    },
    {
        isRequired: false,
        name: 'filter',
        aliases: ['query_scope'],
        acceptsVariableInterpolation: false,
        allowsVariableReference: false,
        description: 'Specifies a custom query scope',
        expectsTypes: ['string'],
        isDynamic: false
    }
];

export default TaxonomyParameters;
