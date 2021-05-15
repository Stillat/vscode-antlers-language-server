import { IAntlersTag } from '../../tagManager';

const NotFound: IAntlersTag = {
	tagName: 'not_found',
	hideFromCompletions: false,
	requiresClose: false,
	injectParentScope: false,
	allowsContentClose: false,
	allowsArbitraryParameters: false,
	parameters: []
};

export default NotFound;
