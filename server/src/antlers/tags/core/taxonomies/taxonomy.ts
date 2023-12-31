import { makeTagDoc } from '../../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../../tagManager.js';
import { returnDynamicParameter } from '../../dynamicParameterResolver.js';
import { augmentTaxonomyScope } from './augmentTaxonomiesScope.js';
import TaxonomyParameters from './parameters.js';
import { resolveTaxonomyCompletions } from './resolveCompletionItems.js';
import { resolveTaxonomyParameterCompletions } from './resolveTaxonomyParameterCompletions.js';

const TaxonomyTag: IAntlersTag = {
    tagName: 'taxonomy',
    allowsArbitraryParameters: true,
    allowsContentClose: false,
    requiresClose: true,
    hideFromCompletions: false,
    introducedIn: null,
    injectParentScope: false,
    parameters: TaxonomyParameters,
    resolveDynamicParameter: returnDynamicParameter,
    resolveCompletionItems: resolveTaxonomyCompletions,
    resovleParameterCompletionItems: resolveTaxonomyParameterCompletions,
    augmentScope: augmentTaxonomyScope,
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'taxonomy Tag',
            'The `taxonomy` tag may be used to retrieve taxonomy entries. The taxonomy tag can also be used to access entries associated with any given taxonomy term.',
            'https://statamic.dev/tags/taxonomy'
        );
    }
};

export default TaxonomyTag;
