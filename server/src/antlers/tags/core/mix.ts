import { makeTagDoc } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';

const Mix: IAntlersTag = {
    tagName: 'mix',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: false,
    injectParentScope: false,
    introducedIn: null,
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
    ],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'mix Tag',
            'The `mix` tag is used to return the path of CSS and JavaScript files versioned with [Laravel Mix](https://laravel.com/docs/8.x/mix).',
            'https://statamic.dev/tags/mix'
        );
    }
};

export default Mix;
