import { AbstractNode, EscapedContentNode, LiteralNode } from '../../nodes/abstractNode';
import { Position } from '../../nodes/position';
import { LanguageParser } from '../../parser/languageParser';

export class NodeQueries {

    static findAssignmentNodes(nodes: AbstractNode[]): AbstractNode[] {
        const returnNodes: AbstractNode[] = [];

        for (let i = 0; i < nodes.length; i++) {
            if (LanguageParser.isAssignmentOperatorNode(nodes[i])) {
                returnNodes.push(nodes[i]);
            }
        }

        return returnNodes;
    }

    static findAbstractNodesBefore(node: AbstractNode, nodes: AbstractNode[]): AbstractNode[] {
        return this.findAbstractNodesBeforePosition(node.startPosition, nodes);
    }

    static findAbstractNodesBeforePosition(position: Position | null, nodes: AbstractNode[]): AbstractNode[] {
        if (position == null) {
            return [];
        }

        const subNodes: AbstractNode[] = [];

        for (let i = 0; i < nodes.length; i++) {
            const checkNode = nodes[i];

            if (checkNode.startPosition != null) {
                if (checkNode.startPosition.index > position.index) {
                    break;
                }

                subNodes.push(checkNode);
            }
        }

        return subNodes;
    }

    static isBefore(node: AbstractNode, position: Position) {
        if (node.startPosition == null) { return false; }

        return node.startPosition.index < position.index;
    }

    static isAfter(node: AbstractNode, position: Position) {
        if (node.startPosition == null) { return false; }

        return node.startPosition.index > position.index;
    }

    static findNodesBeforePosition(position: Position | null, nodes: AbstractNode[]): AbstractNode[] {
        const beforeNodes: AbstractNode[] = [];

        if (position == null) {
            return beforeNodes;
        }

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];

            if (NodeQueries.isLiteralType(node)) {
                continue;
            }

            if (node.startPosition != null && node.endPosition != null) {
                if (node.startPosition.index > position.index) {
                    break;
                }

                beforeNodes.push(node);
            }
        }

        return beforeNodes;
    }

    static findNodesAfterPosition(position: Position | null, nodes: AbstractNode[]): AbstractNode[] {
        const afterNodes: AbstractNode[] = [];

        if (position == null) {
            return afterNodes;
        }

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];

            if (NodeQueries.isLiteralType(node)) {
                continue;
            }

            if (node.startPosition != null) {
                if (node.startPosition.index > position.index) {
                    afterNodes.push(node);
                }
            }
        }

        return afterNodes;
    }

    static findNodeBeforePosition(position: Position | null, nodes: AbstractNode[]): AbstractNode | null {
        if (position == null) {
            return null;
        }

        let lastNode: AbstractNode | null = null;

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];

            if (NodeQueries.isLiteralType(node)) {
                continue;
            }

            if (node.startPosition != null) {
                if (node.startPosition.index > position.index) {
                    break;
                }

                lastNode = node;
            }
        }

        return lastNode;
    }

    static findNodeAfterPosition(position: Position | null, nodes: AbstractNode[]): AbstractNode | null {
        if (position == null) {
            return null;
        }

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];

            if (NodeQueries.isLiteralType(node)) {
                continue;
            }

            if (node.startPosition != null) {
                if (node.startPosition.index > position.index) {
                    return node;
                }
            }
        }

        return null;
    }

    /**
     * Locates a node at the provided position.
     * 
     * @param position 
     * @param nodes 
     * @returns 
     */
    static findNodeAtPosition(position: Position | null, nodes: AbstractNode[]): AbstractNode | null {
        if (position == null) {
            return null;
        }

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];

            if (NodeQueries.isLiteralType(node)) {
                continue;
            }

            if (node.startPosition != null && node.endPosition != null) {
                if (position.index >= node.startPosition.index && position.index <= node.endPosition.index) {
                    return node;
                }
            }
        }

        return null;
    }

    static isLiteralType(node: AbstractNode): boolean {
        if (node instanceof EscapedContentNode || node instanceof LiteralNode) {
            return true;
        }

        return false;
    }
}