import { makeTagDoc } from '../../../../documentation/utils';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../../tagManager';
import { returnDynamicParameter } from '../../dynamicParameterResolver';

const ElseIf: IAntlersTag = {
    tagName: 'elseif',
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
            'elseif Conditional Control Structure',
            'The contents of the `elseif` tag will be rendered when it\'s expression evaluates to `true`.',
            'https://statamic.dev/antlers#conditions'
        );
    }
};

export default ElseIf;
