import { ConditionPairAnalyzer } from '../analyzers/conditionPairAnalyzer';
import NodeTypeAnalyzer from '../analyzers/nodeTypeAnalyzer';
import { TagIdentifierAnalyzer } from '../analyzers/tagIdentifierAnalyzer';
import { AntlersError } from '../errors/antlersError';
import { AntlersErrorCodes } from '../errors/antlersErrorCodes';
import { AntlersLexer } from '../lexer/antlersLexer';
import { AbstractNode, AntlersNode, ParameterNode, RecursiveNode } from '../nodes/abstractNode';
import { TagIdentifier } from '../nodes/tagIdentifier';
import { StringUtilities } from '../utilities/stringUtilities';
import { DocumentParser } from './documentParser';
import { PathParser } from './pathParser';

export class AntlersNodeParser {

    private chars: string[] = [];
    private inputLen = 0;
    private currentIndex = 0;
    private cur: string | null = null;
    private prev: string | null = null;
    private pathParser: PathParser = new PathParser();
    private lexer: AntlersLexer = new AntlersLexer();
    private activeNode: AntlersNode | null = null;

    private reset() {
        this.chars = [];
        this.inputLen = 0;
        this.currentIndex = 0;
        this.cur = null;
        this.prev = null;
    }

    private canBeClosingTag(node: AntlersNode) {
        const name = node.name?.name;

        if (name == 'elseif' || name == 'else') {
            return true;
        }

        if (node.name == null) {
            return false;
        }

        return node.name.content.startsWith('/');
    }

