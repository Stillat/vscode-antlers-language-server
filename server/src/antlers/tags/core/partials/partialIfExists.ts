import { makeTagDoc } from '../../../../documentation/utils';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../../tagManager';
import { PartialParameters } from './partialParameters';
import { resolvePartialParameterCompletions } from './resolvePartialParameterCompletions';

const PartialIfExists: IAntlersTag = {
    tagName: 'partial:if_exists',
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
            'partial:if_exists Tag',
            'The `partial:if_exists` can be used to output the contents of a partial if it exists.',
            'https://statamic.dev/tags/partial-if-exists'
        );
    }
};

export default PartialIfExists;
