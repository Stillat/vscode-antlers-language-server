import { AntlersError } from '../errors/antlersError';
import { AntlersErrorCodes } from '../errors/antlersErrorCodes';
import { TypeLabeler } from '../errors/typeLabeler';
import { AbstractNode, AdditionAssignmentOperator, AdditionOperator, AntlersNode, ArgSeparator, ConditionalVariableFallbackOperator, DivisionAssignmentOperator, DivisionOperator, EqualCompOperator, ExponentiationOperator, FalseConstant, GreaterThanCompOperator, InlineBranchSeparator, InlineTernarySeparator, LeftAssignmentOperator, LessThanCompOperator, LessThanEqualCompOperator, LogicalAndOperator, LogicalNegationOperator, LogicalOrOperator, LogicalXorOperator, LogicGroupBegin, LogicGroupEnd, MethodInvocationNode, ModifierNameNode, ModifierSeparator, ModifierValueNode, ModifierValueSeparator, ModulusAssignmentOperator, ModulusOperator, MultiplicationAssignmentOperator, MultiplicationOperator, NotEqualCompOperator, NotStrictEqualCompOperator, NullCoalesceOperator, NullConstant, NumberNode, ScopeAssignmentOperator, SpaceshipCompOperator, StatementSeparatorNode, StrictEqualCompOperator, StringConcatenationOperator, StringValueNode, SubtractionAssignmentOperator, SubtractionOperator, TrueConstant, TupleListStart, VariableNode } from '../nodes/abstractNode';
import { DocumentParser } from '../parser/documentParser';
import { LanguageKeywords } from '../parser/languageKeywords';
import { StringUtilities } from '../utilities/stringUtilities';

export class AntlersLexer {
    private chars: string[] = [];
    private inputLen = 0;
    private currentIndex = 0;
    private currentContent: string[] = [];
    private rawContent: string[] = [];
    private startIndex = 0;
    private cur: string | null = null;
    private next: string | null = null;
    private prev: string | null = null;
    private isParsingString = false;
    private isParsingModifierName = false;
    private isInModifierParameterValue = false;
    private runtimeNodes: AbstractNode[] = [];
    private ignorePrevious = false;
    private lastNode: AbstractNode | null = null;

    private referenceParser: DocumentParser | null = null;
    private activeNode: AntlersNode | null = null;

    private reset() {
        this.ignorePrevious = false;
        this.runtimeNodes = [];
        this.chars = [];
        this.inputLen = 0;
        this.currentIndex = 0;
        this.currentContent = [];
        this.rawContent = [];
        this.startIndex = 0;
        this.cur = null;
        this.next = null;
        this.prev = null;
        this.isParsingString = false;
        this.isParsingModifierName = false;
        this.isInModifierParameterValue = false;
        this.referenceParser = null;
        this.activeNode = null;
    }

    private checkCurrentOffsets() {
        this.cur = this.chars[this.currentIndex];
        this.prev = null;
        this.next = null;

        if (!this.ignorePrevious) {
            if (this.currentIndex > 0) {
                this.prev = this.chars[this.currentIndex - 1];
            }
        } else {
            this.prev = '';
            this.ignorePrevious = false;
        }

        if ((this.currentIndex + 1) < this.inputLen) {
            this.next = this.chars[this.currentIndex + 1];
        }
    }

    private isValidChar(char: string | null) {
        if (char == null) {
            return false;
        }

        if (char == DocumentParser.Punctuation_Semicolon) {
            return false;
        }

        if (this.isParsingString == false && char == ']') {
            return true;
        }

        if (this.isParsingString == false && char == ')') {
            return false;
        }

        if ((char == '[' || char == ']') && char == this.cur) {
            return true;
        }

        if ((char == '_' || char == '.' || char == '[' || char == ']') &&
            (!(this.currentContent.length > 0) || StringUtilities.ctypeAlpha(this.cur) || StringUtilities.ctypeDigit(this.cur))) {
            return true;
        }

        if (StringUtilities.ctypeSpace(char)) {
            return false;
        }

        if (this.isParsingModifierName &&
            (char == DocumentParser.Punctuation_Minus || char == DocumentParser.Punctuation_Underscore)) {
            return true;
        }

        if (StringUtilities.ctypePunct(char)) {
            return false;
        }

        return true;
    }

    private isRightOfInterpolationRegion() {
        if (this.activeNode == null) {
            return false;
        }

        if (this.referenceParser == null) {
            return false;
        }

        const relative = this.activeNode._lexerRelativeOffset(this.currentIndex);

        return this.referenceParser.bordersInterpolationRegion(relative);
    }

    private scanForwardTo(char: string, skip = 0) {
        const returnChars: string[] = [];

        for (let i = this.currentIndex + 1 + skip; i < this.inputLen; i++) {
            const cur = this.chars[i];

            if (cur == char) {
                returnChars.push(cur);
                break;
            } else {
                returnChars.push(cur);
            }
        }

        return returnChars;
    }

    private nextNonWhitespace() {
        for (let i = this.currentIndex + 1; i < this.inputLen; i++) {
            const cur = this.chars[i];

            if (!StringUtilities.ctypeSpace(cur)) {
                return cur;
            }
        }

        return null;
    }

    private pushError(error: AntlersError) {
        if (this.referenceParser != null) {
            this.referenceParser.addAntlersError(error);
        }
    }

    private guardAgainstNeighboringTypesInModifier(current: AbstractNode) {
        if (this.lastNode instanceof ModifierValueNode) {
            this.pushError(AntlersError.makeSyntaxError(
                AntlersErrorCodes.TYPE_MODIFIER_INCORRECT_VALUE_POSITION,
                this.lastNode,
                'Incorrect type [' + TypeLabeler.getPrettyTypeName(current)
                + '] near [' + TypeLabeler.getPrettyTypeName(this.lastNode) + ']'
            ));
        }
        return false;
    }

