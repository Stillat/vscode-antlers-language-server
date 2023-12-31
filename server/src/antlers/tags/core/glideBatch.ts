import { makeTagDoc } from '../../../documentation/utils.js';
import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { Scope } from '../../scope/scope.js';
import { IAntlersTag } from '../../tagManager.js';
import { makeGlideVariables } from '../../variables/glideVariables.js';
import { GlideParameters, resolveGlideParameterCompletions } from './glideParameters.js';

const GlideBatch: IAntlersTag = {
    tagName: 'glide:batch',
    hideFromCompletions: false,
    requiresClose: true,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    injectParentScope: false,
    parameters: GlideParameters,
    introducedIn: null,
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
