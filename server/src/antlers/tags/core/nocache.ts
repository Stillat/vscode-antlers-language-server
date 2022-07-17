import { makeTagDocWithCodeSample } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';

const NoCache: IAntlersTag = {
    tagName: 'nocache',
    requiresClose: true,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    hideFromCompletions: false,
    injectParentScope: false,
    parameters: [],
    introducedIn: null,
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample(
            'nocache Tag',
            'The `nocache` tag is used to mark regions of a template. These regions will continue to update even when using caching strategies such as the full or half-measure cache.',
            `{{ nocache }} 
    <!-- This content will remain dynamic. -->
{{ /nocache }}`,
            'https://statamic.dev/tags/nocache'
        );
    }
};

export default NoCache;

