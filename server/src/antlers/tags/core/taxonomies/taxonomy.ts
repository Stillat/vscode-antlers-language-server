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
    injectParentScope: false,
    parameters: TaxonomyParameters,
    resolveDynamicParameter: returnDynamicParameter,
    resolveCompletionItems: resolveTaxonomyCompletions,
    resovleParameterCompletionItems: resolveTaxonomyParameterCompletions,
    augmentScope: augmentTaxonomyScope
};

export default TaxonomyTag;
