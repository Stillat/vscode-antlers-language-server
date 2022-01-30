import { makeTagDocWithCodeSample } from '../../../../documentation/utils';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../../tagManager';
import { suggestAlternativeCollectionParams } from './alternateParamSuggestions';
import { augmentCollectionScope } from './augmentCollectionScope';
import { collectionParameters } from './parameters';
import { resolveCollectionCompletions } from './resolveCollectionCompletions';
import { resolveCollectionScope } from './resolvesCollectionScope';
import { resolveConditionalParmaters } from './resolvesConditionalParameters';
import { resolveCollectionParameterCompletiontems } from './resolvesParameterSuggestions';

const CollectionNext: IAntlersTag = {
    tagName: 'collection:next',
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
            'collection:next Tag',
            'The `collection:next` tag is used to show the entries that will appear after the current entry, based on some entry order (publish date, alphabetical, or manual).',
            `{{# Retrieve the next two entries, based on dates in ascending order. #}}
{{ collection:next in="articles" limit="2" sort="date:asc" }}

{{ /collection:next }}`, 'https://statamic.dev/tags/collection-next'
        );
    }
};

export default CollectionNext;
