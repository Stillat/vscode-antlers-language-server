import { IAntlersTag } from '../../../tagManager';

const Else: IAntlersTag = {
    tagName: 'else',
    hideFromCompletions: true,
    allowsArbitraryParameters: true,
    allowsContentClose: false,
    requiresClose: true,
    injectParentScope: true,
    parameters: []
};

export default Else;
