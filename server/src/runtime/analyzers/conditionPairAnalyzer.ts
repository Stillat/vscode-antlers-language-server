import { AntlersError } from '../errors/antlersError';
import { AntlersErrorCodes } from '../errors/antlersErrorCodes';
import { AntlersNode, AbstractNode } from '../nodes/abstractNode';
import { NodeHelpers } from '../utilities/nodeHelpers';

export class ConditionPairAnalyzer {

    /**
     * Tests if the provided node represents a conditional control structure.
     * 
     * @param node The node to check.
     * @returns 
     */
    static isConditionalStructure(node: AntlersNode) {
        if (node.isComment) {
            return false;
        }

        const name = node.name?.name ?? '';

        if (name == 'if' || name == 'elseif' || name == 'else') {
            return true;
        }

        return false;
    }

    /**
     * Tests if the provided node still requires a closing pair.
     * @param node The node to check.
     * @returns 
     */
    protected static requiresClose(node: AntlersNode) {
        const name = node.name?.name ?? '';

        if (name == 'elseif' || name == 'else') {
            if (node.isClosedBy != null) {
                return false;
            }

            return true;
        }

        if (node.isClosingTag) {
            return false;
        }

        if (node.isClosedBy != null) {
            return false;
        }

        return true;
    }

    /**
     * A list of valid closing names for common conditional node types.
     */
    protected static conditionClosingPairs: string[] = ['elseif', 'else'];

    /**
     * Returns a list of valid closing node names for the provided node.
     * 
     * @param current The current node's name.
     * @returns 
     */
    protected static getValidClosingPairs(current: string) {
        if (current == 'if' || current == 'elseif') {
            return ConditionPairAnalyzer.conditionClosingPairs;
        }

        return [];
    }

    /**
     * Descends through the nodes to find the closest logical
     * closing node for each opening conditional node type.
     * 
     * @param nodes  The nodes to analyze.
     * @param node The primary node.
     * @param index  The primary node starting index.
     */
    protected static findClosestStructurePair(nodes: AbstractNode[], node: AntlersNode, index: number) {
        const stack: ConditionPairStackItem[] = [],
            nodeLen = nodes.length,
            conditionCloseIndex: Map<number, number> = new Map();
        let lastCloseIndex: number | null = null;

        stack.push({
            node: node,
            index: index
        });

        for (let i = 0; i < nodeLen; i += 1) {
            const node = nodes[i];

            if (node instanceof AntlersNode) {
                const name = node.name?.name ?? '';

                if (node.isClosingTag && name == 'if') {
                    conditionCloseIndex.set(i, i);
                    continue;
                } else {
                    if (name == 'elseif' || name == 'else') {
                        conditionCloseIndex.set(i, i);
                        continue;
                    }
                }
            }
        }

        const conditionIndexLength = conditionCloseIndex.size;

        while (stack.length > 0) {
            const curItem = stack.pop();

            if (curItem == null) {
                continue;
            }

            if (curItem.node._conditionParserAbandonPairing) {
                break;
            }

            const curNode = curItem.node,
                thisValidPairs = ConditionPairAnalyzer.getValidClosingPairs(curNode.name?.name ?? '');

            let curIndex = curItem.index,
                doSkipValidation = false;

            if (conditionIndexLength > 50 && lastCloseIndex != null) {
                for (const [cIndex, n] of conditionCloseIndex) {
                    if (cIndex > curIndex) {
                        curIndex = cIndex;
                        break;
                    }
                }
            }

            for (let i = curIndex; i < nodeLen; i++) {
                const subNode = nodes[i];

                if (subNode instanceof AntlersNode) {
                    if (ConditionPairAnalyzer.isConditionalStructure(subNode)) {
                        if (ConditionPairAnalyzer.requiresClose(subNode)) {
                            stack.push(curItem);
                            stack.push({
                                node: subNode,
                                index: i + 1
                            });
                            doSkipValidation = true;
                            break;
                        }

                        if (curNode.isClosedBy != null) {
                            continue;
                        }

                        const subNodeName = subNode.name?.name ?? '';

                        let canClose = false;

                        if (subNode.ref == 0 && ((subNode.isClosingTag && subNodeName == 'if') ||
                            thisValidPairs.includes(subNodeName)
                        )) {
                            canClose = true;
                        }

                        if (subNode.refId == curNode.refId) {
                            canClose = false;
                        }

                        if (canClose) {
                            lastCloseIndex = i;
                            conditionCloseIndex.delete(i);
                            curNode.isClosedBy = subNode;
                            subNode.isOpenedBy = curNode;
                            subNode.ref += 1;
                            doSkipValidation = true;
                            break;
                        }
                    }
                }
            }

            if (!doSkipValidation) {
                if (curNode instanceof AntlersNode) {
                    const nodeName = curNode.name?.name ?? '';

                    if ((nodeName == 'elseif' || nodeName == 'else') &&
                        curNode.isOpenedBy == null) {
                        let baseMessage = 'Unpaired "' + NodeHelpers.getTrueName(curNode) + '" control structure.';


                        if (curNode.isInterpolationNode) {
                            baseMessage += ' Tag pairs are not supported within Antlers tags.'; 
                        }

                        curNode.pushError(AntlersError.makeSyntaxError(
                            AntlersErrorCodes.TYPE_PARSE_UNPAIRED_CONDITIONAL,
                            curNode,
                            baseMessage
                        ));
                        curNode._conditionParserAbandonPairing = true;
                    }

                    if (curNode.isClosedBy == null && ConditionPairAnalyzer.requiresClose(curNode)) {
                        let baseMessage = 'Unclosed "' + NodeHelpers.getTrueName(curNode) + '" control structure.';

                        if (curNode.isInterpolationNode) {
                            baseMessage += ' Tag pairs are not supported within Antlers tags.'; 
                        }

                        curNode.pushError(AntlersError.makeSyntaxError(
                            AntlersErrorCodes.TYPE_PARSE_UNCLOSED_CONDITIONAL,
                            curNode,
                            baseMessage
                        ));
                        curNode._conditionParserAbandonPairing = true;
                    }
                }
            }
        }
    }

    static pairConditionals(nodes: AbstractNode[]) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];

            if (node instanceof AntlersNode && ConditionPairAnalyzer.isConditionalStructure(node)) {
                if (ConditionPairAnalyzer.requiresClose(node)) {
                    ConditionPairAnalyzer.findClosestStructurePair(nodes, node, i + 1);
                }
            }
        }

        nodes.forEach((node) => {
            if (node instanceof AntlersNode && ConditionPairAnalyzer.isConditionalStructure(node)) {
                const name = node.name?.name ?? '';

                if ((name == 'elseif' || name == 'else') && node.isOpenedBy == null) {
                    node.pushError(AntlersError.makeSyntaxError(
                        AntlersErrorCodes.TYPE_PARSE_UNPAIRED_CONDITIONAL,
                        node,
                        'Unpaired "' + NodeHelpers.getTrueName(node) + '" control structure.'
                    ));
                    return;
                }

                if (node.isClosedBy == null && ConditionPairAnalyzer.requiresClose(node)) {
                    node.pushError(AntlersError.makeSyntaxError(
                        AntlersErrorCodes.TYPE_PARSE_UNCLOSED_CONDITIONAL,
                        node,
                        'Unclosed ' + NodeHelpers.getTrueName(node) + ' control structure.'
                    ));
                    return;
                }
            }
        });

        return nodes;
    }
}

interface ConditionPairStackItem {
    node: AntlersNode,
    index: number
}