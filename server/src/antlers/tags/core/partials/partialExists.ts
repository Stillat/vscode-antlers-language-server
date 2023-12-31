import { makeTagDoc } from '../../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../../tagManager.js';
import { PartialParameters } from './partialParameters.js';
import { resolvePartialParameterCompletions } from './resolvePartialParameterCompletions.js';

const PartialExists: IAntlersTag = {
    tagName: 'partial:exists',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: false,
    injectParentScope: false,
    parameters: PartialParameters,
    introducedIn: '3.2.7',
    resovleParameterCompletionItems: resolvePartialParameterCompletions,
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'partial:exists Tag',
            'The `partial:exists` can be used within conditional statements to test if a partial exists.',
            'https://statamic.dev/tags/partial-exists'
        );
    }
};

export default PartialExists;
