import * as ls from 'vscode-languageserver-types';
import { AntlersError, ErrrorLevel } from '../runtime/errors/antlersError';
import { AbstractNode, ParameterNode, AntlersNode } from '../runtime/nodes/abstractNode';
import { Position } from '../runtime/nodes/position';

export function anltersErrorsToDiagnostics(errors: AntlersError[]): ls.Diagnostic[] {
    const diagnostics: ls.Diagnostic[] = [];

    errors.forEach((error) => {
		let range:ls.Range | null = null;

		if (error.node != null) {
			range = nodeToRange(error.node);
		} else {
			range = {
				start: { line: 1, character: 1},
				end: { line: 1, character: 1},
			};
		}

        let severity: ls.DiagnosticSeverity = 1;

        if (error.level == ErrrorLevel.Warning) {
            severity = 2;
        }

        diagnostics.push({
            severity: severity,
            range: range,
            message: "[" + error.errorCode + "] " + error.message,
            source: 'antlers'
        });
    });

    return diagnostics;
}

export function antlersPositionToVsCode(position: Position | null): ls.Position {
    if (position == null) {
        return {
            character: 0,
            line: 0
        };
    }

    return {
        character: position.char,
        line: position.line - 1
    };
}

export function nodeToRange(node: AbstractNode): ls.Range {
    if (node instanceof ParameterNode) {
        const end = antlersPositionToVsCode(node.valuePosition?.end ?? node.blockPosition?.end ?? node.endPosition);

        return {
            start: antlersPositionToVsCode(node.namePosition?.start ?? node.blockPosition?.start ?? node.startPosition),
            end: {
                character: end.character + 1,
                line: end.line
            }
        };
    }

    return {
        start: antlersPositionToVsCode(node.startPosition),
        end: antlersPositionToVsCode(node.endPosition)
    };
}

export function nodePairToFoldingRange(node: AntlersNode): ls.FoldingRange | null {
    if (node.isClosedBy == null) { return null; }
    let startLine = -1,
        startChar = -1,
        endChar = -1,
        endLine = -1;

    if (node.startPosition != null) {
        startLine = node.startPosition.line - 1;
        startChar = node.startPosition.char;
    }

    if (node.isClosedBy.endPosition != null) {
        endChar = node.isClosedBy.endPosition.char;
        endLine = node.isClosedBy.endPosition.line - 1;
    } else {
        if (node.isClosedBy.startPosition != null) {
            endChar = node.isClosedBy.startPosition.char;
            endLine = node.isClosedBy.startPosition.line - 1;
        }
    }

    if (startLine == -1 || endLine == -1 || startChar == -1 || endChar == -1) {
        return null;
    }

    return {
        kind: ls.FoldingRangeKind.Region,
        startLine: startLine,
        endLine: endLine,
        startCharacter: startChar,
        endCharacter: endChar
    };
}

export function multilineCommentToFoldingRange(node: AntlersNode): ls.FoldingRange | null {
    let startLine = -1,
        startChar = -1,
        endChar = -1,
        endLine = -1;

    if (node.startPosition != null) {
        startLine = node.startPosition.line - 1;
        startChar = node.startPosition.char;
    }

    if (node.endPosition != null) {
        endChar = node.endPosition.char;
        endLine = node.endPosition.line - 1;
    }

    if (startLine == -1 || startChar == -1 || endChar == -1 || endLine == -1) {
        return null;
    }

    return {
        kind: ls.FoldingRangeKind.Comment,
        startLine: startLine,
        endLine: endLine,
        startCharacter: startChar,
        endCharacter: endChar
    };
}