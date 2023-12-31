import { IAntlersTag } from '../../tagManager.js';

const QueryTag: IAntlersTag = {
    tagName: 'query',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: true,
    allowsArbitraryParameters: false,
    allowsContentClose: true,
    introducedIn: null,
    parameters: [
        {
            name: 'builder',
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            description: 'The query to evaluate',
            expectsTypes: ['string'],
            isRequired: true,
            isDynamic: false
        }
    ]
};

export default QueryTag;
