import { IAntlersTag } from '../../tagManager';

const SetTag: IAntlersTag = {
    tagName: 'set',
    hideFromCompletions: true,
    allowsArbitraryParameters: true,
    requiresClose: false,
    allowsContentClose: false,
    injectParentScope: false,
	introducedIn: null,
    parameters: []
};

export default SetTag;
