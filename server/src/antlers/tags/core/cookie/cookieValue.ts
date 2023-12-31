import { IAntlersTag } from '../../../tagManager.js';

const CookieValue: IAntlersTag = {
    tagName: 'cookie:value',
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
            description: 'The cookie name to retrieve the value for',
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: true
        }
    ],
}

export default CookieValue;
