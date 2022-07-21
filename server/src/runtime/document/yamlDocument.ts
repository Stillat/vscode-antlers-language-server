import * as YAML from 'yaml';
import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types';
import { Position } from '../nodes/position';
import { DocumentOffset } from '../parser/documentOffset';
import { LineOffset } from '../parser/lineOffset';
import { StringUtilities } from '../utilities/stringUtilities';

export class YamlDocument {
    private content = '';
    private ranges: YAMLRange[] = [];
    private lastDocumentOffsetKey: number | null = null;
    private documentOffsets: Map<number, DocumentOffset> = new Map();
    private lineIndex: Map<number, LineOffset> = new Map();
    private keys: YAMLRange[] = [];
    private values: YAMLRange[] = [];
    public isValid = false;
    public parseError: any = null;

    loadString(text: string) {
        this.content = StringUtilities.normalizeLineEndings(text);
        let doc: YAML.Document.Parsed | null = null;

        try {
            doc = YAML.parseDocument(this.content);
            this.isValid = true;
        } catch (err) {
            this.isValid = false;
            this.parseError = err;
        }

        if (doc == null) {
            return;
        }

        const documentNewLines = [...this.content.matchAll(/(\n)/gm)],
            newLineCountLen = documentNewLines.length;

        let currentLine = 2,
            lastOffset: number | null = null,
            lastStartIndex = 0,
            lastEndIndex = 0;

        for (let i = 0; i < newLineCountLen; i++) {
            const thisNewLine = documentNewLines[i],
                thisIndex = thisNewLine.index ?? 0;
            let indexChar = thisIndex;

            if (lastOffset != null) {
                indexChar = thisIndex - lastOffset;
            } else {
                indexChar = indexChar + 1;
            }

            this.documentOffsets.set(thisIndex, {
                char: indexChar,
                line: currentLine
            });

            let thisStartIndex = 0,
                thisEndIndex = 0;

            if (i == 0) {
                thisEndIndex = indexChar - 1;
                thisStartIndex = 0;
            } else {
                thisStartIndex = lastEndIndex + 1;
                thisEndIndex = thisIndex;
            }

            this.lineIndex.set(currentLine, {
                char: indexChar,
                line: currentLine,
                startIndex: thisStartIndex,
                endIndex: thisEndIndex
            });

            this.lastDocumentOffsetKey = thisIndex;

            currentLine += 1;
            lastOffset = thisIndex;

            lastEndIndex = thisEndIndex;
            lastStartIndex = thisStartIndex;
        }

        const docContents = doc.contents as YAMLMap;

        this.processMap(docContents);
    }

    private processMap(map: YAMLMap | YAMLSeq) {
        if (typeof map.items === 'undefined') {
            return;
        }

        map.items.forEach((item) => {
            this.processItem(item);
        });
    }

    private processItem(item: Pair) {
        if (item.type == 'PAIR') {

            if (item.value instanceof YAMLMap || item.value instanceof YAMLSeq) {
                const key = item.key as Scalar;

                if (key.range != null) {
                    const s1 = this.positionFromOffset(key.range[0], key.range[0]),
                        e1 = this.positionFromOffset(key.range[1], key.range[1]);

                    this.ranges.push({ start: s1, end: e1, length: (e1.char - s1.char) + 1, content: 'property' });
                    this.keys.push({ start: s1, end: e1, length: (e1.char - s1.char) + 1, content: key.value });

                    if (item.value instanceof YAMLSeq) {
                        this.processMap(item.value.items[0]);
                    } else {
                        this.processMap(item.value);
                    }
                    return;
                }
            }

            const pair = item as Pair,
                key = pair.key as Scalar,
                value = pair.value as Scalar;
            if (key.range != null && value.range != null) {
                const s1 = this.positionFromOffset(key.range[0], key.range[0]),
                    e1 = this.positionFromOffset(key.range[1], key.range[1]),

                    s2 = this.positionFromOffset(value.range[0], value.range[0]),
                    e2 = this.positionFromOffset(value.range[1], value.range[1]);

                let vValue = 'string';

                if (parseInt(value.value) == value.value) {
                    vValue = 'number';
                }

                this.ranges.push({ start: s1, end: e1, length: (e1.char - s1.char) + 1, content: 'property' });
                this.keys.push({ start: s1, end: e1, length: (e1.char - s1.char) + 1, content: key.value });
                this.ranges.push({ start: s2, end: e2, length: (e2.char - s2.char) + 1, content: vValue });
                this.values.push({ start: s2, end: e2, length: (e2.char - s2.char) + 1, content: value.value });
            }
        }
    }

