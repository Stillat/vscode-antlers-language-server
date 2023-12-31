import { makeTagDoc } from '../../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../../tagManager.js';

const Else: IAntlersTag = {
    tagName: 'else',
    hideFromCompletions: true,
    allowsArbitraryParameters: true,
    allowsContentClose: false,
    requiresClose: true,
    injectParentScope: true,
    introducedIn: null,
    parameters: [],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'else Conditional Control Structure',
            'The contents of the `else` control structure will be evaluated when all previous conditional branch conditions were not met.',
            'https://statamic.dev/antlers#conditions'
        );
    }
};

export default Else;
