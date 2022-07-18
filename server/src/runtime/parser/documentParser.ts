import { AntlersError } from '../errors/antlersError';
import { AntlersErrorCodes } from '../errors/antlersErrorCodes';
import { AbstractNode, AntlersNode, AntlersParserFailNode, CommentParserFailNode, ConditionNode, EscapedContentNode, FragmentPosition, INodeInterpolation, LiteralNode, PhpExecutionNode, PhpParserFailNode, VariableNode } from '../nodes/abstractNode';
import { Position } from '../nodes/position';
import { GlobalRuntimeState } from '../runtime/globalRuntimeState';
import { StringUtilities } from '../utilities/stringUtilities';
import { Md5 } from 'ts-md5/dist/md5';
import { TagIdentifier } from '../nodes/tagIdentifier';
import { AntlersNodeParser } from './antlersNodeParser';
import { TagPairAnalyzer } from '../analyzers/tagPairAnalyzer';
import { RecursiveParentAnalyzer } from '../analyzers/recursiveParentAnalyzer';
import { LanguageParser } from './languageParser';
import { WordScanner } from '../document/scanners/wordScanner';
import { VirtualHierarchy } from './virtualDocument/virtualHierarchy';
import TagManager from '../../antlers/tagManagerInstance';
import { ModifierAnalyzer } from '../analyzers/modifierAnalyzer';
import { ParameterValidator } from '../analyzers/parameterValidator';
import ModifierManager from '../../antlers/modifierManager';
import { IModifier } from '../../antlers/modifierTypes';
import { DocumentOffset } from './documentOffset';
import { LineOffset } from './lineOffset';
import { DocumentIndex } from './documentIndex';
import { FragmentsParser } from './fragmentsParser';
import { IndexRange } from './indexRange';
import { FragmentPositionAnalyzer } from '../analyzers/fragmentPositionAnalyzer';
import { AntlersDocument } from '../document/antlersDocument';
import { getStartPosition } from '../nodes/helpers';
import { InlineNodeAnalyzer } from '../analyzers/inlineNodeAnalyzer';

export class DocumentParser {
    static readonly K_CHAR = 'char';
    static readonly K_LINE = 'line';
    static readonly NewLine = "\n";
    static readonly AtChar = '@';
    static readonly LeftBrace = '{';
    static readonly RightBrace = '}';
    static readonly LeftBracket = '[';
    static readonly RightBracket = ']';
    static readonly String_EscapeCharacter = '\\';
    static readonly String_Terminator_DoubleQuote = '"';
    static readonly String_Terminator_SingleQuote = "'";
    static readonly Punctuation_Question = '?';
    static readonly Punctuation_Equals = '=';
    static readonly Punctuation_Comma = ',';
    static readonly Punctuation_Colon = ':';
    static readonly Punctuation_Semicolon = ';';
    static readonly Punctuation_Exclamation = '!';
    static readonly Punctuation_Pipe = '|';
    static readonly Punctuation_Ampersand = '&';
    static readonly Punctuation_LessThan = '<';
    static readonly Punctuation_GreaterThan = '>';
    static readonly Punctuation_Octothorp = '#';
    static readonly Punctuation_Tilde = '~';
    static readonly Punctuation_FullStop = '.';
    static readonly Punctuation_Dollar = '$';
    static readonly Punctuation_Asterisk = '*';
    static readonly Punctuation_Percent = '%';
    static readonly Punctuation_Plus = '+';
    static readonly Punctuation_Minus = '-';
    static readonly Punctuation_Underscore = '_';
    static readonly Punctuation_ForwardSlash = '/';
    static readonly Punctuation_Caret = '^';

    static readonly LeftParen = '(';
    static readonly RightParent = ')';

    private interpolationRegions: Map<string, INodeInterpolation> = new Map();

    private nodeParser: AntlersNodeParser = new AntlersNodeParser();
    private chars: string[] = [];
    private charLen = 0;
    private lastAntlersNode: AntlersNode | null = null;
    private content = '';
    private originalContent = '';
    private currentIndex = 0;
    private currentContent: string[] = [];
    private sourceContent: string[] = [];
    private startIndex = 0;
    private _recoveryStartIndex = 0;
    private cur: string | null = null;
    private next: string | null = null;
    private prev: string | null = null;
    private nodes: (AbstractNode)[] = [];
    private renderNodes: AbstractNode[] = [];
    private isInterpolatedParser = false;
    private inputLen = 0;
    private documentOffsets: Map<number, DocumentOffset> = new Map();
    private lineIndex: Map<number, LineOffset> = new Map();
    private lastDocumentOffsetKey: number | null = null;
    private isDoubleBrace = false;
    private interpolationEndOffsets: Map<number, number> = new Map();
    private isScanningInterpolations = false;
    private seedStartLine = 1;
    private seedStartchar = 1;

    private frontMatterEndLine = -1;

    private lastAntlersEndIndex = -1;
    private seedOffset = 0;
    private antlersStartIndex: number[] = [];
    private antlersStartPositionIndex: Map<number, number> = new Map();
    private chunkSize = 5;
    private maxLine = 1;
    private currentChunkOffset = 0;
    private isNoParse = false;
    private antlersErrors: AntlersError[] = [];
    private structureErrors: AntlersError[] = [];
    private languageParser: LanguageParser = new LanguageParser();
    private documentPath: string | null = null;
    private pushedErrors: Map<string, AntlersError> = new Map();
    private frontMatter = '';
    private shiftLine = 0;
    private doesHaveUncloseIfStructures = false;
    private doesHaveUnclosedStructures = false;
    private fragmentsParser: FragmentsParser;
    private fragmentsAnalyzer: FragmentPositionAnalyzer;
    private parseChildDocuments = false;

    private structuralErrorCodes:string[] = [
        AntlersErrorCodes.TYPE_PARSE_UNCLOSED_CONDITIONAL,
        AntlersErrorCodes.TYPE_PARSE_UNPAIRED_CONDITIONAL,
        AntlersErrorCodes.TYPE_RECURSIVE_UNPAIRED_NODE,
        AntlersErrorCodes.TYPE_RUNTIME_FATAL_UNPAIRED_LOOP_END,
        AntlersErrorCodes.TYPE_UNPAIRED_CLOSING_TAG
    ];

    constructor() {
        this.fragmentsParser = new FragmentsParser();
        this.fragmentsAnalyzer = new FragmentPositionAnalyzer(this, this.fragmentsParser);
    }

    public readonly structure: VirtualHierarchy = new VirtualHierarchy(this);

    withChildDocuments(parseChildDocuments: boolean) {
        this.parseChildDocuments = parseChildDocuments;

        return this;
    }

    shouldParseChildDocument(): boolean {
        return this.parseChildDocuments;
    }

    hasUnclosedIfStructures() {
        return this.doesHaveUncloseIfStructures;
    }

    hasUnclosedStructures() {
        return this.doesHaveUnclosedStructures;
    }

    getFrontMatter() {
        return this.frontMatter;
    }

    setDocumentPath(path: string | null) {
        this.documentPath = path;
    }

    getFrontMatterEndLine(): number {
        return this.frontMatterEndLine;
    }

    pushError(error: AntlersError) {
        if (error.errorCode == AntlersErrorCodes.TYPE_PARSE_UNCLOSED_CONDITIONAL ||
            error.errorCode == AntlersErrorCodes.TYPE_PARSE_UNPAIRED_CONDITIONAL) {
            this.doesHaveUncloseIfStructures = true;
        }

        const errorHash = error.hash();
        if (!this.pushedErrors.has(errorHash)) {
            this.pushedErrors.set(errorHash, error);
            this.antlersErrors.push(error);

            if (this.structuralErrorCodes.includes(error.errorCode)) {
                this.structureErrors.push(error);
            }
        }
    }

