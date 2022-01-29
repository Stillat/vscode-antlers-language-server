import { makeTagDoc } from '../../../../documentation/utils';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../../tagManager';
import { returnDynamicParameter } from '../../dynamicParameterResolver';
import { augmentTaxonomyScope } from './augmentTaxonomiesScope';
import TaxonomyParameters from './parameters';
import { resolveTaxonomyCompletions } from './resolveCompletionItems';
import { resolveTaxonomyParameterCompletions } from './resolveTaxonomyParameterCompletions';

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
