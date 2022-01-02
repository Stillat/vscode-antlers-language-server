import { IAntlersTag } from '../tagManager';

const Scope: IAntlersTag = {
    injectParentScope: false,
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    requiresClose: true,
    parameters: [],
    tagName: 'scope'
};

export default Scope;