    getInterpolationRegions() {
        return this.interpolationRegions;
    }

    getDocumentPath(): string | null {
        return this.documentPath;
    }

    private checkCurrentOffsets() {
        if (this.currentIndex > this.chars.length) {
            this.cur = null;
            this.prev = null;
            this.next = null;
            return;
        }

        this.cur = this.chars[this.currentIndex];

        this.prev = null;
        this.next = null;

        if (this.currentIndex > 0) {
            this.prev = this.chars[this.currentIndex - 1];
        }

        if ((this.currentIndex + 1) < this.inputLen) {
            let doPeek = true;

            if (this.currentIndex == this.charLen - 1) {
                const nextChunk = StringUtilities.split(
                    StringUtilities.substring(this.content,
                        this.currentChunkOffset + this.chunkSize,
                        this.chunkSize
                    ));
                this.currentChunkOffset += this.chunkSize;

                if (this.currentChunkOffset == this.inputLen) {
                    doPeek = false;
                }

                nextChunk.forEach((nextChar) => {
                    this.chars.push(nextChar);
                    this.charLen += 1;
                });
            }

            if (doPeek && (this.currentIndex + 1) < this.chars.length) {
                this.next = this.chars[this.currentIndex + 1];
            }
        }
    }

    charLeftAt(position: Position | null) {
        if (position == null) {
            return null;
        }

        if (position.char <= 1) {
            return null;
        }

        return this.charAt(this.positionFromCursor(position.line, position.char - 1));
    }

    charLeftAtCursor(line: number, char: number) {
        return this.charLeftAt(this.positionFromCursor(line, char));
    }

    charRightAt(position: Position | null) {
        if (position == null) {
            return null;
        }

        return this.charAt(this.positionFromCursor(position.line, position.char + 1));
    }

    charRightAtCursor(line: number, char: number) {
        return this.charRightAt(this.positionFromCursor(line, char));
    }

    punctuationLeftAt(position: Position | null, tabSize = 4) {
        if (position == null) {
            return null;
        }

        const lineText = this.getLineText(position.line);

        if (lineText == null) {
            return null;
        }

        return WordScanner.findLeftNeighboringNextPunctuation(position.char, lineText, tabSize);
    }

    punctuationLeftAtCursor(line: number, char: number, tabSize = 4) {
        return this.punctuationLeftAt(this.positionFromCursor(line, char), tabSize);
    }

    punctuationRightAt(position: Position | null, tabSize = 4) {
        if (position == null) {
            return null;
        }

        const lineText = this.getLineText(position.line);

        if (lineText == null) {
            return null;
        }

        return WordScanner.findRightBeighboringNextPunctuation(position.char, lineText, tabSize);
    }

    punctuationRightAtCursor(line: number, char: number, tabSize = 4) {
        return this.punctuationRightAt(this.positionFromCursor(line, char), tabSize);
    }

    wordRightAt(position: Position | null, tabSize = 4) {
        if (position == null) {
            return null;
        }

        const lineText = this.getLineText(position.line);

        if (lineText == null) {
            return null;
        }

        const rightWordChar = WordScanner.findRightNeighboringNextAlphaNumeric(position.char, lineText, tabSize);

        if (rightWordChar == null) {
            return null;
        }

        return WordScanner.scanWordAt(rightWordChar, lineText, tabSize);
    }

    wordRightAtCursor(line: number, char: number, tabSize = 4) {
        return this.wordRightAt(this.positionFromCursor(line, char), tabSize);
    }

    wordLeftAt(position: Position | null, tabSize = 4) {
        if (position == null) {
            return null;
        }

        const lineText = this.getLineText(position.line);

        if (lineText == null) {
            return null;
        }

        const leftWordChar = WordScanner.findLeftNeighboringNextAlphaNumeric(position.char, lineText, tabSize);

        if (leftWordChar == null) {
            return null;
        }

        return WordScanner.scanWordAt(leftWordChar, lineText, tabSize);
    }

    wordLeftAtCursor(line: number, char: number, tabSize = 4) {
        return this.wordLeftAt(this.positionFromCursor(line, char), tabSize);
    }

    wordAt(position: Position | null, tabSize = 4) {
        if (position == null) {
            return null;
        }

        const lineText = this.getLineText(position.line);

        if (lineText == null) {
            return null;
        }

        return WordScanner.scanWordAt(position.char, lineText, tabSize);
    }

    getLineText(lineNumber: number): string | null {
        const index = this.getLineIndex(lineNumber);

        if (index != null) {
            return StringUtilities.trimRight(this.getContent().substring(index.start, index.end + 1));
        }

        return null;
    }

    wordAtCursor(line: number, char: number, tabSize = 4) {
        return this.wordAt(this.positionFromCursor(line, char), tabSize);
    }

    charAt(position: Position | null) {
        if (position == null) {
            return null;
        }

        return this.content.substr(position.offset, 1);
    }
    
    getLinesAround(line: number): Map<number, string> {
        const lines: Map<number, string> = new Map();

        let startLine = line - 3,
            endLine = line + 3;

        if (startLine < 1) {
            startLine = 1;
        }

        if (endLine > this.maxLine) {
            endLine = this.maxLine;
        }

        for (let i = startLine; i <= endLine; i++) {
            lines.set(i, this.getLineText(i) ?? '');
        }

        return lines;
    }

    charAtCursor(line: number, char: number) {
        return this.charAt(this.positionFromCursor(line, char));
    }

    getLineIndex(line: number): DocumentIndex | null {
        if (line == this.maxLine) {
            const lastIndex = this.lineIndex.get(line - 1);

            if (lastIndex != null) {
                const startIndex = lastIndex.endIndex + 1,
                    endIndex = this.inputLen - 1;

                return {
                    end: endIndex,
                    start: startIndex
                };
            }

            return null;
        }

        const indexEntry = this.lineIndex.get(line);

        if (indexEntry != null) {
            return {
                start: indexEntry.startIndex,
                end: indexEntry.endIndex
            };
        }

        return null;
    }

    positionFromCursor(line: number, char: number): Position | null {
        if (line == this.maxLine) {
            const lastIndex = this.lineIndex.get(line - 1);

            if (lastIndex != null) {
                const startIndex = lastIndex.endIndex + 1,
                    thisOffset = startIndex + (char - 1);

                const position = new Position();
                position.offset = thisOffset;
                position.line = line;
                position.char = char;
                position.index = thisOffset;

                return position;
            }

            return null;
        }

        const indexEntry = this.lineIndex.get(line);

        if (indexEntry != null) {
            const position = new Position();
            position.offset = indexEntry.startIndex + (char - 1);
            position.line = indexEntry.line;
            position.char = char;
            position.index = indexEntry.startIndex + (char - 1);

            return position;
        }

        return null;
    }

