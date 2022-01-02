import { IAntlersTag } from '../../tagManager';

const SessionDump: IAntlersTag = {
    tagName: 'session:dump',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    parameters: []
};

export default SessionDump;
