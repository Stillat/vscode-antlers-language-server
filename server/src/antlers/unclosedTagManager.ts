import { Position } from "vscode-languageserver-textdocument";
import { AntlersNode } from '../runtime/nodes/abstractNode.js';

export class UnclosedTagManager {
    static unclosedNodes: Map<string, AntlersNode[]> = new Map();

    static clear(documentUri: string) {
        this.unclosedNodes.delete(documentUri);
    }

    static registerNodes(documentUri: string, nodes: AntlersNode[]) {
        this.unclosedNodes.set(documentUri, nodes);
    }

    static getUnclosedTags(documentUri: string, position: Position): AntlersNode[] {
        const nodesToReturn: AntlersNode[] = [];

        if (this.unclosedNodes.has(documentUri) == false) {
            return nodesToReturn;
        }

        const docNodes = this.unclosedNodes.get(documentUri) as AntlersNode[];

        if (docNodes.length == 0) {
            return nodesToReturn;
        }

        const checkLine = position.line + 1;

        for (let i = 0; i < docNodes.length; i++) {
            const thisNode = docNodes[i];

            if (
                thisNode.endPosition?.line == checkLine &&
                position.character > thisNode.endPosition.char
            ) {
                nodesToReturn.push(thisNode);
            } else if (checkLine > (thisNode.endPosition?.line ?? 0)) {
                nodesToReturn.push(thisNode);
            }
        }

        return nodesToReturn;
    }

    static hasUnclosedTags(documentUri: string, position: Position): boolean {
        if (this.unclosedNodes.has(documentUri) == false) {
            return false;
        }

        const unclosedNodes = this.getUnclosedTags(documentUri, position);

        return unclosedNodes.length > 0;
    }
}
