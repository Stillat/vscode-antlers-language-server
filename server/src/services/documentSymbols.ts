import {
    DocumentSymbol,
    DocumentSymbolParams,
    SymbolKind,
} from "vscode-languageserver";
import { sessionDocuments } from '../languageService/documents.js';
import { AntlersNode } from '../runtime/nodes/abstractNode.js';
import { nodeToRange } from "../utils/conversions.js";

function convertNodesToSymbols(nodes: AntlersNode[]): DocumentSymbol[] {
    const symbols: DocumentSymbol[] = [];

    nodes.forEach((node) => {
        if (node.isComment || (node.isClosingTag && !node.isConditionNode)) {
            return;
        }

        if (node.isConditionNode && node.name != null && node.isClosingTag) {
            if (node.name.name == "if" || node.name.name == "unless") {
                return;
            }
        }

        const range = nodeToRange(node);
        let children: DocumentSymbol[] = [];

        if (node.children.length > 0) {
            const structChildren = node.getStructuralChildren();

            if (structChildren.length > 0) {
                children = convertNodesToSymbols(structChildren);
            }
        }
        let kind: SymbolKind = SymbolKind.Field;

        if (node.isTagNode) {
            kind = SymbolKind.Class;
        }

        const nameContent = node.getNameContent().trim(),
            nodeContent = node.getContent().trim();

        let displayContent = nameContent + " " + nodeContent;

        if (nameContent == nodeContent) {
            displayContent = nodeContent;
        }

        displayContent = node.sourceContent;

        if (node.name != null) {
            if (node.name.name == "partial") {
                kind = SymbolKind.File;
            }
        }

        symbols.push({
            range: range,
            kind: kind,
            name: displayContent,
            selectionRange: range,
            children: children,
        });
    });

    return symbols;
}

export function handleDocumentSymbolRequest(params: DocumentSymbolParams): DocumentSymbol[] {
    const documentPath = decodeURIComponent(params.textDocument.uri);

    if (sessionDocuments.hasDocument(documentPath)) {
        const doc = sessionDocuments.getDocument(documentPath),
            structure = doc.nodes.getStructuralNodes();

        return convertNodesToSymbols(structure);
    }

    return [];
}
