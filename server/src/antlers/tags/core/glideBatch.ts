import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { Scope } from '../../scope/scope';
import { IAntlersTag } from '../../tagManager';
import { makeGlideVariables } from '../../variables/glideVariables';
import { GlideParameters, resolveGlideParameterCompletions } from './glide';

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
    resovleParameterCompletionItems: resolveGlideParameterCompletions
};

export default GlideBatch;
