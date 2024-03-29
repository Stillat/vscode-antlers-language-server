import { makeTagDoc } from '../../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../../tagManager.js';
import { returnDynamicParameter } from '../../dynamicParameterResolver.js';

const ElseUnless: IAntlersTag = {
    tagName: 'elseunless',
    hideFromCompletions: true,
    allowsArbitraryParameters: true,
    allowsContentClose: false,
    requiresClose: true,
    injectParentScope: true,
    introducedIn: null,
    parameters: [],
    resolveDynamicParameter: returnDynamicParameter,
    resolveDocumentation: (docs?: ISuggestionRequest) => {
        return makeTagDoc(
            'elseunless Conditional Control Structure',
            'The `elseunless` control structure operates the same as an `elseif` statement, but has it\'s logic inverted.',
            'https://statamic.dev/antlers#conditions'
        );
    }
};

export default ElseUnless;
