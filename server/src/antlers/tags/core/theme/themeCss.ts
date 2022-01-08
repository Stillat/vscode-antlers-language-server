import { makeTagDoc } from '../../../../documentation/utils';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../../tagManager';
import { ThemePathParameters } from './themeParameters';

const ThemeCss: IAntlersTag = {
    tagName: 'theme:css',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: false,
    injectParentScope: false,
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
            'theme:css Tag',
            'The `theme:css` tag may be used to generate a CSS path relative to a public `css/` directory for any arbitrary file path. This tag may also optionally create the HTML `link` tag.',
            null
        );
    }
};

export default ThemeCss;