    parseNode(node: AntlersNode) {
        this.activeNode = node;
        this.reset();

        if (node.content.startsWith('*subrecursive')) {
            let nodeContent = node.content;

            nodeContent = nodeContent.trim();
            nodeContent = StringUtilities.trimRight(nodeContent, '*');
            nodeContent = nodeContent.substr(13);

            const recursiveNode = new RecursiveNode();
            node.copyBasicDetailsTo(recursiveNode);
            recursiveNode.originalNode = node;
            recursiveNode.name = new TagIdentifier();
            recursiveNode.name.name = nodeContent;
            recursiveNode.isNestedRecursive = true;

            recursiveNode.pathReference = this.pathParser.parse(nodeContent);
            recursiveNode.mergeErrors(this.pathParser.getAntlersErrors());
            recursiveNode.content = nodeContent;
            recursiveNode.runtimeContent = nodeContent;

            return recursiveNode;
        }

        if (node.content.trim().startsWith('*recursive')) {
            let nodeContent = node.content;

            nodeContent = nodeContent.trim();
            nodeContent = StringUtilities.trimRight(nodeContent, '*');
            nodeContent = nodeContent.substr(10).trim();

            const recursiveNode = new RecursiveNode();
            node.copyBasicDetailsTo(recursiveNode);
            recursiveNode.originalNode = node;
            recursiveNode.name = new TagIdentifier();
            recursiveNode.name.name = nodeContent;

            recursiveNode.pathReference = this.pathParser.parse(nodeContent);
            recursiveNode.mergeErrors(this.pathParser.getAntlersErrors());
            recursiveNode.content = nodeContent;
            recursiveNode.runtimeContent = nodeContent;

            return recursiveNode;
        }

        this.chars = node.content.split('');
        this.inputLen = this.chars.length;

        const nameContent: string[] = [];

        let hasFoundName = false,
            name = '',
            isParsingString = false,
            terminator: string | null = null;

        for (this.currentIndex; this.currentIndex < this.inputLen; this.currentIndex += 1) {
            this.cur = this.chars[this.currentIndex];

            if (this.currentIndex > 0) {
                this.prev = this.chars[this.currentIndex - 1];
            }

            if (hasFoundName == false) {
                if (isParsingString == false && (
                    this.cur == DocumentParser.String_Terminator_DoubleQuote ||
                    this.cur == DocumentParser.String_Terminator_SingleQuote
                )) {
                    terminator = this.cur;
                    isParsingString = true;
                    nameContent.push(this.cur);
                    continue;
                }

                if (isParsingString && StringUtilities.ctypeSpace(this.cur)) {
                    nameContent.push(this.cur);
                    continue;
                }

                if (isParsingString && this.cur == terminator && this.prev != DocumentParser.String_EscapeCharacter) {
                    terminator = null;
                    isParsingString = false;
                    nameContent.push(this.cur);
                    continue;
                }

                if (StringUtilities.ctypeSpace(this.cur) || (this.currentIndex == (this.inputLen - 1)) ||
                    this.cur == DocumentParser.Punctuation_Pipe) {
                    if (nameContent.length == 0) {
                        continue;
                    } else {
                        if (!StringUtilities.ctypeSpace(this.cur)) {
                            if (this.cur != DocumentParser.Punctuation_Pipe) {
                                nameContent.push(this.cur);
                            }
                        }

                        name = nameContent.join('');
                        hasFoundName = true;
                        break;
                    }
                }

                nameContent.push(this.cur);
            }
        }

        const tagNameStartsAt = node.getContentRelativeStartIndex();
        node.nameStartsOn = node.relativeOffset(tagNameStartsAt, tagNameStartsAt);

        if (node.nameStartsOn != null) {
            node.nameEndsOn = node.nameStartsOn.shiftRight(name.length - 1);

            if (name.includes(DocumentParser.Punctuation_Colon)) {
                const separatorOffset = name.indexOf(DocumentParser.Punctuation_Colon);

                // Use the +1 here to advance the position past the ":" character.
                node.nameMethodPartStartsOn = node.nameStartsOn.shiftRight(separatorOffset + 1);
            }
        }

        node.name = TagIdentifierAnalyzer.getIdentifier(name);

        NodeTypeAnalyzer.analyzeNode(node);

        node.parameters = this.getParameters(node);
        node.hasParameters = node.parameters.length > 0;

        if (node.hasParameters) {
            NodeTypeAnalyzer.analyzeParametersForModifiers(node);
            node.resetContentCache();
        }

        node.pathReference = this.pathParser.parse(name);
        node.mergeErrors(this.pathParser.getAntlersErrors());

        if (node.pathReference != null) {
            if (node.pathReference.isStrictTagReference) {
                node.name.name = node.name.name.substr(1);
                node.name.content = node.name.content.substr(1);
            }
        }

        node.isClosingTag = this.canBeClosingTag(node);

        let runtimeNodes: AbstractNode[] = [];

        if (node.isClosingTag == false) {
            runtimeNodes = this.lexer.tokenize(node, node.getContent());
        }

        node.runtimeNodes = runtimeNodes;

        const trimmedInner = node.content.trim();

        if (ConditionPairAnalyzer.isConditionalStructure(node) && node.name.name != 'else' && runtimeNodes.length == 0
            && trimmedInner != '/if' && trimmedInner != '/unless' && trimmedInner != '/endunless'
            && trimmedInner != 'endif' && trimmedInner != 'endunless'
            && trimmedInner != '/endif') {
            const nodeContent = node.getContent().trim();

            if (nodeContent.length == 0) {
                this.pushConditionWithoutExpression(node);
            }
        }

        if (node.name.name == 'endif') {
            const replacedNode = node.copyBasicDetails(),
                nodeParser = node.getParser();

            if (nodeParser != null) {
                replacedNode.withParser(nodeParser);
            }

            replacedNode.name = new TagIdentifier();
            replacedNode.name.name = 'if';
            replacedNode.name.compound = 'if';

            replacedNode.isClosingTag = true;
            replacedNode.content = ' /if ';
            replacedNode.originalNode = node;

            return replacedNode;
        }

        // Convert unless, elseunless tags into their if/elseif equivalents.
        if (node.name.name == 'unless') {
            const replacedNode = node.copyBasicDetails(),
                nodeParser = node.getParser();

            if (nodeParser != null) {
                replacedNode.withParser(nodeParser);
            }

            replacedNode.name = new TagIdentifier();
            replacedNode.name.name = 'if';
            replacedNode.name.compound = 'if';

            if (node.isClosingTag == false) {
                const originalContent = node.getContent() ?? '',
                    unlessContent = ' if !(' + originalContent + ') ';

                replacedNode.content = unlessContent;
                replacedNode.originalNode = node;
                replacedNode.resetContentCache();

                replacedNode.runtimeNodes = this.lexer.tokenize(replacedNode, replacedNode.getContent() ?? '');
                this.testUnlessContent(replacedNode);
            } else {
                replacedNode.originalNode = node;
                replacedNode.content = ' /if ';
            }

            return replacedNode;
        } else if (node.name.name == 'elseunless') {
            const replacedNode = node.copyBasicDetails(),
                nodeParser = node.getParser();

            if (nodeParser != null) {
                replacedNode.withParser(nodeParser);
            }

            replacedNode.name = new TagIdentifier();
            replacedNode.name.name = 'elseif';
            replacedNode.name.compound = 'elseif';

            const originalContent = node.getContent() ?? '',
                unlessContent = ' elseif !(' + originalContent + ') ';

            replacedNode.content = unlessContent;
            replacedNode.originalNode = node;
            replacedNode.resetContentCache();

            replacedNode.runtimeNodes = this.lexer.tokenize(replacedNode, replacedNode.getContent() ?? '');

            this.testUnlessContent(replacedNode);

            return replacedNode;
        } else if (node.name.name == 'endunless') {
            const replacedNode = node.copyBasicDetails(),
                nodeParser = node.getParser();

            if (nodeParser != null) {
                replacedNode.withParser(nodeParser);
            }

            replacedNode.name = new TagIdentifier();
            replacedNode.name.name = 'if';
            replacedNode.name.compound = 'if';

            replacedNode.isClosingTag = true;
            replacedNode.content = ' /if ';
            replacedNode.originalNode = node;

            return replacedNode;
        }

        return node;
    }

