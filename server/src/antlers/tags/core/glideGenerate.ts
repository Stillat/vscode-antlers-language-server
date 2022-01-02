import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { Scope } from '../../scope/scope';
import { IAntlersTag } from '../../tagManager';
import { makeGlideVariables } from '../../variables/glideVariables';

const GlideGenerate: IAntlersTag = {
    tagName: 'glide:generate',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
    injectParentScope: false,
    parameters: [
        {
            isRequired: true,
            acceptsVariableInterpolation: false,
            aliases: ['id', 'path'],
            name: 'src',
            allowsVariableReference: true,
            description: 'The images to retrieve',
            expectsTypes: ['string', 'array'],
            isDynamic: false
        }
    ],
    augmentScope: (node: AntlersNode, scope: Scope) => {
        scope.addVariables(makeGlideVariables(node));

        return scope;
    }
};

export default GlideGenerate;
