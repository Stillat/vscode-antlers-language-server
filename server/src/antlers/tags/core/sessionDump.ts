import { makeTagDoc } from '../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../tagManager.js';

const SessionDump: IAntlersTag = {
    tagName: 'session:dump',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    parameters: [],
    introducedIn: null,
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'session:dump Tag',
            'The `session:dump` tag will display the contents of the user\'s session to the browser. This tag behaves similarly to the `dd` helper functions, but returns just the session data.',
            'https://statamic.dev/tags/session-dump'
        );
    }
};

export default SessionDump;
