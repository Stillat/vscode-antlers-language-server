import { AbstractNode, AntlersNode } from '../../nodes/abstractNode.js';

interface IFlattenedCondition {
    conditions: AntlersNode[],
    body: AbstractNode[]
}

export default IFlattenedCondition;
