import { IAntlersTag } from '../../../tagManager';

const CookieSet: IAntlersTag = {
    tagName: 'cookie:set',
    allowsArbitraryParameters: true,
    allowsContentClose: false,
    requiresClose: false,
    hideFromCompletions: false,
    injectParentScope: false,
    introducedIn: '3.3.38',
    parameters: [
        {
            name: 'minutes',
            aliases: [],
            acceptsVariableInterpolation: true,
            allowsVariableReference: true,
            description: 'The lifetime of the cookie, in minutes',
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: true
        }
    ],
}

export default CookieSet;