    parse(text: string) {
        this.resetState();

        if (!this.processInputText(text)) {
            return [];
        }

        const indexCount = this.antlersStartIndex.length;
        const lastIndex = indexCount - 1;

        if (indexCount == 0 && !this.isNoParse) {
            const fullDocumentLiteral = new LiteralNode();
            fullDocumentLiteral.withParser(this);
            fullDocumentLiteral.content = this.prepareLiteralContent(this.content);
            fullDocumentLiteral.startPosition = this.positionFromOffset(0, 0);
            fullDocumentLiteral.endPosition = this.positionFromOffset(this.inputLen - 1, this.inputLen - 1);
            fullDocumentLiteral.sourceContent = this.content;
            this.nodes.push(fullDocumentLiteral);
        } else {
            for (let i = 0; i < indexCount; i += 1) {
                const offset = this.antlersStartIndex[i];
                this.seedOffset = offset;

                if (i == 0 && offset > 0 && !this.isNoParse) {
                    const node = new LiteralNode();
                    node.withParser(this);
                    node.content = this.prepareLiteralContent(
                        this.content.substr(0, offset)
                    );

                    if (node.content.length > 0) {
                        node.startPosition = this.positionFromOffset(0, 0);
                        node.endPosition = this.positionFromOffset(offset, offset - 1);
                        const startOffset = (node.startPosition.index ?? 0),
                            endOffset = (node.endPosition.index) + 1;
                        node.sourceContent = this.content.substr(startOffset, endOffset - startOffset);
                        this.nodes.push(node);
                    }
                }

                if (offset < this.lastAntlersEndIndex) {
                    continue;
                }

                this.currentChunkOffset = offset;
                this.resetIntermediateState();
                this.parseIntermediateText();

                if (this.lastAntlersNode != null && this.lastAntlersNode instanceof PhpExecutionNode == false && (this.lastAntlersNode.isComment && !(this.lastAntlersNode instanceof CommentParserFailNode))) {
                    if (i + 1 < indexCount) {
                        const nextAntlersStart = this.antlersStartPositionIndex.get(i + 1) as number;

                        if (this.lastAntlersNode.endPosition != null) {
                            if (nextAntlersStart < this.lastAntlersNode.endPosition.offset) {
                                // We want to skip over any potentital candidates
                                // now to avoid having to process them later.

                                let skipIndex: number | null = null;

                                for (let j = i + 1; j < indexCount; j++) {
                                    if (this.antlersStartIndex[j] > this.lastAntlersNode.endPosition.offset) {
                                        skipIndex = j;
                                        break;
                                    }
                                }

                                if (skipIndex == null) {
                                    const nodeContent = this.prepareLiteralContent(
                                        this.content.substr(this.lastAntlersNode.endPosition.offset + 1)
                                    );

                                    if (nodeContent.length > 0 && !this.isNoParse) {
                                        const literalNode = new LiteralNode();
                                        literalNode.withParser(this);
                                        literalNode.content = nodeContent;

                                        const literalStartOffset = this.lastAntlersNode.endPosition.offset + 1;

                                        literalNode.startPosition = this.positionFromOffset(literalStartOffset, literalStartOffset);
                                        literalNode.endPosition = this.positionFromOffset(this.inputLen, this.inputLen);
                                        const startOffset = (literalNode.startPosition.index ?? 0),
                                            endOffset = (literalNode.endPosition.index) + 1;
                                        literalNode.sourceContent = this.content.substr(startOffset, endOffset - startOffset);
                                        this.nodes.push(literalNode);
                                    }

                                    break;
                                } else {
                                    // Account for literals between a skipped region. If the span length
                                    // is greater than zero, we just left a region where we skipped
                                    // a few Antlers-like nodes, but will encounter literal content
                                    // before we hit the start of the next Antlers start candidate.
                                    const nextStart = this.antlersStartIndex[skipIndex],
                                        spanLen = nextStart - this.lastAntlersNode.endPosition.offset - 1;

                                    if (spanLen > 0) {
                                        let spanStart = this.lastAntlersNode.endPosition.offset,
                                            spanEnd = nextStart - 1;

                                        spanStart += 1;
                                        spanEnd -= 1;

                                        const nodeContent = this.content.substr(spanStart, spanLen);

                                        if (nodeContent.length > 0 && !this.isNoParse) {
                                            const literalNode = new LiteralNode();
                                            literalNode.withParser(this);
                                            literalNode.content = nodeContent;

                                            literalNode.startPosition = this.positionFromOffset(spanStart, spanStart);
                                            literalNode.endPosition = this.positionFromOffset(spanEnd, spanEnd);
                                            const startOffset = (literalNode.startPosition.index ?? 0),
                                                endOffset = (literalNode.endPosition.index) + 1;
                                            literalNode.sourceContent = this.content.substr(startOffset, endOffset - startOffset);
                                            this.nodes.push(literalNode);
                                        }

                                        continue;
                                    }

                                    i = skipIndex - 1;
                                    continue;
                                }
                            }
                        }
                    }
                }

                let shouldProduceLiteralNode = false;

                if (!this.antlersStartPositionIndex.has(this.currentChunkOffset)) {
                    shouldProduceLiteralNode = true;
                } else if (this.lastAntlersEndIndex < this.currentChunkOffset) {
                    shouldProduceLiteralNode = true;
                }

                if (shouldProduceLiteralNode) {

                    if (i + 1 < indexCount) {
                        let nextAntlersStart = this.antlersStartIndex[i + 1];
                        let literalStartIndex = this.lastAntlersEndIndex + 1;

                        if (nextAntlersStart < literalStartIndex) {
                            if (this.lastAntlersEndIndex > nextAntlersStart) {
                                if (i + 2 < indexCount) {
                                    nextAntlersStart = this.antlersStartIndex[i + 2];
                                }
                            } else {
                                continue;
                            }
                        }

                        if (i + 1 == lastIndex && (nextAntlersStart <= this.lastAntlersEndIndex)) {
                            if (this.isNoParse) {
                                break;
                            }
                            // In this scenario, we will create the last trailing literal node and break.
                            const thisOffset = this.currentChunkOffset,
                                nodeContent = this.content.substr(literalStartIndex);

                            const literalNode = new LiteralNode();
                            literalNode.withParser(this);
                            literalNode.content = this.prepareLiteralContent(nodeContent);

                            if (literalNode.content.length > 0) {
                                literalNode.startPosition = this.positionFromOffset(thisOffset, thisOffset);
                                literalNode.endPosition = this.positionFromOffset(nextAntlersStart, nextAntlersStart - 1);
                                const startOffset = (literalNode.startPosition.index ?? 0),
                                    endOffset = (literalNode.endPosition.index) + 1;
                                literalNode.sourceContent = this.content.substr(startOffset, this.inputLen - startOffset);
                                this.nodes.push(literalNode);
                            }

                            break;
                        } else {
                            let literalLength = nextAntlersStart - this.lastAntlersEndIndex - 1;

                            if (literalLength == 0 || this.isNoParse) {
                                continue;
                            }

                            const thisOffset = this.currentChunkOffset;
                            let literalOffset = thisOffset;

                            if (this.lastAntlersNode instanceof CommentParserFailNode) {
                                literalStartIndex = (this.lastAntlersNode.endPosition?.offset ?? 0) + 1;
                                literalLength -= (this.lastAntlersNode.endPosition?.offset ?? 0) + 1;
                                literalOffset = literalStartIndex;
                            }

                            if (this.lastAntlersNode instanceof PhpExecutionNode) {
                                literalStartIndex -= 1;
                                literalLength += 1;
                            }

                            const nodeContent = this.content.substr(literalStartIndex, literalLength);

                            const literalNode = new LiteralNode();
                            literalNode.withParser(this);
                            literalNode.content = this.prepareLiteralContent(nodeContent);

                            if (literalNode.content.length > 0) {
                                literalNode.startPosition = this.positionFromOffset(literalStartIndex, literalStartIndex);
                                literalNode.endPosition = this.positionFromOffset(nextAntlersStart, nextAntlersStart - 1);
                                const startOffset = (literalNode.startPosition.index ?? 0),
                                    endOffset = (literalNode.endPosition.index) + 1;
                                literalNode.sourceContent = this.content.substr(startOffset, endOffset - startOffset);
                                this.nodes.push(literalNode);
                            }
                        }

                        continue;
                    }

                    if (i !== lastIndex && this.lastAntlersNode != null && this.lastAntlersNode.endPosition != null) {
                        const startCandidate = this.positionFromOffset(offset, offset);

                        // Skip processing potentital nodes that are inside the last node.
                        if (startCandidate.isBefore(this.lastAntlersNode.endPosition)) {
                            if (i + 1 < indexCount) {
                                const nextAntlersStart = this.antlersStartIndex[i + 1];

                                if (nextAntlersStart < this.lastAntlersNode.endPosition.offset) {
                                    continue;
                                }
                            } else {
                                if (i + 1 != lastIndex) {
                                    continue;
                                }
                            }
                        }
                    }

                    if (i == lastIndex) {
                        const literalStart = this.currentIndex + offset;

                        if (literalStart < this.inputLen && !this.isNoParse) {
                            const literalNode = new LiteralNode();
                            literalNode.withParser(this);

                            literalNode.content = this.prepareLiteralContent(this.content.substr(literalStart));

                            if (literalNode.content.length > 0) {
                                literalNode.startPosition = this.positionFromOffset(literalStart, literalStart);
                                literalNode.endPosition = this.positionFromOffset(this.inputLen - 1, this.inputLen - 1);

                                const startOffset = (literalNode.startPosition.index ?? 0),
                                    endOffset = (literalNode.endPosition.index) + 1;
                                literalNode.sourceContent = this.content.substr(startOffset, endOffset - startOffset);

                                this.nodes.push(literalNode);
                            }
                            break;
                        }
                    }
                }
            }
        }

        let index = 0;

        this.nodes.forEach((node) => {
            node.index = index;
            index += 1;
        });

        if (this.nodes.length > 500) {
            this.parseChildDocuments = false;
        }

        this.nodes.forEach((node) => {
            if (node instanceof AntlersNode && node.isComment) {
                return;
            }

            if (node instanceof AntlersNode && node.interpolationRegions.size > 0) {
                node.interpolationRegions.forEach((content, varName) => {
                    const docParser = new DocumentParser();
                    docParser.withChildDocuments(this.parseChildDocuments);
                    docParser.setIsInterpolatedParser(true);

                    let parseResults = docParser.parse(content.parseContent);

                    if (parseResults.length > 1) {
                        if (parseResults[1] instanceof AntlersNode) {
                            parseResults = [parseResults[1]];
                        }
                    }

                    if (docParser.hasUnclosedIfStructures()) {
                        this.doesHaveUncloseIfStructures = true;
                    }

                    if (docParser.hasUnclosedStructures()) {
                        this.doesHaveUnclosedStructures = true;
                    }

                    node.processedInterpolationRegions.set(varName, parseResults);
                    this.mergeErrors(docParser.getAntlersErrors());
                });

                node.hasProcessedInterpolationRegions = true;
            }
        });

        if (this.content.length > 0) {
            this.fragmentsParser.setIndexRanges(this.getNodeIndexRanges())
                .parse(this.content);
        }

        const tagPairAnalyzer = new TagPairAnalyzer();
        this.renderNodes = tagPairAnalyzer.associate(this.nodes, this);

        this.createChildDocuments(this.renderNodes);

        let lastNode: AbstractNode | null = null,
            nextNode: AbstractNode | null = null;

        for (let i = 0; i < this.nodes.length; i++) {
            const thisNode = this.nodes[i];

            if ((i + 1) < this.nodes.length) {
                nextNode = this.nodes[i + 1];
            } else {
                nextNode = null;
            }

            thisNode.next = nextNode;
            thisNode.prev = lastNode;

            lastNode = thisNode;
        }

        this.fragmentsAnalyzer.analyze();
        InlineNodeAnalyzer.analyze(this.nodes);

        this.nodes.forEach((node) => {
            if (node instanceof AntlersNode) {
                if (node.isClosedBy != null) {
                    const nodeChildren = node.getImmediateChildren();

                    for (let i = 0; i < nodeChildren.length; i++) {
                        const child = nodeChildren[i];

                        if (child instanceof AntlersNode && child.isClosedBy != null) {
                            node.containsChildStructures = true;
                            break;
                        } else if (child instanceof ConditionNode) {
                            node.containsChildStructures = true;
                            break;
                        }
                    }
                }
            }
        });

        this.nodes.forEach((node) => {
            if (node instanceof AntlersNode && node.isClosingTag && node.isOpenedBy == null) {
                let errorMessage = 'Unpaired closing tag.';

                if (node.isInterpolationNode) {
                    errorMessage += ' Tag pairs are not supported within Antlers tags.';
                }

                node.pushError(AntlersError.makeSyntaxError(
                    AntlersErrorCodes.TYPE_UNPAIRED_CLOSING_TAG,
                    node,
                    errorMessage
                ));
            }
        });

        RecursiveParentAnalyzer.associateRecursiveParent(this.nodes);

        this.nodes.forEach((node) => {
            if (node instanceof AntlersNode && node.isComment) {
                return;
            }

            if (node instanceof AntlersNode || node instanceof AntlersParserFailNode) {
                node.isInterpolationNode = this.isInterpolatedParser;
            }

            if ((node instanceof AntlersNode || node instanceof AntlersParserFailNode) && node.interpolationRegions.size > 0) {
                node.runtimeNodes.forEach((runtimeNode) => {
                    if (runtimeNode instanceof VariableNode) {
                        if (node.interpolationRegions.has(runtimeNode.name)) {
                            runtimeNode.isInterpolationReference = true;
                            runtimeNode.interpolationNodes = node.processedInterpolationRegions.get(runtimeNode.name) as AbstractNode[];
                        }
                    }
                });
            }

            if ((node instanceof AntlersNode || node instanceof AntlersParserFailNode) && node.hasParameters && node.interpolationRegions.size > 0) {
                node.parameters.forEach((parameter) => {
                    node.interpolationRegions.forEach((interVar, interpolationVariable) => {
                        if (parameter.value.includes(interpolationVariable)) {
                            parameter.interpolations.push(interpolationVariable);
                        }
                    });
                });
            }

            if (node instanceof AntlersNode && node.runtimeNodes.length > 0) {
                if (node.isClosingTag == false && !node.isComment) {
                    node.parsedRuntimeNodes = this.languageParser.parse(node.runtimeNodes);
                    node.hasParsedRuntimeNodes = true;

                    if (!node.isTagNode && node.parsedRuntimeNodes.length > 0) {
                        const principalNode = node.nodeAtIndex(0);

                        if (principalNode != null && principalNode instanceof VariableNode) {
                            if (principalNode.name == node.name?.name) {
                                node.modifierChain = principalNode.modifierChain;
                            }
                        }
                    }
                }
            }
        });

        this.languageParser.getCreatedModifierChains().forEach((chain) => {
            if (chain.modifierChain.length > 0) {
                chain.modifierChain.forEach((modifier) => {
                    if (modifier.nameNode != null && ModifierManager.instance != null && ModifierManager.instance.hasModifier(modifier.nameNode?.name)) {
                        modifier.modifier = ModifierManager.instance?.getModifier(modifier.nameNode.name) as IModifier;
                    }
                });
            }
        });

        let curIndex = 1;

        this.nodes.forEach((node) => {
            if (node instanceof AntlersNode) {
                if (node.isComment) {
                    return;
                }

                node.isTagNode = TagManager.instance?.isKnownTag(node.runtimeName()) ?? false;
                node.scopeName = node.findParameterValue('scope', '');
                node.antlersNodeIndex = curIndex;

                curIndex += 1;
                ModifierAnalyzer.analyzeModifierNodeParameters(node);
                ParameterValidator.validateParameters(node);
            }
        });

        this.nodes.forEach((node) => {
            if (node instanceof AntlersNode) {
                if (node.isClosedBy != null) {
                    const startOffset = (node.endPosition?.offset ?? 0) + 1,
                        endOffset = node.isClosedBy.startPosition?.offset ?? 0,
                        nodeStartOffset = (node.startPosition?.offset ?? 0),
                        nodeEndOffset = (node.isClosedBy.endPosition?.offset ?? 0) + 1;
                    node.documentText = this.content.substr(startOffset, endOffset - startOffset);
                    node.nodeContent = this.content.substr(nodeStartOffset, nodeEndOffset - nodeStartOffset);

                    if (this.parseChildDocuments) {
                        node.childDocument = AntlersDocument.childFromText(node.documentText, getStartPosition(node.children));
                    }
                }
            }
        });

        return this.renderNodes;
    }

