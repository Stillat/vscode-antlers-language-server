import { IAntlersTag } from '../../tagManager';
import { resolveUserParameterCompletionItems } from './user/parameterCompletions';

const UserCan: IAntlersTag = {
    tagName: 'user:can',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: false,
    allowsContentClose: true,
    resovleParameterCompletionItems: resolveUserParameterCompletionItems,
    parameters: [
        {
            name: 'do',
            acceptsVariableInterpolation: false,
            aliases: ['permission'],
            allowsVariableReference: false,
            description: 'The permissions to check against',
            expectsTypes: ['string'],
            isRequired: true,
            isDynamic: false
        }
    ]
};

export default UserCan;
