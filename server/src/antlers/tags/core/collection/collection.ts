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
	resolveCompletionItems: resolveCollectionCompletions
};

export default Collection;
