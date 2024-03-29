import { makeTagDocWithCodeSample } from '../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../tagManager.js';

const Widont: IAntlersTag = {
    tagName: 'widont',
    hideFromCompletions: false,
    requiresClose: true,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    introducedIn: null,
    parameters: [],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample(
            'widont Tag',
            'The `widont` tag is similar to the [widont modifier](https://statamic.dev/modifiers/widont), and will attempt to prevent lines with a single word from appearing within the tags rendered output.',
            `{{ widont }}
    {{ content }}
{{ /widont }}`,
            null
        );
    }
};

export default Widont;
