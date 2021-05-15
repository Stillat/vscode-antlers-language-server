import { IAntlersParameter } from '../../../tagManager';

const collectionParameters: IAntlersParameter[] = [
	{
		isRequired: false,
		name: "from",
		description: 'The collection name to retrieve entries from',
		aliases: ['folder', 'use'],
		acceptsVariableInterpolation: false,
		allowsVariableReference: false,
		expectsTypes: ['string', 'array'],
		isDynamic: false
	},
	{
		isRequired: false,
		name: 'not_from',
		aliases: ['not_folder', 'dont_use'],
		description: 'The collections to exclude when retrieving entries',
		acceptsVariableInterpolation: false,
		allowsVariableReference: false,
		expectsTypes: ['string', 'array'],
		isDynamic: false
	},
	{
		isRequired: false,
		name: 'show_unpublished',
		aliases: null,
		description: 'Controls whether unpbulished entries are returned',
		acceptsVariableInterpolation: false,
		allowsVariableReference: false,
		expectsTypes: ['boolean'],
		isDynamic: false
	},
	{
		isRequired: false,
		name: 'show_published',
		aliases: null,
		description: 'Controls whether published entries are returned',
		acceptsVariableInterpolation: false,
		allowsVariableReference: false,
		expectsTypes: ['boolean'],
		isDynamic: false
	},
	{
		isRequired: false,
		name: 'show_past',
		aliases: null,
		description: 'Controls whether to display entries with a past date',
		acceptsVariableInterpolation: false,
		allowsVariableReference: false,
		expectsTypes: ['boolean'],
		isDynamic: false
	},
	{
		isRequired: false,
		name: 'since',
		aliases: null,
		description: 'Sets the minimum date an entry can have to be returned',
		acceptsVariableInterpolation: true,
		allowsVariableReference: false,
		expectsTypes: ['string'],
		isDynamic: false
	},
	{
		isRequired: false,
		name: 'until',
		aliases: null,
		description: 'Sets the maximum date an entry can have to be returned',
		acceptsVariableInterpolation: true,
		allowsVariableReference: false,
		expectsTypes: ['string'],
		isDynamic: false
	},
	{
		isRequired: false,
		name: 'sort',
		acceptsVariableInterpolation: false,
		allowsVariableReference: false,
		aliases: null,
		description: 'Specifies the entry sort order',
		expectsTypes: ['string'],
		isDynamic: false
	},
	{
		isRequired: false,
		name: 'limit',
		aliases: null,
		description: 'Sets the maximum number of entries to return',
		acceptsVariableInterpolation: false,
		allowsVariableReference: false,
		expectsTypes: ['integer'],
		isDynamic: false
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
	},
	{
		acceptsVariableInterpolation: false,
		allowsVariableReference: false,
		aliases: null,
		description: 'Sets the amount that entry results should be offset by',
		expectsTypes: ['integer'],
		isRequired: false,
		name: 'offset',
		isDynamic: false
	},
	{
		acceptsVariableInterpolation: false,
		allowsVariableReference: false,
		aliases: null,
		description: 'Sets whether not to pagiante entry results',
		expectsTypes: ['boolean'],
		isRequired: false,
		name: 'paginate',
		isDynamic: false
	},
	{
		acceptsVariableInterpolation: false,
		allowsVariableReference: false,
		aliases: null,
		description: 'Specifies a name to give to a new entries array variable',
		expectsTypes: ['string'],
		isRequired: false,
		name: 'as',
		isDynamic: false
	},
	{
		name: 'scope',
		aliases: null,
		acceptsVariableInterpolation: false,
		allowsVariableReference: false,
		description: 'Sets a prefix on all entry variables',
		expectsTypes: ['string'],
		isRequired: false,
		isDynamic: false
	},
	{
		name: 'locale',
		acceptsVariableInterpolation: false,
		allowsVariableReference: false,
		aliases: null,
		description: 'Specifies the locale in which to retrieve entry content',
		expectsTypes: ['string'],
		isRequired: false,
		isDynamic: false
	},
	{
		name: 'redirects',
		aliases: ['links'],
		acceptsVariableInterpolation: false,
		allowsVariableReference: false,
		description: 'Controls whether entries with redirects are returned',
		expectsTypes: ['boolean'],
		isRequired: false,
		isDynamic: false
	}
];

const CollectionSourceParams = ['from', 'folder', 'use'];
const CollectionRestrictionParams = ['not_from', 'not_folder', 'dont_use'];
const EntryStatuses = ['draft', 'scheduled', 'expired', 'published'];

export { collectionParameters, CollectionSourceParams, CollectionRestrictionParams, EntryStatuses };
