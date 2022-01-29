import { IAntlersTag } from '../../tagManager';

const Relate: IAntlersTag = {
    tagName: 'relate',
    hideFromCompletions: true,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    injectParentScope: false,
    requiresClose: true,
	introducedIn: null,
    parameters: []
};

export default Relate;
