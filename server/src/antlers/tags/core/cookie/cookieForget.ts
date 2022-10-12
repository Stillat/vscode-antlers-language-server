import { IAntlersTag } from '../../../tagManager';

const CookieForget: IAntlersTag = {
    tagName: 'cookie:forget',
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: false,
    hideFromCompletions: false,
    injectParentScope: false,
    introducedIn: '3.3.38',
    parameters: [
        {
            name: 'keys',
            aliases: [],
            acceptsVariableInterpolation: true,
            allowsVariableReference: true,
            description: 'The keys to forget',
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: true
        }
    ],
}

export default CookieForget;
