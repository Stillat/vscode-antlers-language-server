import { Range, SemanticTokensBuilder } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { sessionDocuments } from '../languageService/documents';
import { AbstractNode, ModifierNameNode } from '../runtime/nodes/abstractNode';

export interface SemanticTokenProvider {
    readonly legend: { types: string[]; modifiers: string[] };
    getSemanticTokens(
        document: TextDocument,
        ranges?: Range[]
    ): Promise<number[]>;
}

const tokenTypes = new Map<string, number>();
const tokenModifiers = new Map<string, number>();

export function newSemanticTokenProvider(): SemanticTokenProvider {
    const legend = {
        types: [
            "comment",
            "string",
            "keyword",
            "number",
            "regexp",
            "operator",
            "namespace",
            "type",
            "struct",
            "class",
            "interface",
            "enum",
            "typeParameter",
            "function",
            "method",
            "macro",
            "variable",
            "parameter",
            "property",
            "label",
            "antlersAttribute"
        ],
        modifiers: [
            "declaration",
            "documentation",
            "readonly",
            "static",
            "abstract",
            "deprecated",
            "modification",
            "async",
        ],
    };

    legend.types.forEach((tokenType, index) => tokenTypes.set(tokenType, index));

    legend.modifiers.forEach((tokenModifier, index) =>
        tokenModifiers.set(tokenModifier, index)
    );

    return {
        legend,
        async getSemanticTokens(
            document: TextDocument,
            ranges?: Range[]
        ): Promise<number[]> {
            const docPath = decodeURIComponent(document.uri),
                builder = new SemanticTokensBuilder(),
                sourceHighlightNodes: AbstractNode[] = [];

            if (sessionDocuments.hasDocument(docPath)) {
                const antlersDocument = sessionDocuments.getDocument(docPath);

                const nodes = antlersDocument.nodes.getAllRuntimeNodes();
                nodes.forEach((node) => {
                    if (node instanceof ModifierNameNode) {
                        sourceHighlightNodes.push(node);
                    }
                });

                const nodeLineMap: Map<number, AbstractNode[]> = new Map();

                sourceHighlightNodes.forEach((node) => {
                    if (node.startPosition != null) {
                        if (!nodeLineMap.has(node.startPosition.line)) {
                            nodeLineMap.set(node.startPosition.line, []);
                        }

                        nodeLineMap.get(node.startPosition.line)?.push(node);
                    }
                });

                const nodesToUse: AbstractNode[] = [];

                const allLines = Array.from(nodeLineMap.keys());
                const sortedLines = allLines.sort((a, b) => {
                    return a - b;
                });

                sortedLines.forEach((line) => {
                    const lineNodes = nodeLineMap.get(line) as AbstractNode[];
                    const sortedNodes = lineNodes.sort((a, b) => {
                        return (a.startPosition?.char ?? 0) - (b.startPosition?.char ?? 0);
                    });

                    sortedNodes.forEach((node) => {
                        nodesToUse.push(node);
                    });
                });

                nodesToUse.forEach((node) => {
                    if (node instanceof ModifierNameNode) {
                        if (node.startPosition != null && node.endPosition != null) {
                            builder.push(
                                node.startPosition.line - 1,
                                node.startPosition.char,
                                node.endPosition.char - node.startPosition.char,
                                _encodeTokenType("function"),
                                _encodeTokenModifiers([])
                            );
                        }
                    }
                });

                const antlersParameters = antlersDocument.nodes.getAllParameterNodes();

                antlersParameters.forEach((parameter) => {
                    if (parameter.namePosition != null && parameter.namePosition.start != null && parameter.namePosition.end != null) {
                        builder.push(
                            parameter.namePosition.start.line - 1,
                            parameter.namePosition.start.char - 1,
                            (parameter.namePosition.end.char - parameter.namePosition.start.char),
                            _encodeTokenType("antlersAttribute"),
                            _encodeTokenModifiers([])
                        );
                    }
                });
            }

            return builder.build().data;
        },
    };
}

function _encodeTokenModifiers(strTokenModifiers: string[]): number {
    let result = 0;
    for (let i = 0; i < strTokenModifiers.length; i++) {
        const tokenModifier = strTokenModifiers[i];
        if (tokenModifiers.has(tokenModifier)) {
            result = result | (1 << tokenModifiers.get(tokenModifier)!);
        } else if (tokenModifier === "notInLegend") {
            result = result | (1 << (tokenModifiers.size + 2));
        }
    }
    return result;
}

function _encodeTokenType(tokenType: string): number {
    if (tokenTypes.has(tokenType)) {
        return tokenTypes.get(tokenType)!;
    } else if (tokenType === "notInLegend") {
        return tokenTypes.size + 2;
    }
    return 0;
}
