import { AntlersError } from '../errors/antlersError';
import { AntlersErrorCodes } from '../errors/antlersErrorCodes';
import { VariableReference, PathNode, AccessorNode } from '../nodes/abstractNode';
import { StringUtilities } from '../utilities/stringUtilities';
import { DocumentParser } from './documentParser';

export class PathParser {
    static readonly ColonSeparator = ':';
    static readonly LeftBracket = '[';
    static readonly RightBracket = ']';
    static readonly DotPathSeparator = '.';

    private chars: string[] = [];
    private currentIndex = 0;
    private lastIndex = 0;
    private inputLength = 0;
    private prev: string | null = null;
    private cur: string | null = null;
    private next: string | null = null;
    private isParsingString = false;
    private isStringKeyPath = false;
    private antlersErrors: AntlersError[] = [];

    private isValidChar(char: string | null) {
        if (this.isParsingString == false && StringUtilities.ctypeSpace(char)) {
            return false;
        }

        if (this.isParsingString == false && char == PathParser.LeftBracket) {
            return false;
        }

        if (this.isParsingString == false && char == PathParser.RightBracket) {
            return false;
        }

        return true;
    }

    private normalizePath(path: string) {
        path = path.replace(':', '_');
        path = path.replace('.', '_');
        path = path.replace('[', '_');
        path = path.replace(']', '_');

        return path.replace(']', '_');
    }

    getAntlersErrors() {
        return this.antlersErrors;
    }

    mergeErrors(errors: AntlersError[]) {
        errors.forEach((error) => {
            this.antlersErrors.push(error);
        });
    }

