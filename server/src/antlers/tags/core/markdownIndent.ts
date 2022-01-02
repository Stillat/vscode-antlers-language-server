import { IAntlersTag } from '../../tagManager';

const MarkdownIndent: IAntlersTag = {
    tagName: 'markdown:indent',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: true,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    parameters: []
};

export default MarkdownIndent;
