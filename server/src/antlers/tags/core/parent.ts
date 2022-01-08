import { makeTagDoc } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';

const Parent: IAntlersTag = {
    tagName: 'parent',
    hideFromCompletions: false,
    requiresClose: false,
    allowsContentClose: true,
    allowsArbitraryParameters: false,
    injectParentScope: true,
    parameters: [],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'parent Tag',
            'The `parent` tag provides access to data from the current page\'s parent (the URL one level above the current page).',
            'https://statamic.dev/tags/parent'
        );
    }
};

export default Parent;
