import { makeTagDoc } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';
import { GlideParameters, resolveGlideParameterCompletions } from './glideParameters';

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
