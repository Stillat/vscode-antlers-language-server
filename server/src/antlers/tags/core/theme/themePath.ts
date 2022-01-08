import { makeTagDoc } from '../../../../documentation/utils';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../../tagManager';
import { createDefinitionAlias } from '../../alias';
import { ThemePathParameters } from './themeParameters';

const ThemePath: IAntlersTag = {
    tagName: 'theme:path',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: false,
    injectParentScope: false,
    parameters: ThemePathParameters,
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'theme:path Tag',
            'The `theme:path` tag may be used to generate URLs for public assets. This tag may also optionally add the current locale, generate relative URLs, or add cache busting URL parameters to the end of the generated URL.',
            null
        );
    }
};

const ThemeAsset: IAntlersTag = createDefinitionAlias(ThemePath, 'theme:asset');

export { ThemePath, ThemeAsset };
