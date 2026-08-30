import { Range, SemanticTokensBuilder } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { sessionDocuments } from '../languageService/documents.js';
import ProjectManager from '../projects/projectManager.js';
import TagManager from '../antlers/tagManagerInstance.js';
import {
    AbstractNode,
    AntlersNode,
    ModifierNameNode,
    ModifierNode,
    VariableNode
} from '../runtime/nodes/abstractNode.js';

interface SemanticTokenProvider {
    readonly legend: typeof semanticTokenLegend;
    getSemanticTokens(
        document: TextDocument,
        ranges?: Range[]
    ): Promise<number[]>;
}

interface SourceToken {
    line: number;
    character: number;
    length: number;
    type: string;
    modifiers: string[];
    priority: number;
}

export const semanticTokenLegend = {
    tokenTypes: [
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
        "label"
    ],
    tokenModifiers: [
        "declaration",
        "documentation",
        "readonly",
        "static",
        "abstract",
        "deprecated",
        "modification",
        "async"
    ]
};

const tokenTypes = new Map(
    semanticTokenLegend.tokenTypes.map((tokenType, index) => [tokenType, index])
);
const tokenModifiers = new Map(
    semanticTokenLegend.tokenModifiers.map((tokenModifier, index) => [tokenModifier, index])
);

function isKnownProjectField(name: string): boolean {
    return ProjectManager.instance?.hasStructure() === true &&
        ProjectManager.instance.getStructure().findAnyBlueprintField(name) != null;
}

function tokenFromRuntimeNode(
    node: AbstractNode,
    type: string,
    priority: number,
    modifiers: string[] = []
): SourceToken | null {
    if (node.startPosition == null || node.endPosition == null) {
        return null;
    }

    const length = node.endPosition.char - node.startPosition.char;

    if (length <= 0) {
        return null;
    }

    return {
        line: node.startPosition.line - 1,
        character: node.startPosition.char,
        length,
        type,
        modifiers,
        priority
    };
}

function tokenFromAntlersHead(node: AntlersNode): SourceToken | null {
    if (
        node.name == null ||
        node.nameStartsOn == null ||
        node.name.compound.length === 0 ||
        node.isComment
    ) {
        return null;
    }

    let type = "variable";

    if (node.isConditionNode) {
        type = "keyword";
    } else if (
        node.isTagNode ||
        TagManager.instance?.findTag(node.runtimeName()) != null
    ) {
        type = "function";
    } else if (isKnownProjectField(node.name.compound)) {
        type = "property";
    }

    return {
        line: node.nameStartsOn.line - 1,
        character: Math.max(
            0,
            node.nameStartsOn.char - 1 - node.rawStart.length
        ),
        length: node.name.compound.length,
        type,
        modifiers: [],
        priority: 100
    };
}

function overlapsRange(token: SourceToken, range: Range): boolean {
    if (token.line < range.start.line || token.line > range.end.line) {
        return false;
    }

    const tokenEnd = token.character + token.length;
    const rangeStart = token.line === range.start.line ? range.start.character : 0;
    const rangeEnd = token.line === range.end.line
        ? range.end.character
        : Number.MAX_SAFE_INTEGER;

    return tokenEnd > rangeStart && token.character < rangeEnd;
}

function normalizeTokens(tokens: SourceToken[], ranges?: Range[]): SourceToken[] {
    const filtered = ranges == null || ranges.length === 0
        ? tokens
        : tokens.filter((token) => ranges.some((range) => overlapsRange(token, range)));

    filtered.sort((left, right) =>
        left.line - right.line ||
        left.character - right.character ||
        right.priority - left.priority ||
        right.length - left.length
    );

    const normalized: SourceToken[] = [];
    let lastLine = -1;
    let lastEnd = -1;

    for (const token of filtered) {
        if (token.line !== lastLine) {
            lastLine = token.line;
            lastEnd = -1;
        }

        if (token.character < lastEnd) {
            continue;
        }

        normalized.push(token);
        lastEnd = token.character + token.length;
    }

    return normalized;
}

export function newSemanticTokenProvider(): SemanticTokenProvider {
    return {
        legend: semanticTokenLegend,
        async getSemanticTokens(
            document: TextDocument,
            ranges?: Range[]
        ): Promise<number[]> {
            const docPath = decodeURIComponent(document.uri);
            const builder = new SemanticTokensBuilder();

            if (!sessionDocuments.hasDocument(docPath)) {
                return builder.build().data;
            }

            const antlersDocument = sessionDocuments.getDocument(docPath);
            const sourceTokens: SourceToken[] = [];

            for (const node of antlersDocument.getAllAntlersNodes()) {
                const token = tokenFromAntlersHead(node);

                if (token != null) {
                    sourceTokens.push(token);
                }
            }

            for (const node of antlersDocument.nodes.getAllRuntimeNodes()) {
                if (node instanceof ModifierNameNode) {
                    const isDeprecated = node.parent instanceof ModifierNode &&
                        node.parent.modifier?.isDeprecated === true;
                    const token = tokenFromRuntimeNode(
                        node,
                        "method",
                        90,
                        isDeprecated ? ["deprecated"] : []
                    );

                    if (token != null) {
                        sourceTokens.push(token);
                    }
                } else if (node instanceof VariableNode) {
                    const token = tokenFromRuntimeNode(
                        node,
                        isKnownProjectField(node.name) ? "property" : "variable",
                        10
                    );

                    if (token != null) {
                        sourceTokens.push(token);
                    }
                }
            }

            for (const parameter of antlersDocument.nodes.getAllParameterNodes()) {
                if (
                    parameter.namePosition?.start == null ||
                    parameter.namePosition.end == null
                ) {
                    continue;
                }

                sourceTokens.push({
                    line: parameter.namePosition.start.line - 1,
                    character: parameter.namePosition.start.char,
                    length: parameter.namePosition.end.char - parameter.namePosition.start.char,
                    type: "parameter",
                    modifiers: [],
                    priority: 80
                });
            }

            for (const token of normalizeTokens(sourceTokens, ranges)) {
                builder.push(
                    token.line,
                    token.character,
                    token.length,
                    encodeTokenType(token.type),
                    encodeTokenModifiers(token.modifiers)
                );
            }

            return builder.build().data;
        }
    };
}

function encodeTokenModifiers(modifiers: string[]): number {
    let result = 0;

    for (const modifier of modifiers) {
        const index = tokenModifiers.get(modifier);

        if (index != null) {
            result |= 1 << index;
        }
    }

    return result;
}

function encodeTokenType(type: string): number {
    return tokenTypes.get(type) ?? 0;
}
