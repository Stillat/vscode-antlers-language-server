import { IAntlersTag } from '../../tagManager';

const Relate: IAntlersTag = {
    tagName: 'relate',
    hideFromCompletions: true,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    injectParentScope: false,
    requiresClose: true,
    parameters: []
};

export default Relate;