    parse(content: string) {
        this.antlersErrors = [];
		this._recusriveEntryCheck.clear();

        const originalContent = content;
        let isStrictVariableReference = false,
            isExplicitVariableReference = false,
            isVariableVariable = false,
            isStrictTagReference = false;

        if (content.startsWith(DocumentParser.AtChar)) {
            isVariableVariable = true;
            content = content.substr(1);
        }

        if (content.startsWith(DocumentParser.Punctuation_Caret)) {
            isStrictTagReference = true;
            content = content.substr(1);
        } else {
            if (content.startsWith(DocumentParser.Punctuation_Dollar)) {
                isStrictVariableReference = true;
                content = content.substr(1);
            }

            // If it still starts with a $, it's an explicit var reference.
            if (content.startsWith(DocumentParser.Punctuation_Dollar)) {
                isExplicitVariableReference = true;
                content = content.substr(1);
            }
        }

        this.chars = [];
        this.currentIndex = 0;
        this.lastIndex = 0;
        this.inputLength = 0;
        this.cur = null;
        this.prev = null;
        this.next = null;

        this.chars = content.split('');
        this.inputLength = this.chars.length;
        this.lastIndex = this.inputLength - 1;

        let currentChars: string[] = [],
            isParsingAccessor = false;

        const parts: any[] = [];

        let activeDelimiter = PathParser.ColonSeparator,
            ignorePrevious = false,
            terminator: string | null = null,
            isStringVar = false,
            addCur = true;

        this.isParsingString = false;

        if (this.inputLength == 0) {
            const emptyRef = new VariableReference();
            emptyRef._isFromEmptyFailState = true;
            return emptyRef;
        }

        for (this.currentIndex; this.currentIndex < this.inputLength; this.currentIndex += 1) {
            this.cur = this.chars[this.currentIndex];

            this.next = null;

            if (!ignorePrevious) {
                if (this.currentIndex > 0) {
                    this.prev = this.chars[this.currentIndex - 1];
                }
            } else {
                ignorePrevious = false;
                this.prev = '';
            }

            if (this.currentIndex + 1 < this.inputLength) {
                this.next = this.chars[this.currentIndex + 1];
            }

            if (this.isParsingString == false && this.cur == PathParser.ColonSeparator) {
                activeDelimiter = PathParser.ColonSeparator;
            }

            if (this.isParsingString == false && this.cur == PathParser.DotPathSeparator) {
                activeDelimiter = PathParser.DotPathSeparator;
            }

            if (this.isParsingString && this.cur == DocumentParser.String_EscapeCharacter && this.next == terminator) {
                if (terminator != null) {
                    currentChars.push(terminator);
                }

                this.currentIndex += 1;
                continue;
            }

            if (this.cur == DocumentParser.String_Terminator_SingleQuote ||
                this.cur == DocumentParser.String_Terminator_DoubleQuote) {
                if (this.isParsingString) {
                    if (this.cur == terminator) {
                        if (this.prev == DocumentParser.String_EscapeCharacter) {
                            currentChars.push(this.cur);
                            continue;
                        } else {
                            this.isParsingString = false;
                            addCur = false;
                        }
                    } else {
                        currentChars.push(this.cur);
                        continue;
                    }
                } else {
                    if (this.prev != DocumentParser.LeftBracket) {
                        if (StringUtilities.ctypeAlpha(this.prev) || StringUtilities.ctypeDigit(this.prev)) {
                            this.antlersErrors.push(AntlersError.makeSyntaxError(
                                AntlersErrorCodes.PATH_STRING_NOT_INSIDE_ARRAY_ACCESSOR,
                                null,
                                'Unexpected string start while parsing variable path. String literals must be within array accessors.'
                            ));
                        }
                    }

                    this.isParsingString = true;
                    isStringVar = true;
                    terminator = this.cur;
                    this.isStringKeyPath = true;

                    continue;
                }
            }

            if (this.isParsingString) {
                if (StringUtilities.ctypeSpace(this.cur)) {
                    currentChars.push(this.cur);
                    continue;
                } else if (this.cur == DocumentParser.String_EscapeCharacter) {
                    if (this.next == DocumentParser.String_EscapeCharacter) {
                        currentChars.push(DocumentParser.String_EscapeCharacter);
                        this.currentIndex += 1;
                        ignorePrevious = true;
                        continue;
                    } else if (this.next == 'n') {
                        currentChars.push("\n");
                        this.currentIndex += 1;
                        continue;
                    } else if (this.next == 't') {
                        currentChars.push("\t");
                        this.currentIndex += 1;
                        continue;
                    } else if (this.next == 'r') {
                        currentChars.push("\r");
                        this.currentIndex += 1;
                        continue;
                    }
                }
            }

            if (this.isParsingString == false && this.cur == PathParser.LeftBracket) {
                if (currentChars.length > 0) {
                    const pathNode = new PathNode();
                    pathNode.name = currentChars.join('');
                    pathNode.delimiter = activeDelimiter;
                    parts.push(pathNode);
                    currentChars = [];
                }

                if (this.next == null || StringUtilities.ctypeSpace(this.next)) {
                    this.antlersErrors.push(AntlersError.makeSyntaxError(
                        AntlersErrorCodes.TYPE_ILLEGAL_VARPATH_SPACE_RIGHT,
                        null,
                        'Unexpected end of input or whitespace while parsing variable accessor path.'
                    ));
                    continue;
                }

                const results = this.locateEndOfAccessor();
                this.currentIndex = results.foundOn;

                const parser = new PathParser();
                parts.push(parser.parse(results.nestedContent));
                this.mergeErrors(parser.getAntlersErrors());

                isParsingAccessor = true;

                if (this.currentIndex == -1) {
                    this.antlersErrors.push(AntlersError.makeSyntaxError(
                        AntlersErrorCodes.PARSER_CANNOT_PARSE_PATH_RECURSIVE,
                        null,
                        'Cannot parse variable path.'
                    ));
                    isParsingAccessor = false;
                    break;
                }

                continue;
            }

            if (this.isParsingString == false && this.next == PathParser.RightBracket && isParsingAccessor) {
                if (addCur) {
                    currentChars.push(this.cur);
                } else {
                    addCur = true;
                }

                const accessorNode = new AccessorNode();
                accessorNode.name = currentChars.join('');

                parts.push(accessorNode);
                currentChars = [];
                activeDelimiter = PathParser.ColonSeparator;
                this.currentIndex += 1;
                isParsingAccessor = false;
                continue;
            }

            if (this.isParsingString == false && (
                this.cur == PathParser.LeftBracket || this.cur == PathParser.ColonSeparator ||
                this.cur == PathParser.DotPathSeparator || this.currentIndex == this.lastIndex
            )) {
                if (this.next == null || StringUtilities.ctypeSpace(this.next)) {
                    if (this.cur == PathParser.ColonSeparator) {
                        if (currentChars.length == 0) {
                            this.antlersErrors.push(AntlersError.makeSyntaxError(
                                AntlersErrorCodes.TYPE_UNEXPECTED_BRANCH_SEPARATOR,
                                null,
                                'Unexpected [T_BRANCH_SEPARATOR] while parsing input text.'
                            ));

                            continue;
                        }

                        this.antlersErrors.push(AntlersError.makeSyntaxError(
                            AntlersErrorCodes.TYPE_ILLEGAL_VARPATH_RIGHT,
                            null,
                            'Variable paths cannot end with the ":" character.'
                        ));

                        continue;
                    }

                    if (this.cur == PathParser.LeftBracket) {
                        this.antlersErrors.push(AntlersError.makeSyntaxError(
                            AntlersErrorCodes.TYPE_ILLEGAL_VARPATH_SUBPATH_START,
                            null,
                            'Illegal variable sub-path start.'
                        ));
                        continue;
                    }
                }

                if (this.currentIndex == this.lastIndex && this.isValidChar(this.cur)) {
                    if (addCur) {
                        currentChars.push(this.cur);
                    } else {
                        addCur = true;
                    }
                }

                const pathNode = new PathNode();
                pathNode.delimiter = activeDelimiter;
                pathNode.name = currentChars.join('');

                if (isStringVar) {
                    pathNode.isStringVar = isStringVar;
                    pathNode.name = originalContent.substr(1);
                    pathNode.name = pathNode.name.slice(0, -1);
                    isStringVar = false;
                }

                parts.push(pathNode);
                currentChars = [];
                continue;
            } else {
                currentChars.push(this.cur);
                continue;
            }
        }

        const partLen = parts.length;

        if (partLen > 0) {
            const lastPart = parts[partLen - 1];

            if (lastPart instanceof PathNode) {
                lastPart.isFinal = true;
            } else if (lastPart instanceof VariableReference) {
                lastPart.isFinal = true;
            }
        }

        const variableReference = new VariableReference();
        variableReference.isStrictTagReference = isStrictTagReference;
        variableReference.isStrictVariableReference = isStrictVariableReference;
        variableReference.isExplicitVariableReference = isExplicitVariableReference;
        variableReference.pathParts = parts;
        variableReference.originalContent = content;
        variableReference.isVariableVariable = isVariableVariable;
        variableReference.normalizedReference = content.replace(':', '.');

        return variableReference;
    }

