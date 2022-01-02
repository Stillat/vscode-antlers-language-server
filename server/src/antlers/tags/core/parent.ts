import { IAntlersTag } from '../../tagManager';

const Parent: IAntlersTag = {
    tagName: 'parent',
    hideFromCompletions: false,
    requiresClose: false,
    allowsContentClose: true,
    allowsArbitraryParameters: false,
    injectParentScope: true,
    parameters: []
};

export default Parent;