    private createChildDocuments(renderNodes: AbstractNode[]) {
        renderNodes.forEach((node) => {
            if (node instanceof AntlersNode && node.isClosedBy != null) {
                const isClosedBy = node.isClosedBy as AntlersNode,
                    docStart = (node.startPosition?.index ?? 0) - 1,
                    docLength = (isClosedBy.endPosition?.index ?? 0) - docStart;

                node.documentText = this.content.substr(docStart, docLength);

                if (this.parseChildDocuments) {
                    const startOffset = (node.endPosition?.index ?? 0),
                        length = ((isClosedBy.startPosition?.index ?? 0) - 1) - startOffset,
                        childText = this.content.substr(startOffset, length);
                    node.childDocument = AntlersDocument.childFromText(childText, getStartPosition(node.getChildren()));
                }
            }
        });
    }

    getNodeIndexRanges() {
        const indexRanges: IndexRange[] = [];

        this.nodes.forEach((node) => {
            if ((node instanceof LiteralNode) == false) {
                indexRanges.push({
                    start: node.startPosition?.index ?? 0,
                    end: node.endPosition?.index ?? 0
                });
            }
        });

        return indexRanges;
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
        position.line = lineToUse + this.shiftLine;
        position.char = charToUse;

        return position;
    }

    getLanguageParser(): LanguageParser {
        return this.languageParser;
    }

