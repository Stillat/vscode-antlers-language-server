import { IAntlersTag } from '../../tagManager';

const NoParse: IAntlersTag = {
	tagName: 'noparse',
	requiresClose: true,
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	hideFromCompletions: false,
	injectParentScope: false,
	parameters: []
};

export default NoParse;

