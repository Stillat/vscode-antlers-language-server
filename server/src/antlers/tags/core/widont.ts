import { makeTagDocWithCodeSample } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';

const Widont: IAntlersTag = {
    tagName: 'widont',
    hideFromCompletions: false,
    requiresClose: true,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
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
