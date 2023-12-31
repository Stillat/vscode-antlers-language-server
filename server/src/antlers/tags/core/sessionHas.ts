import { makeTagDoc } from '../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../tagManager.js';
import { returnDynamicParameter } from '../dynamicParameterResolver.js';

const SessionHas: IAntlersTag = {
    tagName: 'session:has',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: true,
    allowsContentClose: true,
    parameters: [],
    introducedIn: '3.1.28',
    resolveDynamicParameter: returnDynamicParameter,
    resolveDocumentation: (params: ISuggestionRequest) => {
        return makeTagDoc(
            'session:has Tag',
            'The `session:has` tag can be used to determine of the user\'s session contains a specific variable.',
            'https://statamic.dev/tags/session-has'
        );
    }
};

export default SessionHas;
