import { Scope } from '../../scope/engine';
import { IAntlersTag } from '../../tagManager';
import { ISymbol } from '../../types';
import { makeGlideVariables } from '../../variables/glideVariables';
import { GlideParameters, resolveGlideParameterCompletions } from './glide';

const GlideBatch: IAntlersTag = {
	tagName: 'glide:batch',
	hideFromCompletions: false,
	requiresClose: true,
	allowsContentClose: false,
	allowsArbitraryParameters: false,
	injectParentScope: false,
	parameters: GlideParameters,
	augmentScope: (symbol: ISymbol, scope: Scope) => {
		scope.addVariables(makeGlideVariables(symbol));

		return scope;
	},
	resovleParameterCompletionItems: resolveGlideParameterCompletions
};

export default GlideBatch;
