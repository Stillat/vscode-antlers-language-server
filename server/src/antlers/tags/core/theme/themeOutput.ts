import { Scope } from '../../../scope/engine';
import { IAntlersTag } from '../../../tagManager';
import { getParameter, ISymbol } from '../../../types';

const ThemeOutput: IAntlersTag = {
	tagName: 'theme:output',
	hideFromCompletions: false,
	allowsArbitraryParameters: false,
	allowsContentClose: true,
	requiresClose: false,
	injectParentScope: false,
	parameters: [
		{
			isRequired: true,
			allowsVariableReference: true,
			acceptsVariableInterpolation: false,
			aliases: [],
			name: 'src',
			description: 'The path to the file',
			expectsTypes: ['string'],
			isDynamic: false
		},
		{
			isRequired: false,
			allowsVariableReference: true,
			acceptsVariableInterpolation: false,
			aliases: [],
			name: 'as',
			description: 'An optional alias for the contents variable',
			expectsTypes: ['string'],
			isDynamic: false
		}
	],
	augmentScope: (symbol: ISymbol, scope: Scope) => {
		if (symbol.isClosedBy != null) {
			const param = getParameter('as', symbol);

			if (param != null) {
				scope.addVariable({ name: param.value, dataType: 'string', sourceField: null, sourceName: '*internal.theme.context', introducedBy: symbol });
			} else {
				scope.addVariable({ name: 'output_contents', dataType: 'string', sourceField: null, sourceName: '*internal.theme.context', introducedBy: symbol });
			}
		}

		return scope;
	}
};

export default ThemeOutput;
