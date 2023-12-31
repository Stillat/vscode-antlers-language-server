import { makeTagDoc } from '../../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../../tagManager.js';
import { ThemePathParameters } from './themeParameters.js';

const ThemeJavaScript: IAntlersTag = {
    tagName: 'theme:js',
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
        }
    ],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'theme:js Tag',
            'The `theme:js` tag may be used to generate a JavaScript path relative to a public `js/` directory for any arbitrary file path. This tag may also optionally create the HTML `script` tag.',
            null
        );
    }
};

export default ThemeJavaScript;
