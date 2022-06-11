import { AbstractNode, AntlersNode } from '../../nodes/abstractNode';

interface IFlattenedCondition {
    conditions: AntlersNode[],
    body: AbstractNode[]
}

export default IFlattenedCondition;
