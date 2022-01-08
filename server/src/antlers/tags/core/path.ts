import { makeTagDoc } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';

const PathTag: IAntlersTag = {
    tagName: 'path',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: false,
    injectParentScope: false,
    parameters: [
        {
            isRequired: false,
            acceptsVariableInterpolation: false,
            aliases: ['src'],
            allowsVariableReference: true,
            description: 'The path source',
            name: 'to',
            isDynamic: false,
            expectsTypes: ['string']
        },
        {
            isRequired: false,
            allowsVariableReference: true,
            acceptsVariableInterpolation: false,
            aliases: [],
            description: 'Whether to generate absolute paths',
            expectsTypes: ['boolean'],
            isDynamic: false,
            name: 'absolute'
        }
    ],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'path Tag',
            'The `path` tag can be used to generate URLs from relative URLs, or an entry ID.',
            null
        );
    }
};

export default PathTag;
