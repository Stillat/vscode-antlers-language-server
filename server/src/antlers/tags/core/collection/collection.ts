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

const Collection: IAntlersTag = {
    tagName: 'collection',
    hideFromCompletions: false,
    introducedIn: null,
    requiresClose: true,
    injectParentScope: false,
    allowsContentClose: false, // False since we already specified it should be closed.
    allowsArbitraryParameters: false,
    parameters: collectionParameters,
    augmentScope: augmentCollectionScope,
    resolveDynamicParameter: resolveConditionalParmaters,
    resolveSpecialType: resolveCollectionScope,
    suggestAlternativeParams: suggestAlternativeCollectionParams,
    resovleParameterCompletionItems: resolveCollectionParameterCompletiontems,
    resolveCompletionItems: resolveCollectionCompletions,
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample(
            'collection Tag',
            'The `collection` tag provides access to entry data such as blog posts, products, etc.',
            `{{ collection:articles as="posts" }}

	{{ posts }}
		{{ title }}
	{{ /posts }}

{{ /collection:articles }}`, 'https://statamic.dev/tags/collection');
    }
};

export default Collection;
