import { makeTagDoc } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';

const IterateTag: IAntlersTag = {
    tagName: 'iterate',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
    injectParentScope: false,
	introducedIn: null,
    parameters: [
        {
            name: 'as',
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            description: 'Optionally rename the key/value variables',
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: false
        },
        {
            name: 'array',
            acceptsVariableInterpolation: true,
            aliases: [],
            allowsVariableReference: true,
            description: 'The array to iterate',
            expectsTypes: ['array'],
            isDynamic: false,
            isRequired: false
        }
    ],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'iterate Tag',
            'The `iterate` tag can be used to iterate over arbitrary arrays.',
            'https://statamic.dev/tags/foreach'
        );
    }
};

const ForeachTag: IAntlersTag = {
    tagName: 'foreach',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
    injectParentScope: false,
	introducedIn: null,
    parameters: [
        {
            name: 'as',
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            description: 'Optionally rename the key/value variables',
            expectsTypes: ['string'],
            isDynamic: false,
            isRequired: false
        },
        {
            name: 'array',
            acceptsVariableInterpolation: true,
            aliases: [],
            allowsVariableReference: true,
            description: 'The array to iterate',
            expectsTypes: ['array'],
            isDynamic: false,
            isRequired: false
        }
    ],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'foreach Tag',
            'The `foreach` tag can be used to iterate over arbitrary arrays.',
            'https://statamic.dev/tags/foreach'
        );
    }
};

export {
    IterateTag, ForeachTag
};
