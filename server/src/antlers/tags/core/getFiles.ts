import { makeTagDoc } from '../../../documentation/utils.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { Scope } from '../../scope/scope.js';
import { IAntlersTag } from '../../tagManager.js';
import { makeFileVariables } from '../../variables/fileVariables.js';

const GetFiles: IAntlersTag = {
    tagName: 'get_files',
    hideFromCompletions: false,
    requiresClose: true,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    injectParentScope: false,
    introducedIn: null,
    parameters: [
        {
            isRequired: false,
            name: 'in',
            aliases: ['from'],
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            description: 'The directory to find files in relative to the public directory',
            expectsTypes: ['string'],
            isDynamic: false
        },
        {
            isRequired: false,
            name: 'depth',
            aliases: [],
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            description: 'The depth of the subdirectories',
            expectsTypes: ['number'],
            isDynamic: false
        },
        {
            isRequired: false,
            name: 'not_in',
            allowsVariableReference: false,
            acceptsVariableInterpolation: false,
            aliases: [],
            description: 'The subdirectories or pattern to exclude',
            expectsTypes: ['string'],
            isDynamic: false
        },
        {
            isRequired: false,
            name: 'file_size',
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            aliases: [],
            expectsTypes: ['string'],
            description: 'The file size filter to use',
            isDynamic: false
        },
        {
            isRequired: false,
            name: 'ext',
            aliases: ['extension'],
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            description: 'The extension(s) to filter by',
            expectsTypes: ['string', 'array'],
            isDynamic: false
        },
        {
            isRequired: false,
            name: 'include',
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            aliases: ['match'],
            description: 'Filter files by a regular expression',
            expectsTypes: ['string'],
            isDynamic: false
        },
        {
            isRequired: false,
            name: 'exclude',
            description: 'Excludes files by a regular expression',
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            expectsTypes: ['string'],
            isDynamic: false
        },
        {
            isRequired: false,
            name: 'file_date',
            description: 'Filters files by last modified date',
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            aliases: [],
            expectsTypes: ['string'],
            isDynamic: false
        },
        {
            isRequired: false,
            name: 'limit',
            description: 'Limits the total number of results',
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            expectsTypes: ['number'],
            isDynamic: false
        },
        {
            isRequired: false,
            name: 'offset',
            description: 'The number of entries the results should be offset by',
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            expectsTypes: ['number'],
            isDynamic: false
        },
        {
            isRequired: false,
            name: 'sort',
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            description: 'Sorts the listing by extension, size, last_modified, or random',
            expectsTypes: ['string'],
            isDynamic: false
        }
    ],
    augmentScope: (symbol: AntlersNode, scope: Scope) => {
        scope.addVariables(makeFileVariables(symbol));

        return scope;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'get_files Tag',
            'The `get_files` tag can be used to display information about files on the site\'s local filesystem.',
            'https://statamic.dev/tags/get_files'
        );
    }
};

export default GetFiles;
