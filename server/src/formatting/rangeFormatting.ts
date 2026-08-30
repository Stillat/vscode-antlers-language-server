import { Position } from "vscode-languageserver-protocol";
import { Range, TextDocument } from "vscode-languageserver-textdocument";

export function completeLineRange(document: TextDocument, requestedRange: Range): Range {
    const start = Position.create(requestedRange.start.line, 0);
    let end = requestedRange.end;

    if (end.character > 0) {
        const nextLineOffset = document.offsetAt(Position.create(end.line + 1, 0));
        end = document.positionAt(nextLineOffset);
    }

    return { start, end };
}

export function commonIndent(text: string): string {
    const indents = text
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0)
        .map((line) => /^[\t ]*/.exec(line)?.[0] ?? "");

    if (indents.length === 0) {
        return "";
    }

    let prefix = indents[0];

    for (const indent of indents.slice(1)) {
        while (!indent.startsWith(prefix) && prefix.length > 0) {
            prefix = prefix.slice(0, -1);
        }
    }

    return prefix;
}

export function reindentFormattedRange(source: string, formatted: string): string {
    const indent = commonIndent(source);
    const lineEnding = source.includes("\r\n") ? "\r\n" : "\n";
    const hadTrailingNewline = /\r?\n$/.test(source);
    const dedentedResult = formatted.trimEnd();
    let result = dedentedResult
        .split(/\r?\n/)
        .map((line) => line.length > 0 ? indent + line : line)
        .join(lineEnding);

    if (hadTrailingNewline) {
        result += lineEnding;
    }

    return result;
}
