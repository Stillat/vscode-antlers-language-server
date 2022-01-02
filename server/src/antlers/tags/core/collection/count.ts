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
    resovleParameterCompletionItems: resolveCollectionParameterCompletiontems
};

export default CollectionCount;
