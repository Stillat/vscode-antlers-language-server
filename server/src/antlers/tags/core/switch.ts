import { makeTagDoc } from '../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../tagManager.js';

const Switch: IAntlersTag = {
    tagName: 'switch',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    introducedIn: null,
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
    }],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'switch Tag',
            'The `switch` tag can be used to alternate between a set of values each time the tag is evaluated.',
            'https://statamic.dev/tags/switch'
        );
    }
};

const Rotate: IAntlersTag = {
    tagName: 'rotate',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    introducedIn: null,
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
    }],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'rotate Tag',
            'The `rotate` tag can be used to alternate between a set of values each time the tag is evaluated.',
            'https://statamic.dev/tags/switch'
        );
    }
};

export { Switch, Rotate };
