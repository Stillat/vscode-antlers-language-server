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
