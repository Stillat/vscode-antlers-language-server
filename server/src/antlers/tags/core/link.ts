import { IAntlersTag } from '../../tagManager';

const Link: IAntlersTag = {
    tagName: 'link',
    hideFromCompletions: false,
    requiresClose: false,
    injectParentScope: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    parameters: [
        {
            name: 'to',
            description: 'The relative path',
            expectsTypes: ['string'],
            allowsVariableReference: false,
            acceptsVariableInterpolation: false,
            aliases: [],
            isRequired: true,
            isDynamic: false
        }, {
            name: 'absolute',
            description: 'Whether to generate absolute URLs. Default false',
            expectsTypes: ['boolean'],
            allowsVariableReference: false,
            acceptsVariableInterpolation: false,
            aliases: [],
            isRequired: false,
            isDynamic: false
        }
    ]
};

export default Link;
