import { IAntlersTag } from '../../tagManager';

const Relate: IAntlersTag = {
    tagName: 'relate',
    hideFromCompletions: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    injectParentScope: false,
    requiresClose: true,
    parameters: []
};

export default Relate;
