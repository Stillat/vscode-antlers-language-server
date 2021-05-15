import { IAntlersTag } from '../../tagManager';

const ScopeTag: IAntlersTag = {
	tagName: 'scope',
	hideFromCompletions: false,
	requiresClose: true,
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	injectParentScope: false,
	parameters: [

	]
};

export default ScopeTag;
