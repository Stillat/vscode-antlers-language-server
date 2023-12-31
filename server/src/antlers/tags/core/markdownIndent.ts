import { makeTagDoc } from '../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../tagManager.js';

const MarkdownIndent: IAntlersTag = {
    tagName: 'markdown:indent',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: true,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    introducedIn: null,
    parameters: [],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'markdown:indent Tag',
            'The `markdown:indent` tag is similar to the markdown tag, but will ignore leading whitepsace while rendering the tag\'s content as markdown.',
            'https://statamic.dev/tags/markdown-indent'
        );
    }
};

export default MarkdownIndent;
