import { makeTagDoc } from '../../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../../tagManager.js';
import { returnDynamicParameter } from '../../dynamicParameterResolver.js';

const If: IAntlersTag = {
    tagName: 'if',
    hideFromCompletions: true,
    allowsArbitraryParameters: true,
    allowsContentClose: false,
    requiresClose: true,
    injectParentScope: true,
    introducedIn: null,
    parameters: [],
    resolveDynamicParameter: returnDynamicParameter,
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'if Conditional Control Structure',
            'The contents of the `if` tag will be rendered when it\'s expression evaluates to `true`.',
            'https://statamic.dev/antlers#conditions'
        );
    }
};

export default If;