    getText(start: number, end: number) {
        return this.content.substr(start, (end - start));
    }

    getOriginalContent() {
        return this.originalContent;
    }

    getContent() {
        return this.content;
    }

    getFragments() {
        return this.fragmentsParser.getFragments();
    }

    getFragmentsParser() {
        return this.fragmentsParser;
    }

    getFragmentsContainingStructures() {
        return this.fragmentsParser.getFragmentsContainingStructures();
    }

    setIsInterpolatedParser(isInterpolation: boolean) {
        this.isInterpolatedParser = isInterpolation;

        return this;
    }

    setStartLineSeed(startLine: number) {
        this.seedStartLine = startLine;

        return this;
    }

    setSeedStartChar(startChar: number) {
        this.seedStartchar = startChar;

        return this;
    }

    protected resetIntermediateState() {
        this.chars = [];
        this.charLen = 0;
        this.currentIndex = 0;
        this.currentContent = [];
        this.sourceContent = [];
        this.cur = null;
        this.next = null;
        this.prev = null;
    }

    setSeedPosition(position: Position | null) {
        if (position == null) {
            this.shiftLine = 0;
        } else {
            this.shiftLine = position.line;
        }

        return this;
    }

    resetState() {
        this.languageParser.reset();
        this.charLen = 0;
        this.antlersStartIndex = [];
        this.antlersErrors = [];
        this.pushedErrors.clear();
        this.antlersStartPositionIndex.clear();
        this.lastAntlersEndIndex = -1;
        this.renderNodes = [];
        this.nodes = [];

        if (GlobalRuntimeState.globalTagEnterStack.length > 0) {
            const lastTagNode = GlobalRuntimeState.globalTagEnterStack[GlobalRuntimeState.length - 1];

            if (lastTagNode != null && lastTagNode.endPosition != null) {
                this.setStartLineSeed(lastTagNode.endPosition.line);
            }
        }

        this.seedOffset = 0;

        this.isScanningInterpolations = false;
        this.content = '';
        this.chars = [];
        this.currentIndex = 0;
        this.startIndex = 0;
        this._recoveryStartIndex = 0;
        this.cur = null;
        this.next = null;
        this.prev = null;
        this.inputLen = 0;
        this.documentOffsets.clear();
        this.isDoubleBrace = false;
        this.interpolationRegions.clear();
        this.interpolationEndOffsets.clear();
    }

    private fetch(count: number) {
        const start = this.currentChunkOffset + this.chunkSize - this.chars.length;

        return StringUtilities.substring(
            this.content,
            start,
            count
        );
    }

    getParsedContent(): string {
        return this.content;
    }

    private peek(count: number) {
        if (count == this.charLen) {
            const nextChunk = StringUtilities.split(
                StringUtilities.substring(
                    this.content,
                    this.currentChunkOffset + this.chunkSize,
                    this.chunkSize
                ));

            this.currentChunkOffset += this.chunkSize;
            nextChunk.forEach((nextChar) => {
                this.chars.push(nextChar);
                this.charLen += 1;
            });
        }

        return this.chars[count];
    }

