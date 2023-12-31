import { makeTagDocWithCodeSample } from '../../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../../tagManager.js';
import { suggestAlternativeCollectionParams } from './alternateParamSuggestions.js';
import { augmentCollectionScope } from './augmentCollectionScope.js';
import { collectionParameters } from './parameters.js';
import { resolveCollectionCompletions } from './resolveCollectionCompletions.js';
import { resolveCollectionScope } from './resolvesCollectionScope.js';
import { resolveConditionalParmaters } from './resolvesConditionalParameters.js';
import { resolveCollectionParameterCompletiontems } from './resolvesParameterSuggestions.js';

const CollectionPrevious: IAntlersTag = {
    tagName: 'collection:previous',
    hideFromCompletions: false,
    requiresClose: true,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    introducedIn: null,
    parameters: [
        ...collectionParameters,
        {
            name: 'in',
            aliases: ['collection'],
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            description: 'The collection to search in',
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: false
        },
        {
            name: 'current',
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            description: 'Sets the current entry by ID',
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: false,
        }
    ],
    augmentScope: augmentCollectionScope,
    resolveDynamicParameter: resolveConditionalParmaters,
    resolveSpecialType: resolveCollectionScope,
    suggestAlternativeParams: suggestAlternativeCollectionParams,
    resovleParameterCompletionItems: resolveCollectionParameterCompletiontems,
    resolveCompletionItems: resolveCollectionCompletions,
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample(
            'collection:previous Tag',
            'The `collection:previous` tag is used to show the entries that appear before the current entry, based on some entry order (publish date, alphabetical, or manual).',
            `{{# Retrieve the previous two entries, based on dates in ascending order. #}}
{{ collection:previous in="articles" limit="2" sort="date:asc" }}

{{ /collection:previous }}`, 'https://statamic.dev/tags/collection-previous'
        );
    }
};

export default CollectionPrevious;
