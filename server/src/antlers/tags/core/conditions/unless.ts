import { makeTagDoc } from '../../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../../tagManager.js';
import { returnDynamicParameter } from '../../dynamicParameterResolver.js';

const Unless: IAntlersTag = {
    tagName: 'unless',
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
            'unless Conditional Control Structure',
            'The `unless` control structure operates the same as an `if` statement, but has it\'s logic inverted.',
            'https://statamic.dev/antlers#conditions'
        );
    }
};

export default Unless;