    private appendContent(char: string | null) {
        if (char != null) {
            this.currentContent.push(char);
        }
    }

    tokenize(node: AntlersNode, input: string) {
        this.reset();
        this.referenceParser = node.getParser();
        this.activeNode = node;

        this.chars = input.split('');
        this.inputLen = this.chars.length;
        this.runtimeNodes = [];
        this.lastNode = null;

        let stringStartedOn: number | null = null;
        this.isParsingString = false;
        this.isParsingModifierName = false;
        let terminator: string | null = null;

        for (this.currentIndex; this.currentIndex < this.inputLen; this.currentIndex += 1) {
            this.checkCurrentOffsets();
            let addCurrent = true;

            if (this.cur != null) {
                this.rawContent.push(this.cur);
            }

            if (this.isParsingString == false) {
                if (this.cur == DocumentParser.String_Terminator_DoubleQuote || this.cur == DocumentParser.String_Terminator_SingleQuote) {
                    if (this.prev == DocumentParser.String_EscapeCharacter) {
                        this.pushError(AntlersError.makeSyntaxError(
                            AntlersErrorCodes.TYPE_ILLEGAL_STRING_ESCAPE_SEQUENCE,
                            node,
                            'Illegal string escape sequence outside string parsing.'
                        ));
                        continue;
                    }

                    this.rawContent = [];
                    this.rawContent.push(this.cur);
                    terminator = this.cur;
                    this.isParsingString = true;
                    stringStartedOn = this.currentIndex;
                    continue;
                }
            }

            if (this.isInModifierParameterValue && !this.isParsingString) {
                let breakForKeyword = false;

                if (!this.isParsingString && StringUtilities.ctypeSpace(this.next)) {
                    const nextWord = this.scanForwardTo(' ', 1).join('').trim().toLowerCase();

                    if (nextWord.length > 0 && LanguageKeywords.isLanguageLogicalKeyword(nextWord)) {
                        breakForKeyword = true;
                    }
                }

                if (this.next == DocumentParser.String_Terminator_SingleQuote ||
                    this.next == DocumentParser.String_Terminator_DoubleQuote ||
                    this.next == null ||
                    breakForKeyword) {
                    this.appendContent(this.cur);
                    const implodedCurrentContent = this.currentContent.join('');

                    if (implodedCurrentContent.length > 0) {
                        const parsedValue = implodedCurrentContent;
                        this.currentContent = [];
                        this.rawContent = [];

                        if (parsedValue.trimRight().length == 0) {
                            const nextNonWhitespace = this.nextNonWhitespace();

                            if (nextNonWhitespace == DocumentParser.String_Terminator_SingleQuote ||
                                nextNonWhitespace == DocumentParser.String_Terminator_DoubleQuote) {
                                this.currentContent = [];
                                this.rawContent = [];
                                continue;
                            }
                        }

                        const modifierValueNode = new ModifierValueNode();
                        modifierValueNode.isVirtual = false;
                        modifierValueNode.name = parsedValue;
                        modifierValueNode.value = parsedValue.trimRight();
                        modifierValueNode.startPosition = node._lexerRelativeOffset(this.currentIndex - parsedValue.length);
                        modifierValueNode.endPosition = node._lexerRelativeOffset(this.currentIndex);
                        modifierValueNode.parent = this.activeNode;

                        this.guardAgainstNeighboringTypesInModifier(modifierValueNode);

                        this.runtimeNodes.push(modifierValueNode);
                        this.lastNode = modifierValueNode;
                    }

                    if (implodedCurrentContent.length == 0) {
                        continue;
                    }

                    this.currentContent = [];
                    this.rawContent = [];
                    this.isInModifierParameterValue = false;
                    continue;
                }

                if (this.next == DocumentParser.Punctuation_Pipe ||
                    this.next == DocumentParser.Punctuation_Colon ||
                    this.next == DocumentParser.RightParent) {
                    this.isInModifierParameterValue = false;
                    this.appendContent(this.cur);

                    let additionalSkip = 0,
                        trimStartEnd = false;

                    if (this.currentContent[0] == DocumentParser.String_Terminator_SingleQuote ||
                        this.currentContent[0] == DocumentParser.String_Terminator_DoubleQuote) {
                        const scan = this.scanForwardTo(this.currentContent[0]);

                        if (scan.length > 0) {
                            this.currentContent = this.currentContent.concat(scan);
                            additionalSkip = scan.length;
                            trimStartEnd = true;
                        }
                    }

                    let parsedValue = this.currentContent.join('');

                    if (trimStartEnd) {
                        parsedValue = parsedValue.substr(1);
                        parsedValue = parsedValue.slice(0, -1);
                    }

                    this.currentContent = [];
                    this.rawContent = [];

                    const modifierValueNode = new ModifierValueNode();
                    modifierValueNode.isVirtual = false;
                    modifierValueNode.name = parsedValue;
                    modifierValueNode.value = parsedValue;
                    modifierValueNode.startPosition = node._lexerRelativeOffset(this.currentIndex - parsedValue.length);
                    modifierValueNode.endPosition = node._lexerRelativeOffset(this.currentIndex);
                    modifierValueNode.parent = this.activeNode;

                    this.runtimeNodes.push(modifierValueNode);

                    this.guardAgainstNeighboringTypesInModifier(modifierValueNode);

                    this.lastNode = modifierValueNode;
                    this.currentIndex += additionalSkip;
                } else {
                    this.appendContent(this.cur);
                }

                continue;
            }

            if (this.isParsingString && this.cur == terminator) {
                if (this.prev == DocumentParser.String_EscapeCharacter) {
                    this.appendContent(terminator);
                } else {
                    if (this.isInModifierParameterValue) {
                        const parsedValue = this.currentContent.join('');

                        const modifierValueNode = new ModifierValueNode();
                        modifierValueNode.isVirtual = false;
                        modifierValueNode.name = parsedValue;
                        modifierValueNode.value = parsedValue;
                        modifierValueNode.startPosition = node._lexerRelativeOffset(stringStartedOn ?? 0);
                        modifierValueNode.endPosition = node._lexerRelativeOffset(this.currentIndex);
                        modifierValueNode.parent = this.activeNode;

                        this.runtimeNodes.push(modifierValueNode);

                        this.guardAgainstNeighboringTypesInModifier(modifierValueNode);

                        this.lastNode = modifierValueNode;

                        this.currentContent = [];
                        this.rawContent = [];
                        this.isParsingString = false;
                        this.isInModifierParameterValue = false;
                        continue;
                    }

                    const stringNode = new StringValueNode();
                    stringNode.isVirtual = false;
                    stringNode.startPosition = node._lexerRelativeOffset(stringStartedOn ?? 0);
                    stringNode.endPosition = node._lexerRelativeOffset(this.currentIndex);
                    if (this.referenceParser != null) {
                        stringNode.sourceContent = this.referenceParser.getText(stringNode.startPosition.index, stringNode.endPosition.index + 1);
                    }
                    stringNode.parent = this.activeNode;

                    if (terminator != null) {
                        stringNode.sourceTerminator = terminator;
                    }
                    terminator = null;
                    this.isParsingString = false;
                    stringNode.value = this.currentContent.join('');
                    stringNode.rawLexContent = this.rawContent.join('').trim();

                    this.currentContent = [];
                    this.rawContent = [];

                    this.guardAgainstNeighboringTypesInModifier(stringNode);

                    this.runtimeNodes.push(stringNode);
                    this.lastNode = stringNode;
                }
                continue;
            }

            if (this.isParsingString && this.cur == DocumentParser.String_EscapeCharacter) {
                if (this.next == DocumentParser.String_EscapeCharacter) {
                    this.appendContent(DocumentParser.String_EscapeCharacter);
                    this.ignorePrevious = true;
                    this.currentIndex += 1;
                    continue;
                } else if (this.next == DocumentParser.String_Terminator_SingleQuote) {
                    this.appendContent(DocumentParser.String_Terminator_SingleQuote);
                    this.rawContent.push(DocumentParser.String_EscapeCharacter);
                    this.rawContent.push(DocumentParser.String_Terminator_SingleQuote);
                    this.currentIndex += 1;
                    continue;
                } else if (this.next == DocumentParser.String_Terminator_DoubleQuote) {
                    this.appendContent(DocumentParser.String_Terminator_DoubleQuote);
                    this.rawContent.push(DocumentParser.String_EscapeCharacter);
                    this.rawContent.push(DocumentParser.String_Terminator_DoubleQuote);
                    this.currentIndex += 1;
                    continue;
                } else if (this.next == 'n') {
                    this.appendContent("\n");
                    this.currentIndex += 1;
                    continue;
                } else if (this.next == 't') {
                    this.appendContent("\t");
                    this.currentIndex += 1;
                    continue;
                } else if (this.next == 'r') {
                    this.appendContent("\r");
                    this.currentIndex += 1;
                    continue;
                }
            }

            if (this.isParsingString == false) {

                if (this.isValidChar(this.cur) && this.isValidChar(this.next) == false && this.currentContent.length == 0) {
                    this.appendContent(this.cur);
                    addCurrent = false;
                }

                if ((this.next == null || this.isValidChar(this.next) == false) && this.currentContent.length > 0) {
                    if (addCurrent) {
                        this.appendContent(this.cur);
                    }

                    const parsedValue = this.currentContent.join('').trim(),
                        valueLen = parsedValue.length,
                        valueStartIndex = this.currentIndex - valueLen,
                        startPosition = node._lexerRelativeOffset(valueStartIndex),
                        endPosition = node._lexerRelativeOffset(this.currentIndex);

                    this.currentContent = [];
                    this.rawContent = [];

                    // Check against internal keywords.
                    if (parsedValue == LanguageKeywords.LogicalAnd) {
                        const logicalAnd = new LogicalAndOperator();
                        logicalAnd.isVirtual = false;
                        logicalAnd.content = LanguageKeywords.LogicalAnd;
                        logicalAnd.startPosition = startPosition;
                        logicalAnd.endPosition = endPosition;
                        logicalAnd.parent = this.activeNode;

                        this.runtimeNodes.push(logicalAnd);
                        this.lastNode = logicalAnd;
                        continue;
                    } else if (parsedValue == LanguageKeywords.LogicalOr) {
                        const logicalOr = new LogicalOrOperator();
                        logicalOr.isVirtual = false;
                        logicalOr.content = LanguageKeywords.LogicalOr;
                        logicalOr.startPosition = startPosition;
                        logicalOr.endPosition = endPosition;
                        logicalOr.parent = this.activeNode;

                        this.runtimeNodes.push(logicalOr);
                        this.lastNode = logicalOr;
                        continue;
                    } else if (parsedValue == LanguageKeywords.LogicalXor) {
                        const logicalXor = new LogicalXorOperator();
                        logicalXor.isVirtual = false;
                        logicalXor.content = LanguageKeywords.LogicalXor;
                        logicalXor.startPosition = startPosition;
                        logicalXor.endPosition = endPosition;
                        logicalXor.parent = this.activeNode;

                        this.runtimeNodes.push(logicalXor);
                        this.lastNode = logicalXor;
                        continue;
                    } else if (parsedValue == LanguageKeywords.ConstNull) {
                        const constNull = new NullConstant();
                        constNull.isVirtual = false;
                        constNull.content = LanguageKeywords.ConstNull;
                        constNull.startPosition = startPosition;
                        constNull.endPosition = endPosition;
                        constNull.parent = this.activeNode;

                        this.runtimeNodes.push(constNull);
                        this.lastNode = constNull;
                        continue;
                    } else if (parsedValue == LanguageKeywords.ConstTrue) {
                        const constTrue = new TrueConstant();
                        constTrue.isVirtual = false;
                        constTrue.content = LanguageKeywords.ConstTrue;
                        constTrue.startPosition = startPosition;
                        constTrue.endPosition = endPosition;
                        constTrue.parent = this.activeNode;

                        this.runtimeNodes.push(constTrue);
                        this.lastNode = constTrue;
                        continue;
                    } else if (parsedValue == LanguageKeywords.ConstFalse) {
                        const constFalse = new FalseConstant();
                        constFalse.isVirtual = false;
                        constFalse.content = LanguageKeywords.ConstFalse;
                        constFalse.startPosition = startPosition;
                        constFalse.endPosition = endPosition;
                        constFalse.parent = this.activeNode;

                        this.runtimeNodes.push(constFalse);
                        this.lastNode = constFalse;
                        continue;
                    } else if (parsedValue == LanguageKeywords.LogicalNot) {
                        const logicNegation = new LogicalNegationOperator();
                        logicNegation.isVirtual = false;
                        logicNegation.content = LanguageKeywords.LogicalNot;
                        logicNegation.startPosition = startPosition;
                        logicNegation.endPosition = endPosition;
                        logicNegation.parent = this.activeNode;

                        this.runtimeNodes.push(logicNegation);
                        this.lastNode = logicNegation;
                        continue;
                    } else if (parsedValue == LanguageKeywords.ArrList && this.next == DocumentParser.LeftParen) {
                        const tupleListStart = new TupleListStart();
                        tupleListStart.isVirtual = false;
                        tupleListStart.content = LanguageKeywords.ArrList;
                        tupleListStart.startPosition = startPosition;
                        tupleListStart.endPosition = endPosition;
                        tupleListStart.parent = this.activeNode;

                        this.runtimeNodes.push(tupleListStart);
                        this.lastNode = tupleListStart;
                        continue;
                    }

                    if (StringUtilities.isNumeric(parsedValue)) {
                        const numberNode = new NumberNode();
                        numberNode.isVirtual = false;
                        numberNode.startPosition = startPosition;
                        numberNode.endPosition = endPosition;
                        numberNode.parent = this.activeNode;

                        if (parsedValue.includes('.')) {
                            numberNode.value = parseFloat(parsedValue);
                        } else {
                            numberNode.value = parseInt(parsedValue);
                        }

                        numberNode.rawLexContent = parsedValue;

                        this.guardAgainstNeighboringTypesInModifier(numberNode);

                        this.runtimeNodes.push(numberNode);
                        this.lastNode = numberNode;
                        continue;
                    }

                    if (this.runtimeNodes.length > 0) {
                        const lastValue = this.runtimeNodes[this.runtimeNodes.length - 1];

                        if (lastValue instanceof ModifierSeparator) {
                            const modifierNameNode = new ModifierNameNode();
                            modifierNameNode.isVirtual = false;
                            modifierNameNode.name = parsedValue;
                            modifierNameNode.content = parsedValue;
                            modifierNameNode.startPosition = startPosition;
                            modifierNameNode.endPosition = endPosition;
                            modifierNameNode.parent = this.activeNode;
                            this.runtimeNodes.push(modifierNameNode);
                            this.lastNode = modifierNameNode;
                            continue;
                        } else if (lastValue instanceof ModifierValueSeparator) {
                            const modifierValueNode = new ModifierValueNode();
                            modifierValueNode.isVirtual = false;
                            modifierValueNode.name = parsedValue;
                            modifierValueNode.value = parsedValue;
                            modifierValueNode.startPosition = startPosition;
                            modifierValueNode.endPosition = endPosition;
                            modifierValueNode.parent = this.activeNode;
                            this.runtimeNodes.push(modifierValueNode);
                            this.lastNode = modifierValueNode;

                            this.isParsingModifierName = false;
                            continue;
                        }
                    }

                    const variableRefNode = new VariableNode();
                    variableRefNode.isVirtual = false;
                    variableRefNode.name = parsedValue;

                    variableRefNode.startPosition = startPosition;
                    variableRefNode.endPosition = endPosition;
                    variableRefNode.parent = this.activeNode;
                    this.runtimeNodes.push(variableRefNode);
                    this.lastNode = variableRefNode;

                    continue;
                }
            } else {
                this.appendContent(this.cur);
                continue;
            }

            if (StringUtilities.ctypeSpace(this.cur)) {
                continue;
            }

            if (this.isParsingString == false) {
                if (this.cur == DocumentParser.Punctuation_Equals &&
                    this.next == DocumentParser.Punctuation_GreaterThan) {
                    const scopeAssignment = new ScopeAssignmentOperator();
                    scopeAssignment.isVirtual = false;
                    scopeAssignment.content = '=>';
                    scopeAssignment.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    scopeAssignment.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                    scopeAssignment.parent = this.activeNode;

                    this.runtimeNodes.push(scopeAssignment);
                    this.lastNode = scopeAssignment;
                    this.currentContent = [];
                    this.rawContent = [];
                    this.currentIndex += 1;

                    continue;
                }

                if (this.cur == DocumentParser.Punctuation_Comma) {
                    const argSeparator = new ArgSeparator();
                    argSeparator.isVirtual = false;
                    argSeparator.content = DocumentParser.Punctuation_Comma;
                    argSeparator.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    argSeparator.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                    argSeparator.parent = this.activeNode;

                    this.runtimeNodes.push(argSeparator);
                    this.lastNode = argSeparator;
                    continue;
                }

                // ;
                if (this.cur == DocumentParser.Punctuation_Semicolon) {
                    const statementSeparator = new StatementSeparatorNode();
                    statementSeparator.isVirtual = false;
                    statementSeparator.content = DocumentParser.Punctuation_Semicolon;
                    statementSeparator.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    statementSeparator.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                    statementSeparator.parent = this.activeNode;

                    this.runtimeNodes.push(statementSeparator);
                    this.lastNode = statementSeparator;
                    continue;
                }

                // +
                if (this.cur == DocumentParser.Punctuation_Plus) {
                    if (this.next == DocumentParser.Punctuation_Equals) {
                        const additionAssignment = new AdditionAssignmentOperator();
                        additionAssignment.isVirtual = false;
                        additionAssignment.content = '+=';
                        additionAssignment.startPosition = node._lexerRelativeOffset(this.currentIndex);
                        additionAssignment.endPosition = node._lexerRelativeOffset(this.currentIndex + 2);
                        additionAssignment.parent = this.activeNode;

                        this.runtimeNodes.push(additionAssignment);
                        this.lastNode = additionAssignment;
                        this.currentIndex += 1;
                        continue;
                    }

                    const additionOperator = new AdditionOperator();
                    additionOperator.isVirtual = false;
                    additionOperator.content = '+';
                    additionOperator.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    additionOperator.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                    additionOperator.parent = this.activeNode;

                    this.runtimeNodes.push(additionOperator);
                    this.lastNode = additionOperator;
                    continue;
                }

                // -
                if (this.isParsingModifierName == false && this.cur == DocumentParser.Punctuation_Minus) {
                    if (StringUtilities.ctypeDigit(this.next) && (
                        StringUtilities.ctypeDigit(this.prev) == false &&
                        this.prev != DocumentParser.RightParent) && this.isRightOfInterpolationRegion() == false) {
                        this.appendContent(this.cur);
                        continue;
                    }

                    if (this.next == DocumentParser.Punctuation_Equals) {
                        const subtractionAssignment = new SubtractionAssignmentOperator();
                        subtractionAssignment.isVirtual = false;
                        subtractionAssignment.content = '-=';
                        subtractionAssignment.startPosition = node._lexerRelativeOffset(this.currentIndex);
                        subtractionAssignment.endPosition = node._lexerRelativeOffset(this.currentIndex + 2);
                        subtractionAssignment.parent = this.activeNode;

                        this.runtimeNodes.push(subtractionAssignment);
                        this.lastNode = subtractionAssignment;
                        this.currentIndex += 1;
                        continue;
                    } else if (this.next == DocumentParser.Punctuation_GreaterThan) {
                        const methodInvocation = new MethodInvocationNode();
                        methodInvocation.isVirtual = false;
                        methodInvocation.content = '->';
                        methodInvocation.startPosition = node._lexerRelativeOffset(this.currentIndex);
                        methodInvocation.endPosition = node._lexerRelativeOffset(this.currentIndex + 2);
                        methodInvocation.parent = this.activeNode;

                        this.runtimeNodes.push(methodInvocation);
                        this.lastNode = methodInvocation;
                        this.currentIndex += 1;
                        continue;
                    }

                    const subtractionOperator = new SubtractionOperator();
                    subtractionOperator.isVirtual = false;
                    subtractionOperator.content = '-';
                    subtractionOperator.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    subtractionOperator.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                    subtractionOperator.parent = this.activeNode;

                    this.runtimeNodes.push(subtractionOperator);
                    this.lastNode = subtractionOperator;
                    continue;
                }

                if (this.cur == DocumentParser.Punctuation_Asterisk) {
                    // **
                    if (this.next == DocumentParser.Punctuation_Asterisk) {
                        const exponentiationOperator = new ExponentiationOperator();
                        exponentiationOperator.isVirtual = false;
                        exponentiationOperator.content = '**';
                        exponentiationOperator.startPosition = node._lexerRelativeOffset(this.currentIndex);
                        exponentiationOperator.endPosition = node._lexerRelativeOffset(this.currentIndex + 2);
                        exponentiationOperator.parent = this.activeNode;

                        this.runtimeNodes.push(exponentiationOperator);
                        this.lastNode = exponentiationOperator;
                        this.currentIndex += 1;
                        continue;
                    } else if (this.next == DocumentParser.Punctuation_Equals) {
                        const multplicationAssignment = new MultiplicationAssignmentOperator();
                        multplicationAssignment.isVirtual = false;
                        multplicationAssignment.content = '*=';
                        multplicationAssignment.startPosition = node._lexerRelativeOffset(this.currentIndex);
                        multplicationAssignment.endPosition = node._lexerRelativeOffset(this.currentIndex + 2);
                        multplicationAssignment.parent = this.activeNode;

                        this.runtimeNodes.push(multplicationAssignment);
                        this.lastNode = multplicationAssignment;
                        this.currentIndex += 1;
                        continue;
                    }

                    // *
                    const multiplicationOperator = new MultiplicationOperator();
                    multiplicationOperator.isVirtual = false;
                    multiplicationOperator.content = '*';
                    multiplicationOperator.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    multiplicationOperator.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                    multiplicationOperator.parent = this.activeNode;

                    this.runtimeNodes.push(multiplicationOperator);
                    this.lastNode = multiplicationOperator;
                    continue;
                }

                // /
                if (this.cur == DocumentParser.Punctuation_ForwardSlash) {
                    if (this.next == DocumentParser.Punctuation_Equals) {
                        const divisionAssignment = new DivisionAssignmentOperator();
                        divisionAssignment.isVirtual = false;
                        divisionAssignment.content = '/=';
                        divisionAssignment.startPosition = node._lexerRelativeOffset(this.currentIndex);
                        divisionAssignment.endPosition = node._lexerRelativeOffset(this.currentIndex + 2);
                        divisionAssignment.parent = this.activeNode;

                        this.runtimeNodes.push(divisionAssignment);
                        this.lastNode = divisionAssignment;
                        this.currentIndex += 1;
                        continue;
                    }

                    const divisionOperator = new DivisionOperator();
                    divisionOperator.isVirtual = false;
                    divisionOperator.content = '/';
                    divisionOperator.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    divisionOperator.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                    divisionOperator.parent = this.activeNode;

                    this.runtimeNodes.push(divisionOperator);
                    this.lastNode = divisionOperator;
                    continue;
                }

                // %
                if (this.cur == DocumentParser.Punctuation_Percent) {
                    if (this.next == DocumentParser.Punctuation_Equals) {
                        const modulusAssignment = new ModulusAssignmentOperator();
                        modulusAssignment.isVirtual = false;
                        modulusAssignment.content = '%=';
                        modulusAssignment.startPosition = node._lexerRelativeOffset(this.currentIndex);
                        modulusAssignment.endPosition = node._lexerRelativeOffset(this.currentIndex + 2);
                        modulusAssignment.parent = this.activeNode;

                        this.runtimeNodes.push(modulusAssignment);
                        this.lastNode = modulusAssignment;
                        this.currentIndex += 1;
                        continue;
                    }

                    const modulusOperator = new ModulusOperator();
                    modulusOperator.isVirtual = false;
                    modulusOperator.content = '%';
                    modulusOperator.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    modulusOperator.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                    modulusOperator.parent = this.activeNode;

                    this.runtimeNodes.push(modulusOperator);
                    this.lastNode = modulusOperator;
                    continue;
                }

                if (this.cur == DocumentParser.Punctuation_LessThan) {
                    if (this.next == DocumentParser.Punctuation_Equals) {
                        let peek: string | null = null;

                        if ((this.currentIndex + 2) < this.inputLen) {
                            peek = this.chars[this.currentIndex + 2];
                        }

                        // <=>
                        if (peek == DocumentParser.Punctuation_GreaterThan) {
                            const spaceshipOperator = new SpaceshipCompOperator();
                            spaceshipOperator.isVirtual = false;
                            spaceshipOperator.content = '<=>';
                            spaceshipOperator.startPosition = node._lexerRelativeOffset(this.currentIndex);
                            spaceshipOperator.endPosition = node._lexerRelativeOffset(this.currentIndex + 3);
                            spaceshipOperator.parent = this.activeNode;

                            this.runtimeNodes.push(spaceshipOperator);
                            this.lastNode = spaceshipOperator;
                            this.currentIndex += 2;
                            continue;
                        }

                        // <=
                        const lessThanEqual = new LessThanEqualCompOperator();
                        lessThanEqual.isVirtual = false;
                        lessThanEqual.content = '<=';
                        lessThanEqual.startPosition = node._lexerRelativeOffset(this.currentIndex);
                        lessThanEqual.endPosition = node._lexerRelativeOffset(this.currentIndex + 2);
                        lessThanEqual.parent = this.activeNode;

                        this.runtimeNodes.push(lessThanEqual);
                        this.lastNode = lessThanEqual;
                        this.currentIndex += 1;
                        continue;
                    }

                    // <
                    const lessThan = new LessThanCompOperator();
                    lessThan.isVirtual = false;
                    lessThan.content = '<';
                    lessThan.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    lessThan.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                    lessThan.parent = this.activeNode;

                    this.runtimeNodes.push(lessThan);
                    this.lastNode = lessThan;
                    continue;
                }

                if (this.cur == DocumentParser.Punctuation_GreaterThan) {
                    // >=
                    if (this.next == DocumentParser.Punctuation_Equals) {
                        const greaterThanEqual = new GreaterThanCompOperator();
                        greaterThanEqual.isVirtual = false;
                        greaterThanEqual.content = '>=';
                        greaterThanEqual.startPosition = node._lexerRelativeOffset(this.currentIndex);
                        greaterThanEqual.endPosition = node._lexerRelativeOffset(this.currentIndex + 2);
                        greaterThanEqual.parent = this.activeNode;

                        this.runtimeNodes.push(greaterThanEqual);
                        this.lastNode = greaterThanEqual;
                        this.currentIndex += 1;
                        continue;
                    }

                    const greaterThan = new GreaterThanCompOperator();
                    greaterThan.isVirtual = false;
                    greaterThan.content = '>';
                    greaterThan.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    greaterThan.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                    greaterThan.parent = this.activeNode;

                    this.runtimeNodes.push(greaterThan);
                    this.lastNode = greaterThan;
                    continue;
                }

                if (this.cur == DocumentParser.Punctuation_Equals && this.next != DocumentParser.Punctuation_Equals) {
                    const leftAssignment = new LeftAssignmentOperator();
                    leftAssignment.isVirtual = false;
                    leftAssignment.content = '=';
                    leftAssignment.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    leftAssignment.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                    leftAssignment.parent = this.activeNode;

                    this.runtimeNodes.push(leftAssignment);
                    this.lastNode = leftAssignment;
                    continue;
                }

                if (this.cur == DocumentParser.Punctuation_Equals && this.next == DocumentParser.Punctuation_Equals) {
                    let peek: string | null = null;

                    if ((this.currentIndex + 2) < this.inputLen) {
                        peek = this.chars[this.currentIndex + 2];
                    }

                    if (peek == DocumentParser.Punctuation_Equals) {
                        // ===
                        const strictEqual = new StrictEqualCompOperator();
                        strictEqual.isVirtual = false;
                        strictEqual.content = '===';
                        strictEqual.startPosition = node._lexerRelativeOffset(this.currentIndex);
                        strictEqual.endPosition = node._lexerRelativeOffset(this.currentIndex + 3);
                        strictEqual.parent = this.activeNode;

                        this.runtimeNodes.push(strictEqual);
                        this.lastNode = strictEqual;
                        this.currentIndex += 2;
                    } else {
                        // ==
                        const equalOperator = new EqualCompOperator();
                        equalOperator.isVirtual = false;
                        equalOperator.content = '==';
                        equalOperator.startPosition = node._lexerRelativeOffset(this.currentIndex);
                        equalOperator.endPosition = node._lexerRelativeOffset(this.currentIndex + 2);
                        equalOperator.parent = this.activeNode;

                        this.runtimeNodes.push(equalOperator);
                        this.lastNode = equalOperator;
                        this.currentIndex += 1;
                    }

                    continue;
                }

                if (this.cur == DocumentParser.Punctuation_Ampersand) {
                    // &&
                    if (this.next == DocumentParser.Punctuation_Ampersand) {
                        const logicalAnd = new LogicalAndOperator();
                        logicalAnd.isVirtual = false;
                        logicalAnd.content = '&&';
                        logicalAnd.startPosition = node._lexerRelativeOffset(this.currentIndex);
                        logicalAnd.endPosition = node._lexerRelativeOffset(this.currentIndex + 2);
                        logicalAnd.parent = this.activeNode;

                        this.runtimeNodes.push(logicalAnd);
                        this.lastNode = logicalAnd;
                        this.currentIndex += 1;
                        continue;
                    }

                    if (this.next == DocumentParser.Punctuation_Equals) {
                        const concatOperator = new StringConcatenationOperator();
                        concatOperator.isVirtual = false;
                        concatOperator.content = '&=';
                        concatOperator.startPosition = node._lexerRelativeOffset(this.currentIndex);
                        concatOperator.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                        concatOperator.parent = this.activeNode;

                        this.runtimeNodes.push(concatOperator);
                        this.lastNode = concatOperator;
                        continue;
                    }

                    const logicalAnd = new LogicalAndOperator();
                    logicalAnd.isVirtual = false;
                    logicalAnd.content = '&';
                    logicalAnd.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    logicalAnd.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                    logicalAnd.parent = this.activeNode;

                    this.runtimeNodes.push(logicalAnd);
                    this.lastNode = logicalAnd;
                    continue;
                }

                if (this.cur == DocumentParser.Punctuation_Pipe && this.next != DocumentParser.Punctuation_Pipe) {
                    const modifierSeparator = new ModifierSeparator();
                    modifierSeparator.isVirtual = false;
                    modifierSeparator.content = '|';
                    modifierSeparator.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    modifierSeparator.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                    modifierSeparator.parent = this.activeNode;

                    this.runtimeNodes.push(modifierSeparator);
                    this.lastNode = modifierSeparator;
                    this.isParsingModifierName = true;
                    continue;
                }

                if (this.cur == DocumentParser.Punctuation_Pipe && this.next == DocumentParser.Punctuation_Pipe) {
                    // ||
                    const logicalOr = new LogicalOrOperator();
                    logicalOr.isVirtual = false;
                    logicalOr.content = '||';
                    logicalOr.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    logicalOr.endPosition = node._lexerRelativeOffset(this.currentIndex + 2);
                    logicalOr.parent = this.activeNode;

                    this.runtimeNodes.push(logicalOr);
                    this.lastNode = logicalOr;
                    this.currentIndex += 1;
                    continue;
                }

                if (this.cur == DocumentParser.Punctuation_Exclamation) {
                    if (this.next == DocumentParser.Punctuation_Equals) {
                        let peek: string | null = null;

                        if ((this.currentIndex + 2) < this.inputLen) {
                            peek = this.chars[this.currentIndex + 2];
                        }

                        if (peek == DocumentParser.Punctuation_Equals) {
                            // !===
                            const strictNotEqual = new NotStrictEqualCompOperator();
                            strictNotEqual.isVirtual = false;
                            strictNotEqual.content = '!==';
                            strictNotEqual.startPosition = node._lexerRelativeOffset(this.currentIndex);
                            strictNotEqual.endPosition = node._lexerRelativeOffset(this.currentIndex + 3);
                            strictNotEqual.parent = this.activeNode;

                            this.runtimeNodes.push(strictNotEqual);
                            this.lastNode = strictNotEqual;
                            this.currentIndex += 2;
                            continue;
                        }

                        // !=
                        const notEqual = new NotEqualCompOperator();
                        notEqual.isVirtual = false;
                        notEqual.content = '!=';
                        notEqual.startPosition = node._lexerRelativeOffset(this.currentIndex);
                        notEqual.endPosition = node._lexerRelativeOffset(this.currentIndex + 2);
                        notEqual.parent = this.activeNode;

                        this.runtimeNodes.push(notEqual);
                        this.lastNode = notEqual;
                        this.currentIndex += 1;
                        continue;
                    }

                    // !
                    const logicalNot = new LogicalNegationOperator();
                    logicalNot.isVirtual = false;
                    logicalNot.content = '!';
                    logicalNot.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    logicalNot.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                    logicalNot.parent = this.activeNode;

                    this.runtimeNodes.push(logicalNot);
                    this.lastNode = logicalNot;
                    continue;
                }

                if (this.cur == DocumentParser.Punctuation_Question && this.next == DocumentParser.Punctuation_Equals) {
                    // ?=
                    const conditionalFallback = new ConditionalVariableFallbackOperator();
                    conditionalFallback.isVirtual = false;
                    conditionalFallback.content = '?=';
                    conditionalFallback.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    conditionalFallback.endPosition = node._lexerRelativeOffset(this.currentIndex + 2);
                    conditionalFallback.parent = this.activeNode;

                    this.runtimeNodes.push(conditionalFallback);
                    this.lastNode = conditionalFallback;
                    this.currentIndex += 1;
                    continue;
                }

                if (this.cur == DocumentParser.Punctuation_Question && this.next == DocumentParser.Punctuation_Question) {
                    // ??
                    const nullCoalesceOperator = new NullCoalesceOperator();
                    nullCoalesceOperator.isVirtual = false;
                    nullCoalesceOperator.content = '??';
                    nullCoalesceOperator.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    nullCoalesceOperator.endPosition = node._lexerRelativeOffset(this.currentIndex + 2);
                    nullCoalesceOperator.parent = this.activeNode;

                    this.runtimeNodes.push(nullCoalesceOperator);
                    this.lastNode = nullCoalesceOperator;
                    this.currentIndex += 1;
                    continue;
                }

                if (this.cur == DocumentParser.Punctuation_Question && this.next == DocumentParser.Punctuation_Colon) {
                    // ?:
                    const nullCoalesceOperator = new NullCoalesceOperator();
                    nullCoalesceOperator.isVirtual = false;
                    nullCoalesceOperator.content = '?:';
                    nullCoalesceOperator.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    nullCoalesceOperator.endPosition = node._lexerRelativeOffset(this.currentIndex + 2);
                    nullCoalesceOperator.parent = this.activeNode;

                    this.runtimeNodes.push(nullCoalesceOperator);
                    this.lastNode = nullCoalesceOperator;
                    this.currentIndex += 1;
                    continue;
                }

                if (this.cur == DocumentParser.Punctuation_Question) {
                    // ?
                    const ternarySeparator = new InlineTernarySeparator();
                    ternarySeparator.isVirtual = false;
                    ternarySeparator.content = '?';
                    ternarySeparator.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    ternarySeparator.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                    ternarySeparator.parent = this.activeNode;

                    this.runtimeNodes.push(ternarySeparator);
                    this.lastNode = ternarySeparator;
                    continue;
                }

                if (this.cur == DocumentParser.LeftParen) {
                    const logicalGroupBegin = new LogicGroupBegin();
                    logicalGroupBegin.isVirtual = false;
                    logicalGroupBegin.content = '(';
                    logicalGroupBegin.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    logicalGroupBegin.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                    logicalGroupBegin.parent = this.activeNode;

                    this.runtimeNodes.push(logicalGroupBegin);
                    this.lastNode = logicalGroupBegin;
                    continue;
                }

                if (this.cur == DocumentParser.RightParent) {
                    const logicalGroupEnd = new LogicGroupEnd();
                    logicalGroupEnd.isVirtual = false;
                    logicalGroupEnd.content = ')';
                    logicalGroupEnd.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    logicalGroupEnd.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                    logicalGroupEnd.parent = this.activeNode;

                    this.runtimeNodes.push(logicalGroupEnd);
                    this.lastNode = logicalGroupEnd;
                    continue;
                }

                if (this.cur == DocumentParser.Punctuation_Colon) {
                    if (this.runtimeNodes.length > 0) {
                        const lastItem = this.runtimeNodes[this.runtimeNodes.length - 1];

                        if (lastItem instanceof ModifierNameNode) {
                            const modifierValueSeparator = new ModifierValueSeparator();
                            modifierValueSeparator.isVirtual = false;
                            modifierValueSeparator.content = ':';
                            modifierValueSeparator.startPosition = node._lexerRelativeOffset(this.currentIndex);
                            modifierValueSeparator.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                            modifierValueSeparator.parent = this.activeNode;

                            this.runtimeNodes.push(modifierValueSeparator);

                            if (this.isInModifierParameterValue == false) {
                                this.isInModifierParameterValue = true;
                            } else {
                                this.isInModifierParameterValue = false;
                            }
                            continue;
                        }
                    }

                    const branchSeparator = new InlineBranchSeparator();
                    branchSeparator.isVirtual = false;
                    branchSeparator.content = ':';
                    branchSeparator.startPosition = node._lexerRelativeOffset(this.currentIndex);
                    branchSeparator.endPosition = node._lexerRelativeOffset(this.currentIndex + 1);
                    branchSeparator.parent = this.activeNode;

                    this.runtimeNodes.push(branchSeparator);
                    this.lastNode = branchSeparator;
                    this.isParsingModifierName = false;
                    continue;
                }
            }

            if (addCurrent) {
                this.appendContent(this.cur);
            }
        }

        const lastIndex = this.runtimeNodes.length - 1;
        for (let i = 0; i < this.runtimeNodes.length; i++) {
            let prev: AbstractNode | null = null,
                next: AbstractNode | null = null;

            if (i > 0) {
                prev = this.runtimeNodes[i - 1];
            }

            if (i != lastIndex) {
                next = this.runtimeNodes[i + 1];
            }

            const thisNode = this.runtimeNodes[i];

            thisNode.prev = prev;
            thisNode.next = next;
        }

        return this.runtimeNodes;
    }
}