    private _recusriveEntryCheck: Map<number, boolean> = new Map();

    private locateEndOfAccessor() {
        const nestedChars: string[] = [];
        let bracketCount = 1,
            foundOn = -1,
            nestedContent = '',
            isParsingString = false,
            terminator: string | null = null;

        if (this._recusriveEntryCheck.has(this.currentIndex + 1) == false) {
            this._recusriveEntryCheck.set(this.currentIndex + 1, true);
        } else {
            return {
                foundOn: foundOn,
                nestedContent: ''
            };
        }

        for (let i = this.currentIndex + 1; i < this.inputLength; i++) {
            const cur = this.chars[i];
            let next = null,
                prev = null;

            if (i > 0) {
                prev = this.chars[i - 1];
            }

            if (i + 1 < this.inputLength) {
                next = this.chars[i + 1];
            }

            if (isParsingString == false && (
                cur == DocumentParser.String_Terminator_SingleQuote ||
                cur == DocumentParser.String_Terminator_DoubleQuote
            )) {
                isParsingString = true;
                terminator = cur;
                nestedChars.push(cur);
                continue;
            }

            if (isParsingString == false && cur == PathParser.LeftBracket) {
                bracketCount += 1;
                nestedChars.push(cur);

                continue;
            }

            if (isParsingString && cur == terminator && prev != DocumentParser.String_EscapeCharacter) {
                nestedChars.push(cur);
                isParsingString = false;
                terminator = null;
                continue;
            }

            if (isParsingString == false && cur == PathParser.RightBracket) {
                bracketCount -= 1;

                if (bracketCount == 0) {
                    foundOn = i;
                    nestedContent = nestedChars.join('');
                    break;
                } else {
                    nestedChars.push(cur);
                    continue;
                }
            } else {
                nestedChars.push(cur);
            }

            if (isParsingString == false && StringUtilities.ctypeSpace(next)) {
                this.antlersErrors.push(AntlersError.makeSyntaxError(
                    AntlersErrorCodes.TYPE_UNEXPECTED_EOI_VARPATH_ACCESSOR,
                    null,
                    'Unexpected end of input or whitespace while parsing inner variable accessor path.'
                ));
            }

            if (next == null) {
                this.antlersErrors.push(AntlersError.makeSyntaxError(
                    AntlersErrorCodes.TYPE_UNEXPECTED_EOI_VARPATH_ACCESSOR,
                    null,
                    'Unexpected end of input or whitespace while parsing inner variable accessor path.'
                ));
            }
        }

        return {
            foundOn: foundOn,
            nestedContent: nestedContent
        };
    }
}

interface AccessorScanResults {
    foundOn: number,
    nestedContent: string
}