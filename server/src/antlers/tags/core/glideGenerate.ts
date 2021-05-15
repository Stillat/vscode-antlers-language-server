import { Scope } from '../../scope/engine';
import { IAntlersTag } from '../../tagManager';
import { ISymbol } from '../../types';
import { makeGlideVariables } from '../../variables/glideVariables';

const GlideGenerate: IAntlersTag = {
	tagName: 'glide:generate',
	hideFromCompletions: false,
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	requiresClose: true,
	injectParentScope: false,
	parameters: [
		{
			isRequired: true,
			acceptsVariableInterpolation: false,
			aliases: ['id', 'path'],
			name: 'src',
			allowsVariableReference: true,
			description: 'The images to retrieve',
			expectsTypes: ['string', 'array'],
			isDynamic: false
		}
	],
	augmentScope: (symbol: ISymbol, scope: Scope) => {
		scope.addVariables(makeGlideVariables(symbol));

		return scope;
	}
};

export default GlideGenerate;
