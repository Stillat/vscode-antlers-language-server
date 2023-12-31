import { IAntlersTag } from '../../tagManager.js';

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
