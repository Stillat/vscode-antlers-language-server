import { AntlersError } from '../errors/antlersError';
import { AntlersErrorCodes } from '../errors/antlersErrorCodes';
import { AbstractNode, AntlersNode, LiteralNode, RecursiveNode } from '../nodes/abstractNode';
import { StringUtilities } from '../utilities/stringUtilities';

export class RecursiveParentAnalyzer {
    static associateRecursiveParent(nodes: AbstractNode[]) {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];

            if (node instanceof RecursiveNode) {
                const recursiveContent = '*recursive ' + node.name?.name ?? '' + '*';

                if (i - 1 < 0) {
                    node.pushError(AntlersError.makeSyntaxError(
                        AntlersErrorCodes.TYPE_RECURSIVE_NODE_INVALID_POSITION,
                        node,
                        'Unpaired recursive node. All recursive nodes must have a parent node introducing them.'
                    ));
                    continue;
                }

                let lastNode: AntlersNode | null = null;

                for (let j = i - 1; j >= 0; j -= 1) {
                    const subNode = nodes[j];

                    if (subNode instanceof LiteralNode) {
                        continue;
                    }

                    if (subNode instanceof AntlersNode && subNode.isClosedBy != null) {
                        if (node.isNestedRecursive) {
                            if (subNode.content.trim() == node.name?.name ?? '') {
                                lastNode = subNode;
                                break;
                            }
                        } else {
                            if (subNode.runtimeContent.includes(recursiveContent) && StringUtilities.substringCount(node.runtimeContent, '*recursive') == 1) {
                                lastNode = subNode;
                                continue;
                            } else {
                                if (lastNode != null) {
                                    break;
                                }
                            }
                        }
                    }
                }

                if (lastNode == null) {
                    node.pushError(AntlersError.makeSyntaxError(
                        AntlersErrorCodes.TYPE_RECURSIVE_UNPAIRED_NODE,
                        node,
                        'Unpaired recursive node. All recursive nodes must have a parent node introducing them.'
                    ));
                    continue;
                }

                if (node.isNestedRecursive) {
                    lastNode.hasRecursiveNode = true;
                    node.recursiveParent = lastNode;
                    lastNode.recursiveReference = node;
                } else {
                    if (lastNode.parent != null) {
                        if (lastNode.parent instanceof AntlersNode) {
                            lastNode.parent.hasRecursiveNode = true;
                            lastNode.parent.recursiveReference = node;
                            node.recursiveParent = lastNode.parent;
                        }
                    } else {
                        lastNode.hasRecursiveNode = true;
                        node.recursiveParent = lastNode;
                        lastNode.recursiveReference = node;
                    }
                }
            }
        }
    }
}