import { IAntlersTag } from '../../tagManager';

const SessionFlush: IAntlersTag = {
	tagName: 'session:flush',
	hideFromCompletions: false,
	injectParentScope: false,
	requiresClose: false,
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	parameters: []
};

export default SessionFlush;
