import { makeTagDoc } from '../../../../documentation/utils';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../../tagManager';

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
