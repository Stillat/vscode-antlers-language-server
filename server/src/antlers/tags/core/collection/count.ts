import { makeTagDocWithCodeSample } from '../../../../documentation/utils';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../../tagManager';
import { collectionParameters } from './parameters';
import { resolveCollectionScope } from './resolvesCollectionScope';
import { resolveCollectionParameterCompletiontems } from './resolvesParameterSuggestions';

const CollectionCount: IAntlersTag = {
    tagName: 'collection:count',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    introducedIn: null,
    parameters: [
        ...collectionParameters,
        {
            isRequired: true,
            name: 'in',
            aliases: ['from'],
            description: 'The collection from which to count entries',
            acceptsVariableInterpolation: true,
            allowsVariableReference: true,
            expectsTypes: ['string'],
            isDynamic: false
        }
    ],
    resolveSpecialType: resolveCollectionScope,
    resovleParameterCompletionItems: resolveCollectionParameterCompletiontems,
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample(
            'collection:count Tag',
            'The `collection:count` tag returns the total number of entries in the specified collection(s). The collection count tag accepts the same parameters as the collection tag, allowing developers to count entries that meet specific conditions.',
            `Total entry count: {{ collection:count in="collection-name" }}
Draft count: {{ collection:count in="collection-name" status:in="draft" }}`, 'https://statamic.dev/tags/collection-count');
    }
};

export default CollectionCount;
