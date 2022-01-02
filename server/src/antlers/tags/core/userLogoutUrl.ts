import { IAntlersTag } from '../../tagManager';

const UserLogoutUrl: IAntlersTag = {
    tagName: 'user:logout_url',
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

export default UserLogoutUrl;
