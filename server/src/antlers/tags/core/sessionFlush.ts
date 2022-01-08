import { makeTagDoc } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';

const SessionFlush: IAntlersTag = {
    tagName: 'session:flush',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    parameters: [],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'session:flush Tag',
            'The `session:flush` tag will clear all values from the visitor\'s session. If the visitor is currently signed in they will also be signed out.',
            'https://statamic.dev/tags/session-flush'
        );
    }
};

export default SessionFlush;