    private pushError(error: AntlersError) {
        if (this.activeNode != null) {
            this.activeNode.pushError(error);
        }
    }

    private testUnlessContent(node: AntlersNode) {
        let testContent = node.getContent() ?? '';

        testContent = testContent.replace('!', '');
        testContent = testContent.replace('(', '');
        testContent = testContent.replace(')', '').trim();

        if (testContent.length == 0) {
            this.pushConditionWithoutExpression(node);
            return;
        }
    }

    private pushConditionWithoutExpression(node: AntlersNode) {
        this.pushError(AntlersError.makeSyntaxError(
            AntlersErrorCodes.TYPE_PARSE_EMPTY_CONDITIONAL,
            node,
            'Condition structure lacks comparison expression.'
        ));
    }

    private getParameters(node: AntlersNode) {
        const content = node.getContent() ?? '',
            chars = content.split(''),
            parameters: ParameterNode[] = [],
            charCount = chars.length;

        // Calculate the index that appears immediately after the node's name (if available).
        // This index will be utilized to help determine if we should break early when
        // encountering strings. We want to break if we find strings outside of a
        // parameter only if they do not appear as part of the node's name.
        //
        // This should not cause the parser to exit early:
        //     {{ data['key'] first="true" }}
        //
        // This should cause parser to exit early:
        //     {{ data['other_key'] + 'first="true"'; }}
        let parseContentOffset = 0;

        if (node.name != null) {
            const trimmedName = StringUtilities.trimLeft(node.content, ' '),
                leadOffset = node.content.length - trimmedName.length,
                nameLength = node.name.content.length;

            if (leadOffset > 0) {
                parseContentOffset = leadOffset + nameLength;
            } else {
                parseContentOffset = nameLength;
            }
        }

        let hasFoundName = false,
            currentChars: string[] = [],
            name = '',
            nameStart = 0,
            startAt = 0,
            ignorePrevious = false,
            terminator: string | null = null,
            blockStartAt = -1,
            blockEndAt = -1,
            nameBlockStartAt = -1,
            nameBlockEndAt = -1,
            valueBlockStartAt = -1,
            valueBlockEndAt = -1,
            nameDelimiter = '"';

        for (let i = 0; i < charCount; i++) {
            const current = chars[i];

            let prev: string | null = null,
                next: string | null = null;

            if ((i + 1) < charCount) {
                next = chars[i + 1];
            }

            if (!ignorePrevious) {
                if (i > 0) {
                    prev = chars[i - 1];
                }
            } else {
                prev = '';
                ignorePrevious = false;
            }

            if (hasFoundName == false && StringUtilities.ctypeSpace(current)) {
                // Flush the buffer.
                currentChars = [];
                blockStartAt = -1;
                blockEndAt = -1;
                nameBlockStartAt = -1;
                nameBlockEndAt = -1;
                valueBlockStartAt = -1;
                valueBlockEndAt = -1;
                continue;
            }

            if (hasFoundName == false && current == DocumentParser.Punctuation_Equals) {
                if (currentChars.length > 0) {
                    if ((StringUtilities.ctypeAlpha(currentChars[0]) || currentChars[0] == DocumentParser.Punctuation_Colon || currentChars[0] == DocumentParser.AtChar) == false) {
                        currentChars = [];
                        continue;
                    }
                }

                if (i + 1 >= charCount) {
                    this.pushError(AntlersError.makeSyntaxError(
                        AntlersErrorCodes.TYPE_UNEXPECTED_END_OF_INPUT,
                        node,
                        'Unexpected end of input'
                    ));
                    continue;
                }

                let peek: string | null = null;

                if (i + 1 < charCount) {
                    peek = chars[i + 1];
                }

                if (prev == DocumentParser.Punctuation_Equals) {
                    currentChars = [];
                    blockStartAt = -1;
                    blockEndAt = -1;
                    nameBlockStartAt = -1;
                    nameBlockEndAt = -1;
                    valueBlockStartAt = -1;
                    valueBlockEndAt = -1;
                    continue;
                }

                if (StringUtilities.ctypeSpace(peek) || peek == DocumentParser.Punctuation_Equals) {
                    currentChars = [];
                    blockStartAt = -1;
                    blockEndAt = -1;
                    nameBlockStartAt = -1;
                    nameBlockEndAt = -1;
                    valueBlockStartAt = -1;
                    valueBlockEndAt = -1;
                    continue;
                }

                if (currentChars.length > 0) {
                    nameBlockEndAt = i;
                    valueBlockStartAt = i;
                    name = currentChars.join('');
                    nameStart = startAt;
                    hasFoundName = true;

                    currentChars = [];
                }

                if (next == DocumentParser.String_Terminator_DoubleQuote) {
                    terminator = DocumentParser.String_Terminator_DoubleQuote;
                    nameDelimiter = DocumentParser.String_Terminator_DoubleQuote;
                    i += 1;
                }

                if (next == DocumentParser.String_Terminator_SingleQuote) {
                    terminator = DocumentParser.String_Terminator_SingleQuote;
                    nameDelimiter = DocumentParser.String_Terminator_SingleQuote;
                    i += 1;
                }

                continue;
            }

            if (hasFoundName && current == DocumentParser.String_EscapeCharacter) {
                let peek: string | null = null;

                if (i + 1 < charCount) {
                    peek = chars[i + 1];
                }

                if (peek == DocumentParser.String_EscapeCharacter) {
                    currentChars.push(DocumentParser.String_EscapeCharacter);
                    i += 1;
                    ignorePrevious = true;
                    continue;
                }

                if (peek == DocumentParser.String_Terminator_DoubleQuote) {
                    currentChars.push(DocumentParser.String_Terminator_DoubleQuote);
                    i += 1;
                    continue;
                }

                if (peek == DocumentParser.String_Terminator_SingleQuote) {
                    currentChars.push(DocumentParser.String_Terminator_SingleQuote);
                    i += 1;
                    continue;
                }

                if (peek == 'n') {
                    currentChars.push("\n");
                    i += 1;
                    continue;
                }

                if (peek == 'r') {
                    currentChars.push("\r");
                    i += 1;
                    continue;
                }
            }

            if (hasFoundName && (
                (terminator != null && current == terminator) ||
                (terminator == null && StringUtilities.ctypeSpace(current))
            )) {
                const content = currentChars.join('');
                valueBlockEndAt = i;
                blockEndAt = i;
                hasFoundName = false;
                terminator = null;
                currentChars = [];

                const parameterNode = new ParameterNode();

                if (name.startsWith(DocumentParser.Punctuation_Colon)) {
                    parameterNode.isVariableReference = true;
                    name = name.substr(1);
                }

                parameterNode.nameDelimiter = nameDelimiter;
                parameterNode.name = name;
                parameterNode.value = content;

                parameterNode.startPosition = node.relativePositionFromOffset(startAt, nameStart) ?? null;

                if (i + 1 > charCount) {
                    this.pushError(AntlersError.makeSyntaxError(
                        AntlersErrorCodes.TYPE_UNEXPECTED_EOI_WHILE_PARSING_NODE_PARAMETER,
                        node,
                        'Unexpected end of input while parsing parameter content.'
                    ));

                    parameterNode.parent = node;
                    parameters.push(parameterNode);
                    name = '';
                    continue;
                }

                parameterNode.endPosition = node.relativePositionFromOffset(i + 1, i + 1) ?? null;
                parameterNode.parent = node;

                parameterNode.blockPosition = {
                    start: node.relativeOffset(blockStartAt, blockStartAt) ?? null,
                    end: node.relativeOffset(blockEndAt, blockEndAt) ?? null
                };
                parameterNode.namePosition = {
                    start: node.relativeOffset(nameBlockStartAt, nameBlockStartAt) ?? null,
                    end: node.relativeOffset(nameBlockEndAt, nameBlockEndAt) ?? null
                };
                parameterNode.valuePosition = {
                    start: node.relativeOffset(valueBlockStartAt + 2, valueBlockStartAt + 2) ?? null,
                    end: node.relativeOffset(valueBlockEndAt, valueBlockEndAt) ?? null
                };

                parameters.push(parameterNode);
                name = '';

                blockStartAt = -1;
                blockEndAt = -1;
                nameBlockStartAt = -1;
                nameBlockEndAt = -1;
                valueBlockStartAt = -1;
                valueBlockEndAt = -1;

                continue;
            }

            if (hasFoundName == false && (current == DocumentParser.String_Terminator_DoubleQuote || current == DocumentParser.String_Terminator_SingleQuote)) {
                if (i > parseContentOffset) {
                    break;
                }
            }

            currentChars.push(current);

            if (blockStartAt == -1) { blockStartAt = i; }
            if (nameBlockStartAt == -1) { nameBlockStartAt = i; }

            if (currentChars.length == 1) {
                startAt = i + 1;
            }
        }

        if (terminator != null) {
            this.pushError(AntlersError.makeSyntaxError(
                AntlersErrorCodes.TYPE_UNEXPECTED_END_OF_INPUT,
                node,
                'Unexpected end of input while parsing string.'
            ));
        }

        return parameters;
    }
}