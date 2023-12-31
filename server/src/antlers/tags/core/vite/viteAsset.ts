import { makeTagDocWithCodeSample } from '../../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../../tagManager.js';

const ViteAsset: IAntlersTag = {
    tagName: 'vite:asset',
    hideFromCompletions: false,
    requiresClose: true,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    introducedIn: '3.4.4',
    parameters: [
        {
            isRequired: true,
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            name: 'src',
            description: 'The asset\'s path',
            expectsTypes: ['string'],
            isDynamic: false
        }
    ],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample(
            'vite Tag',
            'Generates Vite asset URL for the provided resource.',
            `<img src="{{ vite:asset src="resources/images/logo.svg" /}}" />`,
            null
        );
    }
};

export default ViteAsset;
