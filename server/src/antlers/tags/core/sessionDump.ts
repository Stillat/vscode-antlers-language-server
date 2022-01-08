import { makeTagDoc } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';

const SessionDump: IAntlersTag = {
    tagName: 'session:dump',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    parameters: [],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'session:dump Tag',
            'The `session:dump` tag will display the contents of the user\'s session to the browser. This tag behaves similarly to the `dd` helper functions, but returns just the session data.',
            'https://statamic.dev/tags/session-dump'
        );
    }
};

export default SessionDump;