    positionFromOffset(offset: number, index: number, isRelativeOffset = false) {
        let lineToUse = 0,
            charToUse = 0;

        if (!this.documentOffsets.has(offset)) {
            if (this.documentOffsets.size == 0) {
                lineToUse = 1;
                charToUse = offset + 1;
            } else {
                let nearestOffset: DocumentOffset | null = null,
                    nearestOffsetIndex: number | null = null,
                    lastOffset: DocumentOffset | null = null,
                    lastOffsetIndex: number | null = null;

                for (const documentOffset of this.documentOffsets.keys()) {
                    if (documentOffset >= offset) {
                        if (lastOffsetIndex != null && offset > lastOffsetIndex) {
                            nearestOffset = lastOffset;
                            nearestOffsetIndex = lastOffsetIndex;
                        } else {
                            nearestOffset = this.documentOffsets.get(documentOffset) as DocumentOffset;
                            nearestOffsetIndex = documentOffset;
                        }
                        break;
                    }
                    lastOffset = this.documentOffsets.get(documentOffset) as DocumentOffset;
                    lastOffsetIndex = documentOffset;
                }

                if (nearestOffset == null) {
                    nearestOffset = lastOffset;
                    nearestOffsetIndex = lastOffsetIndex;
                }

                if (nearestOffset != null) {
                    if (isRelativeOffset) {
                        /*const t_Chars=  this.content.split('');
                        const lineIndex = this.getLineIndex(nearestOffset.line - 1);

                        charToUse = index - (lineIndex?.end ?? 0),
                        lineToUse = nearestOffset.line;*/
                        const t_Chars = this.content.split('');
                        const tChar = offset - (nearestOffsetIndex ?? 0);
                        const offsetDelta = nearestOffset.char - (nearestOffsetIndex ?? 0) + offset;
                        // charToUse = offsetDelta + index;
                        charToUse = tChar;
                        lineToUse = nearestOffset.line;

                        if (offset <= (nearestOffsetIndex ?? 0)) {
                            lineToUse = nearestOffset.line;
                            charToUse = offset + 1;
                        } else {
                            lineToUse = nearestOffset.line + 1;
                        }
                    } else {
                        const t_Chars = this.content.split('');
                        const tChar = offset - (nearestOffsetIndex ?? 0);
                        const offsetDelta = nearestOffset.char - (nearestOffsetIndex ?? 0) + offset;
                        // charToUse = offsetDelta + index;
                        charToUse = tChar;
                        lineToUse = nearestOffset.line;

                        if (offset <= (nearestOffsetIndex ?? 0)) {
                            lineToUse = nearestOffset.line;
                            charToUse = offset + 1;
                        } else {
                            lineToUse = nearestOffset.line + 1;
                        }
                    }
                } else {
                    if (this.lastDocumentOffsetKey != null) {
                        const lastOffset = this.documentOffsets.get(this.lastDocumentOffsetKey) as DocumentOffset;
                        lineToUse = lastOffset.line + 1;
                        charToUse = offset + this.lastDocumentOffsetKey;
                    }
                }
            }
        } else {
            const offsetDetails = this.documentOffsets.get(offset) as DocumentOffset;

            lineToUse = offsetDetails.line;
            charToUse = offsetDetails.char;
        }

        const position = new Position();

        position.index = index;
        position.offset = offset;
        position.line = lineToUse;
        position.char = charToUse;

        return position;
    }

    getRanges(): YAMLRange[] {
        return this.ranges;
    }

    getKeys(): YAMLRange[] {
        return this.keys;
    }

    getValues(): YAMLRange[] {
        return this.values;
    }
}

interface YAMLRange {
    start: Position,
    end: Position,
    length: number,
    content: string
}