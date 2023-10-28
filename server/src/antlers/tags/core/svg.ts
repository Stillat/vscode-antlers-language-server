import { makeTagDoc } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';
import { returnDynamicParameter } from '../dynamicParameterResolver';

const SVGTag: IAntlersTag = {
    tagName: 'svg',
    hideFromCompletions: false,
    requiresClose: false,
    injectParentScope: false,
    allowsArbitraryParameters: true,
    allowsContentClose: false,
    introducedIn: null,
    parameters: [
        {
            isRequired: false,
            name: 'src',
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            description: 'The SVG filename relative to the project root',
            expectsTypes: ['string'],
            isDynamic: false
        },
        {
            isRequired: false,
            name: 'title',
            acceptsVariableInterpolation: false, 
            aliases: [],
            allowsVariableReference: false,
            description: '',
            expectsTypes: ['string'],
            isDynamic: false
        },
        {
            isRequired: false,
            name: 'desc',
            acceptsVariableInterpolation: false, 
            aliases: [],
            allowsVariableReference: false,
            description: '',
            expectsTypes: ['string'],
            isDynamic: false
        },
        {
            isRequired: false,
            name: 'sanitize',
            acceptsVariableInterpolation: true,
            aliases: [],
            allowsVariableReference: true,
            description: 'Determines whether the rendered SVG will be sanitized.',
            expectsTypes: ['bool'],
            isDynamic: false,
        },
        {
            isRequired: false,
            name: 'allow_attrs',
            acceptsVariableInterpolation: true,
            aliases: [],
            allowsVariableReference: true,
            description: 'A list of allowed attributes when sanitizing.',
            expectsTypes: ['array', 'string'],
            isDynamic: false,
        },
        {
            isRequired: false,
            name: 'allow_tags',
            acceptsVariableInterpolation: true,
            aliases: [],
            allowsVariableReference: true,
            description: 'A list of allowed tags when sanitizing.',
            expectsTypes: ['array', 'string'],
            isDynamic: false,
        }
    ],
    resolveDynamicParameter: returnDynamicParameter,
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'svg Tag',
            'The `svg` tag can be used to render inline SVGs, as well as set attributes on the rendered `<svg>` element.',
            'https://statamic.dev/tags/svg'
        );
    }
};

export default SVGTag;