    parseIntermediateText() {
        this.currentContent = [];
        this.sourceContent = [];
        this.startIndex = 0;

        this.chars = this.content.substr(this.currentChunkOffset, this.chunkSize).split('');
        this.charLen = this.chars.length;

        for (this.currentIndex = 0; this.currentIndex < this.inputLen; this.currentIndex += 1) {
            this.checkCurrentOffsets();

            if (this.cur == DocumentParser.LeftBrace && this.next == DocumentParser.LeftBrace && this.prev == DocumentParser.AtChar) {
                this.dumpLiteralNode(this.currentIndex);

                const escapeNode = new EscapedContentNode();
                escapeNode.withParser(this);
                escapeNode.name = new TagIdentifier();
                escapeNode.name.name = 'noparse';

                escapeNode.content = '{{';
                escapeNode.startPosition = this.positionFromOffset(
                    this.currentIndex + this.seedOffset,
                    this.currentIndex + this.seedOffset
                );

                escapeNode.endPosition = this.positionFromOffset(
                    this.currentIndex + this.seedOffset,
                    this.currentIndex + this.seedOffset
                );

                this.nodes.push(escapeNode);
                this.currentContent = [];
                this.sourceContent = [];
                this.currentIndex += 1;
                continue;
            }

            if ((this.prev == null || (this.prev != null && this.prev != DocumentParser.AtChar))
                && this.next != null && this.cur == DocumentParser.LeftBrace
                && this.next == DocumentParser.LeftBrace) {
                this.dumpLiteralNode(this.currentIndex);

                let peek: string | null = null;

                if (this.currentIndex + 2 < this.inputLen) {
                    peek = this.peek(this.currentIndex + 2);
                }

                if (peek == DocumentParser.Punctuation_Question && !this.isNoParse) {
                    this.isDoubleBrace = true;
                    this.currentIndex += 3;
                    this._recoveryStartIndex = this.currentIndex;
                    this.scanToEndOfPhpRegion(DocumentParser.Punctuation_Question);
                    this.isDoubleBrace = false;
                    break;
                }

                if (peek == DocumentParser.Punctuation_Dollar && !this.isNoParse) {
                    this.isDoubleBrace = true;
                    this.currentIndex += 3;
                    this._recoveryStartIndex = this.currentIndex;
                    this.scanToEndOfPhpRegion(DocumentParser.Punctuation_Dollar);
                    this.isDoubleBrace = false;
                    break;
                }

                if (peek == DocumentParser.Punctuation_Octothorp && !this.isNoParse) {
                    this.isDoubleBrace = true;
                    this.currentIndex += 3;
                    this._recoveryStartIndex = this.currentIndex;
                    this.scanToEndOfAntlersCommentRegion();

                    this.isDoubleBrace = false;

                    break;
                }

                if (!this.isNoParse) {
                    // Advances over the {{.
                    this.startIndex = this.currentIndex;
                    this._recoveryStartIndex = this.currentIndex;
                    this.isDoubleBrace = true;
                    this.currentIndex += 2;
                    this._recoveryStartIndex = this.currentIndex;
                    this.scanToEndOfAntlersRegion();
                    this.isDoubleBrace = false;
                } else {
                    const contentPeek = this.fetch(11).replace(' ', '').toLocaleLowerCase();

                    if (contentPeek.startsWith('{{/noparse')) {
                        // Advances over the {{.
                        this.startIndex = this.currentIndex;
                        this._recoveryStartIndex = this.currentIndex;
                        this.isDoubleBrace = true;
                        this.currentIndex += 2;
                        this._recoveryStartIndex = this.currentIndex;
                        this.scanToEndOfAntlersRegion();
                        this.isDoubleBrace = false;
                        this.isNoParse = false;
                        break;
                    } else {
                        this.currentContent.push(this.cur);
                        continue;
                    }
                }

                break;
            }

            if (this.cur == DocumentParser.AtChar && this.next != null && this.next == DocumentParser.LeftBrace) {
                if (this.currentIndex + 2 >= this.inputLen) {
                    this.appendContent(this.next);
                    this.dumpLiteralNode(this.currentIndex + 1);
                    break;
                }

                let leftBraceCount = 0;

                for (let countIndex = this.currentIndex + 1; countIndex < this.inputLen; countIndex += 1) {
                    const subChar = this.chars[countIndex];

                    if (subChar == DocumentParser.LeftBrace) {
                        leftBraceCount += 1;
                    } else {
                        break;
                    }
                }

                this.currentContent = this.currentContent.concat(
                    DocumentParser.LeftBrace.repeat(leftBraceCount).split('')
                );
                this.sourceContent = this.currentContent.concat(
                    DocumentParser.LeftBrace.repeat(leftBraceCount).split('')
                );

                this.currentIndex += leftBraceCount;
            }

            this.appendContent(this.cur);

            if (this.next == null && this.currentContent.length > 0) {
                this.dumpLiteralNode(this.currentIndex);
            }
        }
    }

    getRenderNodes() {
        return this.renderNodes;
    }

    private processInputText(input: string) {
        this.originalContent = input;
        this.content = StringUtilities.normalizeLineEndings(input);
        this.inputLen = this.content.length;

        if (this.content.startsWith('---')) {
            const lines = this.content.split("\n"),
                frontMatter: string[] = [];
            let newLines: string[] = [];

            newLines.push('');

            for (let i = 1; i < lines.length; i++) {
                const lineText = lines[i];

                if (lineText.startsWith('---')) {
                    newLines.push('');
                    newLines = newLines.concat(lines.slice(i + 1));
                    this.content = newLines.join("\n");
                    this.frontMatter = frontMatter.join("\n");
                    this.frontMatterEndLine = i + 1;
                    break;
                } else {
                    frontMatter.push(lineText);
                    newLines.push('');
                }
            }
        }

        const documentNewLines = [...this.content.matchAll(/(\n)/gm)];
        const newLineCountLen = documentNewLines.length;

        let currentLine = this.seedStartLine,
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
            this.maxLine = currentLine;

            currentLine += 1;
            lastOffset = thisIndex;

            lastEndIndex = thisEndIndex;
            lastStartIndex = thisStartIndex;
        }

        this.maxLine += 1;

