import { StringUtilities } from '../../utilities/stringUtilities';

export class IndentLevel {
    static indentRelative(value: string, targetIndent: number): string {
        const sourceLines: string[] = StringUtilities.breakByNewLine(value);
        let reflowedLines: string[] = [];

        // Clean up leading new lines.
        for (let i = 0; i < sourceLines.length; i++) {
            const thisLine = sourceLines[i];

            if (thisLine.trim().length > 0) {
                reflowedLines = sourceLines.slice(i);
                break;
            }
        }

        // Clean up trailing whitespace.
        for (let i = reflowedLines.length - 1; i >= 0; i--) {
            const thisLine = reflowedLines[i];

            if (thisLine.trim().length == 0) {
                reflowedLines.pop();
            } else {
                break;
            }
        }

        let leastIndentChange = -1;
        let thatLine = '';
        // Find which line currently has the least amount of left whitespace.
        for (let i = 0; i < reflowedLines.length; i++) {
            const thisLine = reflowedLines[i],
                checkLine = thisLine.trimLeft(),
                wsDiff = thisLine.length - checkLine.length;

            if (i == 0) {
                leastIndentChange = wsDiff;
                thatLine = thisLine;
            } else {
                if (wsDiff < leastIndentChange) {
                    leastIndentChange = wsDiff;
                    thatLine = thisLine;
                }
            }
        }

        // Remove the discovered leading whitespace and then apply our new (relative) indent level.
        if (leastIndentChange >= 0) {
            const targetWs = ' '.repeat(targetIndent);

            for (let i = 0; i < reflowedLines.length; i++) {
                const thisLine = reflowedLines[i];

                if (thisLine.trim().length == 0) { reflowedLines[i] = ''; continue; }
                const reflowed = thisLine.substring(leastIndentChange);

                if (i == 0) {
                    reflowedLines[i] = thisLine.trimLeft();
                    continue;
                } else {
                    reflowedLines[i] = targetWs + reflowed.trimLeft();
                }
            }
        }

        return reflowedLines.join("\n");
    }

    static shiftIndent(value: string, targetIndent: number, skipFirst = false, tabSize = 4, adjustStructures = true, skipLast = false): string {
        if (targetIndent < 0) {
            targetIndent = 0;
        }

        let lines = StringUtilities.breakByNewLine(value.trim()),
            reflowedLines: string[] = [];

        for (let i = 0; i < lines.length; i++) {
            if (i == 0 && skipFirst) { reflowedLines.push(lines[i]); continue; }
            if (i == lines.length - 1 && skipLast) { reflowedLines.push(lines[i]); continue; }
            const line = lines[i];

            reflowedLines.push(' '.repeat(targetIndent) + line);
        }

        let result = reflowedLines.join("\n");

        if (adjustStructures && reflowedLines.length > 0 && (targetIndent - tabSize > tabSize) && reflowedLines[reflowedLines.length - 1].trim() == ') }}') {
            lines = StringUtilities.breakByNewLine(result.trim());
            reflowedLines = [];

            for (let i = 0; i < lines.length; i++) {
                if (i == 0 && skipFirst) { reflowedLines.push(lines[i]); continue; }
                if (i == lines.length - 1 && skipLast) { reflowedLines.push(lines[i]); continue; }
                const line = lines[i];

                if (i == lines.length - 1) {
                    reflowedLines.push(line);
                    break;
                }

                reflowedLines.push(' '.repeat(tabSize) + line);
            }

            result = reflowedLines.join("\n");
        }

        return result;
    }

    static shiftClean(value: string, indent: number): string {
        const lines = StringUtilities.breakByNewLine(value),
            reflowedLines: string[] = [],
            pad = ' '.repeat(indent);
        let hasFoundContent = false;

        lines.forEach((line) => {
            if (line.trim().length > 0) {
                hasFoundContent = true;
            }

            if (!hasFoundContent) { return; }

            reflowedLines.push(pad + line);
        });

        return reflowedLines.join("\n");
    }

    static inferIndentLevel(structureLines: string[], value: string, defaultIndent: number): InferredIndentLevel {
        let targetLevel = 0,
            targetLevelFoundOn = -1;
        for (let i = 0; i < structureLines.length; i++) {
            const thisLine = structureLines[i];

            if (thisLine.includes(value)) {
                const trimmed = thisLine.trimLeft();

                targetLevel = thisLine.length - trimmed.length;
                targetLevelFoundOn = i;
                break;
            }
        }

        if (targetLevelFoundOn > 0) {
            for (let i = targetLevelFoundOn - 1; i >= 0; i--) {
                const thisLine = structureLines[i],
                    trimmed = thisLine.trim(),
                    trimmedLeft = thisLine.trimLeft(),
                    checkLevel = thisLine.length - trimmed.length;

                if (trimmedLeft.length == 0) { continue; }

                if (checkLevel != targetLevel && checkLevel < targetLevel) {
                    const inferred = targetLevel - checkLevel;

                    return {
                        targetLevel: targetLevel,
                        referenceLevel: checkLevel,
                        sourceTabSize: inferred
                    };
                }
            }
        }

        return {
            targetLevel: targetLevel,
            referenceLevel: targetLevel,
            sourceTabSize: defaultIndent
        };
    }

    static indent(structureLines: string[], value: string, defaultIndent: number): string {
        const levels = IndentLevel.inferIndentLevel(structureLines, value, defaultIndent);

        return ' '.repeat(levels.targetLevel);
    }
}

interface InferredIndentLevel {
    targetLevel: number,
    referenceLevel: number,
    sourceTabSize: number
}