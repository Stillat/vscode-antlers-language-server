import { makeTagDoc } from '../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../tagManager.js';

const Obfuscate: IAntlersTag = {
    tagName: 'obfuscate',
    hideFromCompletions: false,
    requiresClose: true,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    introducedIn: null,
    parameters: [],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'obfuscate Tag',
            'The `obfuscate` tag converts the tags\'s content into a format that is difficult for bots to read, but can easily be viewed by users within their browser.',
            'https://statamic.dev/tags/obfuscate'
        );
    }
};

export default Obfuscate;
