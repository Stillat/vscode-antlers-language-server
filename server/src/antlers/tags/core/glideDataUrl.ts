import { makeTagDoc } from '../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../tagManager.js';
import { GlideParameters, resolveGlideParameterCompletions } from './glideParameters.js';

const GlideDataUrl: IAntlersTag = {
    tagName: 'glide:data_url',
    hideFromCompletions: false,
    requiresClose: true,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    injectParentScope: false,
    parameters: GlideParameters,
    introducedIn: null,
    resovleParameterCompletionItems: resolveGlideParameterCompletions,
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'glide:data_url Tag',
            'The `glide:data_url` tag returns manipulated image datas as a data URI.',
            null
        );
    }
};

export default GlideDataUrl;
