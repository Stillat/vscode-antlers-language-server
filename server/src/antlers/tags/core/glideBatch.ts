import { makeTagDoc } from '../../../documentation/utils';
import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { Scope } from '../../scope/scope';
import { IAntlersTag } from '../../tagManager';
import { makeGlideVariables } from '../../variables/glideVariables';
import { GlideParameters, resolveGlideParameterCompletions } from './glideParameters';

const GlideBatch: IAntlersTag = {
    tagName: 'glide:batch',
    hideFromCompletions: false,
    requiresClose: true,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    injectParentScope: false,
    parameters: GlideParameters,
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.addVariables(makeGlideVariables(node));

        return scope;
    },
    resovleParameterCompletionItems: resolveGlideParameterCompletions,
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'glide:batch Tag',
            'The `glide:batch` tag is similar to the glide tag, but can be used to apply image manipulations to multiple images within a piece of content.',
            'https://statamic.dev/tags/glide-batch'
        );
    }
};

export default GlideBatch;
