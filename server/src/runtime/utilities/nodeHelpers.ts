import { AbstractNode, AntlersNode, VariableNode, PathNode } from '../nodes/abstractNode.js';
import { StringUtilities } from './stringUtilities.js';

export class NodeHelpers {
    static readonly DistMax = 65000;

    static distance(left: AbstractNode, right: AbstractNode) {
        if (left.endPosition == null || right.startPosition == null) {
            return this.DistMax;
        }

        return right.startPosition.index - left.endPosition.index;
    }

    static getTrueName(node: AntlersNode) {
        if (node.originalNode != null) {
            return node.originalNode.name?.name ?? '';
        }

        return node.name?.name ?? '';
    }

    static getSimpleVarName(variableNode: VariableNode) {
        if (variableNode.variableReference != null && variableNode.variableReference.pathParts.length == 1) {
            if (variableNode.variableReference.pathParts[0] instanceof PathNode) {
                return variableNode.variableReference.pathParts[0].name;
            }
        }
        return '';
    }

    static isVariableMatching(node: AbstractNode, path: string) {
        if (node instanceof VariableNode) {
            return node.name == path;
        }

        return false;
    }

    static mergeVarContentLeft(content: string, referenceNode: AbstractNode, target: VariableNode) {
        target.mergeRefName = target.name;
        target.endPosition = referenceNode.endPosition;
        target.name = target.name + content;

        return target;
    }

    static mergeVarContentRight(content: string, referenceNode: AbstractNode, target: VariableNode) {
        target.mergeRefName = target.name;
        target.startPosition = referenceNode.startPosition;
        target.name = content + target.name;

        return target;
    }

    static mergeVarRight(left: VariableNode, right: VariableNode) {
        right.mergeRefName = right.name;
        right.startPosition = left.startPosition;
        right.name = left.name + right.name;

        return right;
    }

    static getUnrefName(text: string) {
        return StringUtilities.trimLeft(text, ':.');
    }
}