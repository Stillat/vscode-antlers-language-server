import { IAntlersTag } from '../../tagManager';

const Obfuscate: IAntlersTag = {
    tagName: 'obfuscate',
    hideFromCompletions: false,
    requiresClose: true,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    parameters: []
};

export default Obfuscate;
