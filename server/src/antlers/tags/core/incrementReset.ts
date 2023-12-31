import { makeTagDocWithCodeSample } from '../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../tagManager.js';

const IncrementReset: IAntlersTag = {
    tagName: 'increment:reset',
    hideFromCompletions: false,
    requiresClose: false,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    introducedIn: '3.2.28',
    parameters: [
        {
            isRequired: true,
            name: 'counter',
            aliases: [],
            description: 'The incrementing counter to reset',
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            expectsTypes: ['string'],
            isDynamic: false
        },
        {
            isRequired: false,
            name: 'to',
            aliases: [],
            description: 'An optional value to reset the counter to before incrementing starts again',
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            expectsTypes: ['number'],
            isDynamic: false
        }
    ],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample(
            'increment:reset Tag',
            'The `increment:reset` tag can be used to reset the value of an incrementing counter.',
            `{{ array_variable }}
    {{ increment:counter_name }}
{{ /array_variable }}

{{ increment:reset counter="counter_name" }}
`,
            null
        );
    }
};

export default IncrementReset;
