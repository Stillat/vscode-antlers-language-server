import { AbstractNode, LogicGroupBegin, LogicGroupEnd, ModifierNameNode, ModifierSeparator } from '../nodes/abstractNode';
import { Position } from '../nodes/position';
import { NodeQueries } from './scanners/nodeQueries';

export class FeatureContextResolver {
    static isModifierLeftOf(node: AbstractNode, nodes: AbstractNode[]) {
        return FeatureContextResolver.isModifierLeftOfPosition(node.startPosition, nodes);
    }

    static isModifierLeftOfPosition(position: Position | null, nodes: AbstractNode[]) {
        const checkNodes = NodeQueries.findAbstractNodesBeforePosition(position, nodes);

        for (let i = checkNodes.length - 1; i >= 0; i--) {
            const thisNode = checkNodes[i];

            if (thisNode instanceof LogicGroupBegin) {
                if (i - 1 > 0 && checkNodes[i - 1] instanceof ModifierNameNode) {
                    return true;
                }
            }

            if (thisNode instanceof LogicGroupBegin || thisNode instanceof LogicGroupEnd) {
                return false;
            }

            if (thisNode instanceof ModifierSeparator) {
                return true;
            }
        }

        return false;
    }
}