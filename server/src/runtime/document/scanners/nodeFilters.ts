import { AbstractNode, AntlersNode, ConditionNode } from '../../nodes/abstractNode';

/**
 * Filters an array of AbstractNode and returns
 * all original structural document nodes.
 *
 * @param sourceNodes 
 * @returns 
 */
export function filterStructuralAntlersNodes(sourceNodes: AbstractNode[]) {
    const nodes: AntlersNode[] = [];

    sourceNodes.forEach((node) => {
        if (node instanceof AntlersNode) {
            nodes.push(node);
        } else if (node instanceof ConditionNode) {
            if (node.logicBranches.length > 0) {
                node.logicBranches.forEach((branch) => {
                    if (branch.head != null) {
                        const tBrancHead = branch.head as AntlersNode;

                        if (tBrancHead.originalNode != null) {
                            nodes.push(tBrancHead.originalNode);
                        } else {
                            nodes.push(tBrancHead);
                        }
                    }
                });
            }
        }
    });

    return nodes;
}