import { makeTagDoc } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';

const NoParse: IAntlersTag = {
    tagName: 'noparse',
    requiresClose: true,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    hideFromCompletions: false,
    injectParentScope: false,
    parameters: [],
	introducedIn: null,
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'noparse Tag',
            'The `noparse` tag is used prevent blocks of Antlers code from being parsed, removing the need to escape individual Antlers code regions.',
            'https://statamic.dev/antlers#the-noparse-tag'
        );
    }
};

export default NoParse;

