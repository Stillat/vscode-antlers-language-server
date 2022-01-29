import { makeTagDoc } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';

const Link: IAntlersTag = {
    tagName: 'link',
    hideFromCompletions: false,
    requiresClose: false,
    injectParentScope: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
	introducedIn: null,
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
        }, {
            name: 'id',
            description: 'The ID of the entry to link to',
            expectsTypes: ['string'],
            allowsVariableReference: true,
            acceptsVariableInterpolation: true,
            aliases: [],
            isDynamic: false,
            isRequired: false,
        }, {
            name: 'in',
            description: 'The handle of the site to link to.',
            expectsTypes: ['string'],
            allowsVariableReference: true,
            acceptsVariableInterpolation: true,
            aliases: [],
            isDynamic: false,
            isRequired: false
        }
    ],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'link Tag',
            'The `link` tag accepts relative URLs or entry IDs and generates fully-qualified URLs to the desired content.',
            'https://statamic.dev/tags/link'
        );
    }
};

export default Link;
