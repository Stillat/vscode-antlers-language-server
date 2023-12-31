import { IAntlersTag } from '../tagManager.js';

const Scope: IAntlersTag = {
    injectParentScope: false,
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
    parameters: [],
    introducedIn: null,
    tagName: 'scope'
};

export default Scope;
