import { IAntlersTag } from '../../tagManager';

const UserLogout: IAntlersTag = {
    tagName: 'user:logout',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    parameters: [{
        name: 'redirect',
        description: 'An optional URL to redirect the user after being logged out',
        aliases: [],
        isRequired: false,
        acceptsVariableInterpolation: true,
        allowsVariableReference: false,
        isDynamic: false,
        expectsTypes: ['string']
    }]
};

export default UserLogout;
