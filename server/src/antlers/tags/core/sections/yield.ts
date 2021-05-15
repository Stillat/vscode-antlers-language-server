import { StatamicProject } from '../../../../projects/statamicProject';
import { IAntlersTag } from '../../../tagManager';
import { ISymbol } from '../../../types';

export class YieldContext {
	symbol: ISymbol;

	constructor(symbol: ISymbol) {
		this.symbol = symbol;
	}
}

const Yields: IAntlersTag = {
	tagName: 'yields',
	hideFromCompletions: false,
	injectParentScope: false,
	allowsArbitraryParameters: false,
	allowsContentClose: true,
	parameters: [],
	requiresClose: false,
	resolveSpecialType: (symbol: ISymbol, project: StatamicProject) => {
		const context = new YieldContext(symbol);

		return {
			context: context,
			issues: []
		};
	}
};

const Yield: IAntlersTag = {
	tagName: 'yield',
	hideFromCompletions: false,
	injectParentScope: false,
	allowsArbitraryParameters: false,
	allowsContentClose: true,
	parameters: [],
	requiresClose: false,
	resolveSpecialType: (symbol: ISymbol, project: StatamicProject) => {
		const context = new YieldContext(symbol);

		return {
			context: context,
			issues: []
		};
	}
};

export { Yield, Yields };
