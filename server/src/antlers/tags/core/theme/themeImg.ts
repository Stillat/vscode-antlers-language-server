import { makeTagDoc } from '../../../../documentation/utils';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../../tagManager';
import { ThemePathParameters } from './themeParameters';

const ThemeImg: IAntlersTag = {
    tagName: 'theme:img',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: false,
    injectParentScope: false,
	introducedIn: null,
    parameters: [
        ...ThemePathParameters,
        {
            isRequired: false,
            isDynamic: false,
            aliases: [],
            acceptsVariableInterpolation: false,
            allowsVariableReference: true,
            name: 'tag',
            description: 'Whether to generate an HTML tag',
            expectsTypes: ['boolean']
        },
        {
            isRequired: false,
            isDynamic: false,
            aliases: [],
            acceptsVariableInterpolation: false,
            allowsVariableReference: true,
            name: 'alt',
            description: 'The alt text to use when generating the HTML tag',
            expectsTypes: ['string']
        }
    ],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'theme:img Tag',
            'The `theme:img` tag may be used to generate an image path relative to a public `img/` directory for any arbitrary file path. This tag may also optionally create the HTML `img` tag.',
            null
        );
    }
};

export default ThemeImg;
