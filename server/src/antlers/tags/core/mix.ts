import { IAntlersTag } from '../../tagManager';

const Mix: IAntlersTag = {
    tagName: 'mix',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: false,
    injectParentScope: false,
    parameters: [
        {
            isRequired: false,
            name: 'src',
            description: 'The path to the versioned file, relative to the public directory',
            acceptsVariableInterpolation: false,
            aliases: ['path'],
            allowsVariableReference: false,
            expectsTypes: ['string'],
            isDynamic: false
        },
        {
            isRequired: false,
            name: 'in',
            description: 'The location of the mix manifest file',
            acceptsVariableInterpolation: false,
            aliases: ['from'],
            allowsVariableReference: false,
            expectsTypes: ['string'],
            isDynamic: false
        }
    ]
};

export default Mix;
