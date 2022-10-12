import { IAntlersTag } from '../../../tagManager';

const CookieHas: IAntlersTag = {
    tagName: 'cookie:has',
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: false,
    hideFromCompletions: false,
    injectParentScope: false,
    introducedIn: '3.3.38',
    parameters: [
        {
            name: 'key',
            aliases: [],
            acceptsVariableInterpolation: true,
            allowsVariableReference: true,
            description: 'The cookie name to check for existence',
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: true
        }
    ],
}

export default CookieHas;
