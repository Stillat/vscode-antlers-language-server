import { AbstractNode, AntlersNode, ConditionNode, ExecutionBranch, LiteralNode } from '../nodes/abstractNode';
import { ConditionPairAnalyzer } from './conditionPairAnalyzer';
import IFlattenedCondition from './structures/flattenedCondition';

class ConditionAnalyzer {

    static isFlatCondition(condition: ConditionNode): boolean {
        if (condition.chain.length > 1) { return false; }

        const headNodes = condition.logicBranches[0].nodes;

        for (let i = 0; i < headNodes.length; i++) {
            const thisNode = headNodes[i];

            if (thisNode instanceof ConditionNode) {
                if (! ConditionAnalyzer.isFlatCondition(thisNode)) {
                    return false;
                }
            }

            if (thisNode instanceof AntlersNode && !ConditionPairAnalyzer.isConditionalStructure(thisNode)) {
                if (thisNode.isClosingTag) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }

    static getCleanChildren(branch: ExecutionBranch): AbstractNode[] {
        const nodes:AbstractNode[] = [],
            observedIndex:number[] = [];
        
        for (let i  = 0; i < branch.nodes.length; i++) {
            const thisNode = branch.nodes[i];

            if (thisNode.startPosition == null) { break; }

            if (! observedIndex.includes(thisNode.startPosition.index)) {
                if (thisNode instanceof LiteralNode) {
                    if (thisNode.content.trim().length > 0) {
                        nodes.push(thisNode);
                    }
                }else {
                    nodes.push(thisNode);
                }

                observedIndex.push(thisNode.startPosition.index);
            } else {
                break;
            }
        }

        nodes.pop();

        return nodes;
    }

    static unwrapFlattenedConditions(condition: ConditionNode) {
        const returnValue:IFlattenedCondition = {
            body: [],
            conditions: []
        };

        condition.logicBranches.forEach((branch) => {
            if (branch.head == null) { return; }

            returnValue.conditions.push(branch.head);
            const cleanedChildren = this.getCleanChildren(branch);

            if (cleanedChildren.length == 1 && cleanedChildren[0] instanceof ConditionNode) {
                const childResult = this.unwrapFlattenedConditions(cleanedChildren[0]);

                returnValue.conditions = returnValue.conditions.concat(childResult.conditions);
                returnValue.body = returnValue.body.concat(childResult.body);
            } else if (cleanedChildren.length == 1) {
                returnValue.body.push(cleanedChildren[0]);
            } else {
                cleanedChildren.forEach((child) => {
                    if (child instanceof ConditionNode) {
                        const tChildResult2 = this.unwrapFlattenedConditions(child);

                        returnValue.conditions = returnValue.conditions.concat(tChildResult2.conditions);
                        returnValue.body = returnValue.body.concat(tChildResult2.body);
                    } else {
                        if (child instanceof AntlersNode && ConditionPairAnalyzer.isConditionalStructure(child)) {
                            return;
                        } else {
                            returnValue.body.push(child);
                        }
                    }
                });
            }
        });

        return returnValue;
    }

}

export default ConditionAnalyzer;