        const antlersStartCandidates = [...this.content.matchAll(/@?{{/gm)];

        let lastAntlersOffset = 0,
            lastWasEscaped = false;

        antlersStartCandidates.forEach((antlersRegion) => {
            const matchText = antlersRegion[0];

            if (matchText.startsWith(DocumentParser.AtChar)) {
                lastAntlersOffset = this.content.indexOf(matchText, lastAntlersOffset) + 2;
                lastWasEscaped = true;
                return;
            }

            const offset = this.content.indexOf(matchText, lastAntlersOffset);

            if (lastWasEscaped) {
                if (lastAntlersOffset == offset) {
                    lastAntlersOffset = offset;
                    return;
                }
            }

            this.antlersStartIndex.push(offset);
            this.antlersStartPositionIndex.set(offset, 1);
            lastAntlersOffset = offset + 2;
            lastWasEscaped = false;
        });

        return true;
    }

    private prepareLiteralContent(content: string) {
        return content.replace('@{{', '{{');
    }

    private scanToEndOfPhpRegion(checkChar: string) {
        if (this.currentIndex == this.inputLen) {
            this.doesHaveUnclosedStructures = true;
        }

        for (this.currentIndex; this.currentIndex < this.inputLen; this.currentIndex += 1) {
            this.checkCurrentOffsets();

            if (this.cur == checkChar && this.next != null && this.next == DocumentParser.RightBrace) {
                const peek = this.peek(this.currentIndex + 2);

                if (peek == DocumentParser.RightBrace) {
                    const node = this.makeAntlersPhpNode(this.currentIndex, checkChar == DocumentParser.Punctuation_Dollar);

                    this.currentContent = [];
                    this.sourceContent = [];

                    this.currentIndex += 3;
                    this.startIndex = this.currentIndex;
                    this._recoveryStartIndex = this.startIndex;
                    this.nodes.push(node);

                    this.lastAntlersNode = node;
                    break;
                }
            }

            this.appendContent(this.cur);

            if (this.next == null) {
                const failNode = this.makeAntlersPhpFailedNode(this.currentIndex);

                this.nodes.push(failNode);
                this.lastAntlersNode = failNode;

                this.doesHaveUnclosedStructures = true;
                this.antlersErrors.push(AntlersError.makeSyntaxError(
                    AntlersErrorCodes.TYPE_INCOMPLETE_PHP_EVALUATION_REGION,
                    failNode,
                    'Unexpected end of input while parsing Antlers PHP region.'
                ));
                break;
            }
        }
    }

    private appendContent(char: string | null) {
        if (char == null) {
            return;
        }

        this.currentContent.push(char);
        this.sourceContent.push(char);
    }

    private scanToEndOfAntlersCommentRegion() {
        if (this.currentIndex == this.inputLen) {
            this.doesHaveUnclosedStructures = true;
        }

        for (this.currentIndex; this.currentIndex < this.inputLen; this.currentIndex += 1) {
            this.checkCurrentOffsets();

            if (this.cur == DocumentParser.Punctuation_Octothorp && this.next != null && this.next == DocumentParser.RightBrace) {
                const peek = this.peek(this.currentIndex + 2);

                if (peek == DocumentParser.RightBrace) {
                    const node = this.makeAntlersTagNode(this.currentIndex, true);
                    this.currentContent = [];
                    this.sourceContent = [];

                    // Advance over the #}}.
                    this.currentIndex += 3;

                    this.nodes.push(node);
                    this.lastAntlersNode = node;

                    break;
                }
            }

            this.appendContent(this.cur);

            if (this.next == null) {
                const failNode = this.makeAntlersCommentFailedNode(this.currentIndex);

                this.nodes.push(failNode);
                this.lastAntlersNode = failNode;

                this.doesHaveUnclosedStructures = true;
                this.antlersErrors.push(AntlersError.makeSyntaxError(
                    AntlersErrorCodes.TYPE_INCOMPLETE_ANTELRS_COMMENT_REGION,
                    failNode,
                    'Unexpected end of input while parsing Antlers comment region.'
                ));
                break;
            }
        }
    }

    private scanToEndOfInterpolatedRegion(): InterpolationScanResult {
        if (this.currentIndex == this.inputLen) {
            this.doesHaveUnclosedStructures = true;
        }

        const subContent: string[] = [];
        this.isScanningInterpolations = true;
        // We will enter this method when the parser hits the first {.
        let braceCount = 0;

        for (this.currentIndex; this.currentIndex < this.inputLen; this.currentIndex += 1) {
            this.checkCurrentOffsets();

            if (this.cur == DocumentParser.LeftBrace) {
                if (this.prev == DocumentParser.AtChar) {
                    subContent.push(this.cur);
                    continue;
                }

                braceCount += 1;
                subContent.push(this.cur);
            } else if (this.cur == DocumentParser.RightBrace) {
                if (this.prev == DocumentParser.AtChar) {
                    subContent.push(this.cur);
                    continue;
                }

                braceCount -= 1;
                subContent.push(this.cur);

                if (braceCount == 0) {
                    this.interpolationEndOffsets.set(this.currentIndex, 1);
                    break;
                }
            } else {
                if (this.cur != null) {
                    subContent.push(this.cur);
                }
            }
        }

        const content = subContent.join(''),
            varSlug = 'int_' + Md5.hashStr(content);

        let varContent = varSlug.substr(0, content.length);

        const newLen = varContent.length,
            origLen = content.length;

        if (newLen < origLen) {
            const padLen = origLen - newLen;

            varContent += 'x'.repeat(padLen);
        }

        this.isScanningInterpolations = false;

        return {
            content: content,
            varContent: varContent
        };
    }

    bordersInterpolationRegion(position: Position) {
        if (this.interpolationEndOffsets.size == 0) {
            return false;
        }

        const offsetCheck = position.offset - 1;

        if (offsetCheck <= 0) {
            return false;
        }

        return this.interpolationEndOffsets.has(offsetCheck);
    }

    private getParseableContent(toIndex: number): string {
        let newString = '';

        for (let i = 0; i <= toIndex; i++) {
            if (this.content[i] == DocumentParser.LeftBrace || this.content[i] == DocumentParser.RightBrace) {
                newString += '~';
            } else {
                newString += this.content[i];
            }
        }

        return newString;
    }

    private scanToEndOfAntlersRegion() {
        if (this.currentIndex == this.inputLen) {
            this.doesHaveUnclosedStructures = true;
        }

        for (this.currentIndex; this.currentIndex < this.inputLen; this.currentIndex += 1) {
            this.checkCurrentOffsets();

            if (this.cur == DocumentParser.LeftBrace && this.prev == DocumentParser.AtChar) {
                this.currentContent.pop();
                this.appendContent(this.cur);
                continue;
            }

            if (this.isInterpolatedParser && this.cur == DocumentParser.RightBrace && this.prev == DocumentParser.AtChar) {
                this.currentContent.pop();
                this.appendContent(this.cur);
                continue;
            }

            if (this.cur == DocumentParser.LeftBrace) {
                const results = this.scanToEndOfInterpolatedRegion();
                const regionEnd = this.currentIndex + this.seedOffset,
                    regionStart = regionEnd - results.content.length,
                    leadingContent = this.getParseableContent(regionStart - 1);
                GlobalRuntimeState.interpolatedVariables.push(results.varContent);

                this.currentContent = this.currentContent.concat(results.varContent.split(''));
                this.sourceContent = this.sourceContent.concat(results.content.split(''));

                const parseContent = leadingContent + '{' + results.content + '}';

                this.interpolationRegions.set(results.varContent, {
                    content: results.content,
                    parseContent: parseContent,
                    varContent: results.varContent,
                    startOffset: regionStart,
                    endOffset: regionEnd
                });
                continue;
            }

            if (this.cur == DocumentParser.RightBrace && this.next != null
                && this.next == DocumentParser.RightBrace) {
                const node = this.makeAntlersTagNode(this.currentIndex, false);

                if (node.name != null && node.name.name == 'noparse') {
                    this.isNoParse = true;
                }

                this.currentIndex += 2;
                this.nodes.push(node);

                this.lastAntlersNode = node;
                break;
            }

            this.appendContent(this.cur);

            if (this.next == null) {
                const failNode = this.makeAntlersFailedNode(this.currentIndex, false);

                this.nodes.push(failNode);
                this.lastAntlersNode = failNode;

                this.doesHaveUnclosedStructures = true;
                let message = 'Unexpected end of input while parsing Antlers region.';

                if (this.isScanningInterpolations) {
                    message = 'Unexpected end of input wihle parsing interpolated Antlers region.';
                }

                this.antlersErrors.push(AntlersError.makeSyntaxError(
                    AntlersErrorCodes.TYPE_INCOMPLETE_ANTLERS_REGION,
                    failNode,
                    message
                ));
                break;
            }
        }
    }

    private makeAntlersPhpNode(index: number, isEcho: boolean) {
        const node = new PhpExecutionNode();

        if (isEcho) {
            node.rawStart = '{{$';
            node.rawEnd = '$}}';
        } else {
            node.rawStart = '{{?';
            node.rawEnd = '?}}';
        }

        node.content = this.currentContent.join('');
        node.sourceContent = this.sourceContent.join('');
        node.startPosition = this.positionFromOffset(
            this.startIndex + this.seedOffset,
            this.startIndex + this.seedOffset
        );

        if (index + 3 > this.inputLen) {
            node.endPosition = this.positionFromOffset(this.inputLen, this.inputLen - 1);

            this.doesHaveUnclosedStructures = true;
            this.antlersErrors.push(AntlersError.makeSyntaxError(
                AntlersErrorCodes.TYPE_UNEXPECTED_EOI_WHILE_MANIFESTING_ANTLERS_NODE,
                node,
                'Unexpected end of input while locating end of Antlers region.'
            ));

            return node;
        }

        this.lastAntlersEndIndex = index + 3 + this.seedOffset;

        node.endPosition = this.positionFromOffset(
            index + this.seedOffset,
            index + 3 + this.seedOffset
        );

        return node;
    }

    private makeAntlersPhpFailedNode(index: number) {
        const node = new PhpParserFailNode();

        node.rawStart = '{{$';
        node.rawEnd = '$}}';

        node._isEndVirtual = true;

        node.content = this.currentContent.join('');
        node.sourceContent = this.sourceContent.join('');
        node.startPosition = this.positionFromOffset(
            this.startIndex + this.seedOffset,
            this.startIndex + this.seedOffset
        );

        const lineContent = this.getLineText(node.startPosition.line),
            lineIndexEntry = this.getLineIndex(node.startPosition.line);

        if (lineContent != null) {
            const failedContent = lineContent.substr(this._recoveryStartIndex);
            node.content = failedContent;
            node.sourceContent = failedContent;
        }

        let failedNodeEndIndex = index + this.seedOffset;

        if (lineIndexEntry != null) {
            this.currentIndex = lineIndexEntry.end;
            failedNodeEndIndex = lineIndexEntry.end;
        }

        node.endPosition = this.positionFromOffset(
            failedNodeEndIndex,
            failedNodeEndIndex
        );

        return node;
    }

    private makeAntlersCommentFailedNode(index: number) {
        const node = new CommentParserFailNode();

        if (this.isDoubleBrace) {
            node.rawStart = '{{';
            node.rawEnd = '}}';
        } else {
            node.rawStart = '{';
            node.rawEnd = '}';
        }

        node._isEndVirtual = true;

        let isSelfClosing = false;
        const contentLen = this.currentContent.length;

        if (contentLen > 0 && this.currentContent[contentLen - 1] == DocumentParser.Punctuation_ForwardSlash) {
            this.currentContent.pop();
            isSelfClosing = true;
        }

        node.isComment = true;
        node.isSelfClosing = isSelfClosing;
        node.withParser(this);
        node.content = this.currentContent.join('');
        node.sourceContent = this.sourceContent.join('');

        node.startPosition = this.positionFromOffset(
            this.startIndex + this.seedOffset,
            this.startIndex + this.seedOffset
        );

        const lineContent = this.getLineText(node.startPosition.line),
            lineIndexEntry = this.getLineIndex(node.startPosition.line);

        if (lineContent != null) {
            const failedContent = lineContent.substr(this._recoveryStartIndex);
            node.content = failedContent;
            node.sourceContent = failedContent;
        }

        let failedNodeEndIndex = index + this.seedOffset;

        if (lineIndexEntry != null) {
            this.currentIndex = lineIndexEntry.end;
            failedNodeEndIndex = lineIndexEntry.end;
        }

        node.endPosition = this.positionFromOffset(
            failedNodeEndIndex,
            failedNodeEndIndex
        );

        node.interpolationRegions = new Map();

        this.interpolationRegions.forEach((region, key) => {
            if (node.content.includes(key)) {
                node.interpolationRegions.set(key, region);
            }
        });

        return node;
    }

    private makeAntlersFailedNode(index: number, isComment: boolean) {
        const node = new AntlersParserFailNode();

        if (this.isDoubleBrace) {
            node.rawStart = '{{';
            node.rawEnd = '}}';
        } else {
            node.rawStart = '{';
            node.rawEnd = '}';
        }

        node._isEndVirtual = true;

        let isSelfClosing = false;
        const contentLen = this.currentContent.length;

        if (contentLen > 0 && this.currentContent[contentLen - 1] == DocumentParser.Punctuation_ForwardSlash) {
            this.currentContent.pop();
            isSelfClosing = true;
        }

        node.isComment = isComment;
        node.isSelfClosing = isSelfClosing;
        node.withParser(this);
        node.content = this.currentContent.join('');
        node.sourceContent = this.sourceContent.join('');

        node.startPosition = this.positionFromOffset(
            this.startIndex + this.seedOffset,
            this.startIndex + this.seedOffset
        );

        const lineContent = this.getLineText(node.startPosition.line),
            lineIndexEntry = this.getLineIndex(node.startPosition.line);

        if (lineContent != null) {
            const failedContent = StringUtilities.trimLeft(this.content.substring(node.startPosition.offset + node.rawStart.length - 1, lineIndexEntry?.end), '{');
            node.content = failedContent;
            node.sourceContent = failedContent;
        }

        let failedNodeEndIndex = index + this.seedOffset;

        if (lineIndexEntry != null) {
            this.currentIndex = lineIndexEntry.end;
            failedNodeEndIndex = lineIndexEntry.end;
        }

        node.endPosition = this.positionFromOffset(
            failedNodeEndIndex,
            failedNodeEndIndex
        );

        node.interpolationRegions = new Map();

        this.interpolationRegions.forEach((region, key) => {
            if (node.content.includes(key)) {
                node.interpolationRegions.set(key, region);
            }
        });

        const returnNode = this.nodeParser.parseNode(node);
        this.mergeErrors(returnNode.getErrors());
        return returnNode;
    }

    private makeAntlersTagNode(index: number, isComment: boolean) {
        const node = new AntlersNode();

        if (this.isDoubleBrace) {
            node.rawStart = '{{';
            node.rawEnd = '}}';
        } else {
            node.rawStart = '{';
            node.rawEnd = '}';
        }

        let isSelfClosing = false;
        const contentLen = this.currentContent.length;

        if (contentLen > 0 && this.currentContent[contentLen - 1] == DocumentParser.Punctuation_ForwardSlash) {
            this.currentContent.pop();
            isSelfClosing = true;
        }

        node.isInterpolationNode = this.isInterpolatedParser;
        node.isComment = isComment;
        node.isSelfClosing = isSelfClosing;
        node.withParser(this);
        node.content = this.currentContent.join('');
        node.sourceContent = this.sourceContent.join('');
        node.startPosition = this.positionFromOffset(
            this.startIndex + this.seedOffset,
            this.startIndex + this.seedOffset
        );

        if (index + 2 > this.inputLen) {
            node.endPosition = this.positionFromOffset(
                this.inputLen,
                this.inputLen - 1
            );

            this.doesHaveUnclosedStructures = true;
            this.antlersErrors.push(AntlersError.makeSyntaxError(
                AntlersErrorCodes.TYPE_UNEXPECTED_EOI_WHILE_MANIFESTING_ANTLERS_NODE,
                node,
                'Unexpected end of input while locating end of Antlers region.'
            ));

            return node;
        }

        if (isComment) {
            this.lastAntlersEndIndex = index + 2 + this.seedOffset;
        } else {
            this.lastAntlersEndIndex = index + 1 + this.seedOffset;
        }

        node.endPosition = this.positionFromOffset(
            this.lastAntlersEndIndex,
            this.lastAntlersEndIndex
        );

        node.interpolationRegions = new Map();

        this.interpolationRegions.forEach((region, key) => {
            if (node.content.includes(key)) {
                node.interpolationRegions.set(key, region);
            }
        });

        if (node.isComment) {
            return node;
        }

        const returnNode = this.nodeParser.parseNode(node);
        this.mergeErrors(returnNode.getErrors());

        return returnNode;
    }

    mergeErrors(errors: AntlersError[]) {
        errors.forEach((error) => {
            this.antlersErrors.push(error);
        });
    }

    public getNodes() {
        return this.nodes;
    }

    getNodesBetween(start: Position, end: Position): AbstractNode[] {
        const returnNodes: AbstractNode[] = [];

        this.nodes.forEach((node) => {
            if ((node.startPosition?.offset ?? 0) > start.offset && (node.endPosition?.offset ?? 0) < end.offset) {
                returnNodes.push(node);
            }
        });

        return returnNodes;
    }

    public antlersNodes(): AntlersNode[] {
        return this.nodes.filter(function (node) {
            return node instanceof AntlersNode;
        }) as AntlersNode[];
    }

    private dumpLiteralNode(index: number) {
        if (this.isNoParse) {
            return;
        }

        if (this.currentContent.length > 0) {
            this.nodes.push(this.makeLiteralNode(this.currentContent, this.startIndex, index));
        }

        this.currentContent = [];
        this.sourceContent = [];
    }

    private makeLiteralNode(buffer: string[], startOffset: number, currentOffset: number) {
        const node = new LiteralNode();

        node.content = buffer.join('');
        node.sourceContent = this.sourceContent.join('');
        node.startPosition = this.positionFromOffset(startOffset, startOffset);
        node.endPosition = this.positionFromOffset(currentOffset, currentOffset);
        node.sourceContent = this.content.substr(startOffset, currentOffset);
        node.withParser(this);

        return node;
    }

    addAntlersError(error: AntlersError) {
        this.antlersErrors.push(error);
    }

    getAntlersErrors() {
        return this.antlersErrors;
    }
    
    getStructureErrors() {
        return this.structureErrors;
    }
}

interface InterpolationScanResult {
    content: string,
    varContent: string
}