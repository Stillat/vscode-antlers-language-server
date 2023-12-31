import { AbstractNode, AntlersNode, ConditionNode, EscapedContentNode, LiteralNode, ParameterNode, ParserFailNode } from '../../nodes/abstractNode.js';
import { Position } from '../../nodes/position.js';
import { AntlersDocument } from '../antlersDocument.js';
import { AntlersNodeQueries } from './antlersNodeQueries.js';
import { NodeQueries } from './nodeQueries.js';

export class NodeScanner {
    private doc: AntlersDocument;

    constructor(doc: AntlersDocument) {
        this.doc = doc;
    }

    getAncestors(position: Position): AntlersNode[] {
        return AntlersNodeQueries.findAncestorsBeforePosition(position, this.doc.getAllAntlersNodes());
    }

    getNodeAt(position: Position | null): AbstractNode | null {
        return NodeQueries.findNodeAtPosition(position, this.doc.getDocumentParser().getNodes());
    }

    getNodesBefore(position: Position | null): AbstractNode[] {
        return NodeQueries.findNodesBeforePosition(position, this.doc.getDocumentParser().getNodes());
    }

    getNodeBefore(position: Position | null): AbstractNode | null {
        return NodeQueries.findNodeBeforePosition(position, this.doc.getDocumentParser().getNodes());
    }

    getNodeAfter(position: Position | null): AbstractNode | null {
        return NodeQueries.findNodeAfterPosition(position, this.doc.getDocumentParser().getNodes());
    }

    getNodesAfter(position: Position | null): AbstractNode[] {
        return NodeQueries.findNodesAfterPosition(position, this.doc.getDocumentParser().getNodes());
    }

    getIsWithinPairedNode(position: Position | null) {
        const node = this.getNodeBefore(position);

        if (node == null) {
            return false;
        }

        return AntlersNodeQueries.isPairedNode(node);
    }

    filter(predicate: (value: AbstractNode, index: number, array: AbstractNode[]) => value is AbstractNode) {
        return this.doc.getDocumentParser().getNodes().filter(predicate);
    }

    getComments(): AntlersNode[] {
        const nodes: AntlersNode[] = [];

        this.doc.getAllNodes().forEach((node) => {
            if (node instanceof AntlersNode && node.isComment) {
                nodes.push(node);
            }
        });

        return nodes;
    }

    getMultilineNodes(): AntlersNode[] {
        const nodes: AntlersNode[] = [];

        this.doc.getAllNodes().forEach((node) => {
            if (node instanceof AntlersNode && !node.isComment && (node.startPosition?.line != node.endPosition?.line)) {
                nodes.push(node);
            }
        });

        return nodes;
    }

    getMultiLineComments(): AntlersNode[] {
        const nodes: AntlersNode[] = [];

        this.getComments().forEach((comment) => {
            if (comment.startPosition?.line != comment.endPosition?.line) {
                nodes.push(comment);
            }
        });

        return nodes;
    }

    /**
     * Retrieves all literal and escaped content nodes in the document.
     */
    getAllLiteralNodes(): (LiteralNode | EscapedContentNode)[] {
        const nodes: (LiteralNode | EscapedContentNode)[] = [];

        this.doc.getAllNodes().forEach((node) => {
            if (node instanceof LiteralNode || node instanceof EscapedContentNode) {
                nodes.push(node);
            }
        });

        return nodes;
    }

    getStructuralNodes(): AntlersNode[] {
        const nodes: AntlersNode[] = [];

        this.doc.getDocumentParser().getRenderNodes().forEach((node) => {
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

    getAllRuntimeNodes(): AbstractNode[] {
        const allNodes: AbstractNode[] = [];

        this.doc.getAllNodes().forEach((node) => {
            if (node instanceof ParserFailNode || node instanceof AntlersNode) {
                if (node.runtimeNodes.length > 0) {
                    node.runtimeNodes.forEach((runtimeNode) => {
                        allNodes.push(runtimeNode);
                    });
                }
            }
        });

        return allNodes;
    }

    getAllParameterNodes(): ParameterNode[] {
        const allParameters: ParameterNode[] = [];

        this.doc.getAllNodes().forEach((node) => {
            if (node instanceof ParserFailNode || node instanceof AntlersNode) {
                if (node.hasParameters) {
                    node.parameters.forEach((parameter) => {
                        allParameters.push(parameter);
                    });
                }
            }
        });

        return allParameters;
    }

    getAssignmentNodes(): AbstractNode[] {
        return NodeQueries.findAssignmentNodes(this.getAllRuntimeNodes());
    }
}