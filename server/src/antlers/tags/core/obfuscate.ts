import { makeTagDoc } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';

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
