import { IAntlersTag } from '../../../tagManager';
import { createDefinitionAlias } from '../../alias';
import { ThemePathParameters } from './theme';

const ThemePath: IAntlersTag = {
    tagName: 'theme:path',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: false,
    injectParentScope: false,
    parameters: ThemePathParameters
};

const ThemeAsset: IAntlersTag = createDefinitionAlias(ThemePath, 'theme:asset');

export { ThemePath, ThemeAsset };
