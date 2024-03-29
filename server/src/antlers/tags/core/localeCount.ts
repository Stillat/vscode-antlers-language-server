import { makeTagDoc } from '../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../tagManager.js';
import { LocaleParameters } from './localeParameters.js';

const LocalesCount: IAntlersTag = {
    tagName: "locales:count",
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    injectParentScope: false,
    requiresClose: true,
    parameters: LocaleParameters,
    introducedIn: '3.0.36',
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'locales:count Tag',
            'The `locales:count` tag can be used to count the number of locales the current content is available in.',
            'https://statamic.dev/tags/locales-count'
        );
    }
};

export default LocalesCount;
