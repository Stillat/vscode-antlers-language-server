import { IAntlersTag } from '../../../tagManager';
import { ThemePathParameters } from './theme';

const ThemeJavaScript: IAntlersTag = {
    tagName: 'theme:js',
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
    ]
};

export default ThemeJavaScript;
