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
