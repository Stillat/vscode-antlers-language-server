import { IProjectDetailsProvider } from '../../../../projects/projectDetailsProvider';
import { AntlersNode } from '../../../../runtime/nodes/abstractNode';
import { IAntlersTag } from "../../../tagManager";

export class YieldContext {
    node: AntlersNode;

    constructor(node: AntlersNode) {
        this.node = node;
    }
}

const Yields: IAntlersTag = {
    tagName: "yields",
    hideFromCompletions: false,
    injectParentScope: false,
    allowsArbitraryParameters: false,
    allowsContentClose: true,
    parameters: [],
    requiresClose: false,
    resolveSpecialType: (node: AntlersNode, project: IProjectDetailsProvider) => {
        const context = new YieldContext(node);

        return {
            context: context,
            issues: [],
        };
    },
};

const Yield: IAntlersTag = {
    tagName: "yield",
    hideFromCompletions: false,
    injectParentScope: false,
    allowsArbitraryParameters: false,
    allowsContentClose: true,
    parameters: [],
    requiresClose: false,
    resolveSpecialType: (node: AntlersNode, project: IProjectDetailsProvider) => {
        const context = new YieldContext(node);

        return {
            context: context,
            issues: [],
        };
    },
};

export { Yield, Yields };
