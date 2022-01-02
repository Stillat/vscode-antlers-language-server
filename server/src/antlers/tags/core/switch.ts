import { IAntlersTag } from '../../tagManager';

const Switch: IAntlersTag = {
    tagName: 'switch',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    parameters: [{
        name: 'between',
        description: 'A set of values to iterate over',
        aliases: [],
        isRequired: false,
        acceptsVariableInterpolation: true,
        allowsVariableReference: false,
        isDynamic: false,
        expectsTypes: ['string', 'array']
    }, {
        name: 'for',
        description: 'A unique name for the switch instance',
        aliases: [],
        isRequired: false,
        acceptsVariableInterpolation: true,
        allowsVariableReference: false,
        isDynamic: false,
        expectsTypes: ['string']
    }]
};

const Rotate: IAntlersTag = {
    tagName: 'rotate',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    parameters: [{
        name: 'between',
        description: 'A set of values to iterate over',
        aliases: [],
        isRequired: false,
        acceptsVariableInterpolation: true,
        allowsVariableReference: false,
        isDynamic: false,
        expectsTypes: ['string', 'array']
    }, {
        name: 'for',
        description: 'A unique name for the switch instance',
        aliases: [],
        isRequired: false,
        acceptsVariableInterpolation: true,
        allowsVariableReference: false,
        isDynamic: false,
        expectsTypes: ['string']
    }]
};

export { Switch, Rotate };
