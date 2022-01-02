import TagManager from '../../../antlers/tagManagerInstance';
import { AbstractNode, ConditionNode, ParserFailNode, AntlersNode } from '../../nodes/abstractNode';
import { Position } from '../../nodes/position';

export class AntlersNodeQueries {
	
    static isPairedNode(node: AbstractNode) {
        if (node instanceof ConditionNode) {
            return true;
        }

        if (node instanceof ParserFailNode || node instanceof AntlersNode) {
            return node.isClosedBy != null;
        }

        return false;
    }

	static findAncestorsBeforePosition(position: Position, documentNodes: AntlersNode[]): AntlersNode[] {
		const nodesToReturn: AntlersNode[] = [];

		const skippedNodes: AntlersNode[] = [];
		let forceSkipLine = -1,
			forceSkipOffset = -1; // Hold a reference to each symbol we've skipped on purpose.


		for (let i = 0; i < documentNodes.length; i++) {
			const currentNode = documentNodes[i];

			if (currentNode.isClosedBy != null) {
				if (currentNode.isClosedBy.endPosition?.isBefore(position)) {
					skippedNodes.push(currentNode);
					skippedNodes.push(currentNode.isClosedBy);

					forceSkipLine = currentNode.isClosedBy.endPosition.line;
					forceSkipOffset = currentNode.isClosedBy.endPosition.char;
				}
			}

			if (forceSkipLine > -1) {
				if (currentNode.endPosition != null) {
					if (currentNode.endPosition.line < forceSkipLine) {
						continue;
					}

					if (currentNode.endPosition.line == forceSkipLine && forceSkipOffset > -1) {
						if (currentNode.endPosition.char < forceSkipOffset) {
							continue;
						}
					}
				}
			}

			if (currentNode.startPosition != null) {
				if (position.isBefore(currentNode.startPosition)) {
					break;
				}

				// Skip nodes that are not visible to the current position.
				if (currentNode.startPosition.line == position.line &&
					position.char <= currentNode.startPosition.char) {
					skippedNodes.push(currentNode);
					continue;
				}
			}

			if (TagManager.instance?.requiresClose(currentNode) && currentNode.isClosedBy != null) {
				const closingNode = currentNode.isClosedBy as AntlersNode;

				if (closingNode.startPosition?.isBefore(position)) {
					skippedNodes.push(currentNode);
					skippedNodes.push(closingNode);
					continue;
				} else if (closingNode.startPosition?.line == position.line &&
					closingNode.startPosition?.char < position.char) {
					skippedNodes.push(currentNode);
				} else {
					nodesToReturn.push(currentNode);
				}
			} else {
				// At this point, we are not analyzing a tag closing pair.
				// However, we may encounter a value that is enclosed
				// within the scope of a pair that we skipped.
				//
				// Example: We should _not_ add posts to the scope list.
				// {{ collection:articles as="posts" }}
				//    {{ posts }}
				//    {{ /posts }}
				// {{ /collection:articles}}
				//      [|]
				if (currentNode.parent != null) {
					const parent = currentNode.parent as AntlersNode;

					if (skippedNodes.includes(parent)) {
						skippedNodes.push(currentNode);
						continue;
					} else {
						if (currentNode.endPosition?.isBefore(position)) {
							nodesToReturn.push(currentNode);
						} else {
							skippedNodes.push(currentNode);
						}
					}
				} else {
					nodesToReturn.push(currentNode);
				}
			}
		}

		return nodesToReturn;
	}

}