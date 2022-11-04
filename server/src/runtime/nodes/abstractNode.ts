import { Position, Range } from './position';
import { AntlersError } from '../errors/antlersError';
import { DocumentParser } from '../parser/documentParser';
import { DocumentRange } from '../document/documentRange';
import { PositionContext } from '../document/contexts/positionContext';
import { NodeVirtualModifiers } from './antlersVirtualStructures/nodeVirtualModifiers';
import { IScopeVariable } from '../../antlers/scope/types';
import { Scope } from '../../antlers/scope/scope';
import { IRuntimeVariableType } from '../../antlers/tagManager';
import { IModifier } from '../../antlers/modifierTypes';
import { filterStructuralAntlersNodes } from '../document/scanners/nodeFilters';
import { StringUtilities } from '../utilities/stringUtilities';
import { NodeVirtualHierarchy } from './antlersVirtualStructures/nodeVirtualHierarchy';
import { TagIdentifier } from './tagIdentifier';
import { ConditionPairAnalyzer } from '../analyzers/conditionPairAnalyzer';
import { replaceAllInString } from '../../utils/strings';
import { AntlersDocument } from '../document/antlersDocument';
import { getId } from '../../utils/simpleIds';
import { TagPairAnalyzer } from '../analyzers/tagPairAnalyzer';

function newRefId() {
    return replaceAllInString(getId(), '-', '_');
}

/* eslint-disable @typescript-eslint/no-empty-interface */
interface ArithmeticNodeContract {

}

/* eslint-disable @typescript-eslint/no-empty-interface */
interface OperatorNodeContract {

}

/* eslint-disable @typescript-eslint/no-empty-interface */
interface AssignmentOperatorNodeContract {

}

export interface INodeInterpolation {
    content: string,
    parseContent: string,
    varContent: string,
    startOffset: number,
    endOffset: number
}

export interface StructuralFragment {
    start: FragmentNode,
    end: FragmentNode
}

export enum FragmentPosition {
    IsDynamicFragmentName,
    InsideFragmentParameter,
    InsideFragment,
    Unresolved
}

export interface ChildDocument {
    renderNodes: AbstractNode[],
    content: string,
    document: AntlersDocument
}

export class FragmentNode {
    public startPosition: Position | null = null;
    public endPosition: Position | null = null;
    public index = 0;
    public embeddedIndex = 0;
    public refId: string | null = null;
    public parameters: FragmentParameterNode[] = [];
    public isSelfClosing = false;
    public isClosingFragment = false;
    public name = '';
    public containsStructures = false;

    constructor() {
        this.refId = newRefId();
    }
}

export class FragmentParameterNode {
    public startPosition: Position | null = null;
    public endPosition: Position | null = null;
    public content = '';
    public name = '';
}

function cleanNodes(nodes: AbstractNode[]): AbstractNode[] {
    const cleaned: AbstractNode[] = [],
        ids: string[] = [];

    for (let i = 0; i < nodes.length; i++) {
        const child = nodes[i],
            refId = child.refId as string;

        if (ids.includes(refId)) { break; }
        cleaned.push(child);
        ids.push(refId);
    }

    return cleaned;
}

export class AbstractNode {
    public refId: string | null = null;
    public index = 0;
    public parent: AbstractNode | null = null;
    public content = '';
    public rawLexContent = '';
    public sourceContent = '';
    public startPosition: Position | null = null;
    public endPosition: Position | null = null;
    public modifierChain: ModifierChainNode | null = null;
    public originalAbstractNode: AbstractNode | null = null;

    private positionContexts: PositionContext[] = [];
    private addedContexts: Map<string, boolean> = new Map();

    public fragment: FragmentNode | null = null;
    public fragmentParameter: FragmentParameterNode | null = null;
    public fragmentPosition: FragmentPosition = FragmentPosition.Unresolved;
    public containsAnyFragments = false;
    public containsChildStructures = false;

    public isInScriptTag = false;
    public isInStyleTag = false;

    isEmbedded(): boolean {
        return this.isInScriptTag || this.isInStyleTag;
    }

    /* Start: Internal Parser Variables and APIs. */
    public isVirtual = true;
    public isPartOfMethodChain = false;
    public isVirtualGroupMember = false;
    public isVirtualGroupOperatorResolve = false;
    public isSwitchGroupMember = false;
    public isListGroupMember = false;
    public producesVirtualStatementTerminator = false;
    public convertedToOperator = false;
    public scopeVariable: IScopeVariable | null = null;
    public currentScope: Scope | null = null;
    public manifestType = '';
    public scopeName: string | null = null;
    public sourceType = '';
    public runtimeType: IRuntimeVariableType | null = null;

    public readonly modifiers: NodeVirtualModifiers = new NodeVirtualModifiers(this);
    /* End: Internal Parser Variables and APIs. */

    public prev: AbstractNode | null = null;
    public next: AbstractNode | null = null;

    public methodTarget: MethodInvocationNode | null = null;
    public libraryTarget: LibraryInvocationConstruct | null = null;

    private antlersErrors: AntlersError[] = [];

    protected parser: DocumentParser | null = null;

    getContexts(): PositionContext[] {
        return this.positionContexts;
    }

    addContext(context: PositionContext) {
        if (this.addedContexts.has(context.refId) == false) {
            this.addedContexts.set(context.refId, true);
            this.positionContexts.push(context);
        }
    }

    getRange(): DocumentRange {
        if (this.originalAbstractNode != null) {
            return this.originalAbstractNode.getRange();
        }

        if (this.startPosition == null || this.endPosition == null) {
            return DocumentRange.Empty;
        }

        const range = new DocumentRange();
        range.start = this.startPosition;
        range.end = this.endPosition;

        return range;
    }

    withParser(parser: DocumentParser) {
        this.parser = parser;
    }

    getParser() {
        return this.parser;
    }

    pushError(error: AntlersError) {
        if (this.parent != null) {
            this.parent.pushError(error);
        }

        this.antlersErrors.push(error);

        if (this.parent == null) {
            if (this.parser != null) {
                this.parser.pushError(error);
            }
        }
    }

    mergeErrors(errors: AntlersError[]) {
        errors.forEach((error) => {
            if (error.node == null) {
                error.node = this;
            }

            this.antlersErrors.push(error);
        });
    }

    getErrors() {
        return this.antlersErrors;
    }

    constructor() {
        this.refId = newRefId();
    }

    innerContent() {
        return this.content;
    }

    rawContent() {
        return this.content;
    }
}

export class ExecutionBranch extends AbstractNode {
    public head: AntlersNode | null = null;
    public tail: AntlersNode | null = null;
    public nodes: AbstractNode[] = [];
    public documentText = '';
    public childDocument: ChildDocument | null = null;

    getImmediateChildren(): AbstractNode[] {
        if (this.head == null) { return []; }

        return this.head.getImmediateChildren();
    }
}

export class ConditionNode extends AbstractNode {
    public logicBranches: ExecutionBranch[] = [];
    public chain: number[] = [];
    public nodeContent = '';
    public fragment: FragmentNode | null = null;
    public fragmentParameter: FragmentParameterNode | null = null;
    public fragmentPosition: FragmentPosition = FragmentPosition.Unresolved;
    public containsAnyFragments = false;
    public containsChildStructures = false;
}

export class AntlersNode extends AbstractNode {
    public isNodeAbanonded = false;
    public isComment = false;
    public isTagNode = false;
    public isConditionNode = false;
    public runtimeContent = "";
    public name: TagIdentifier | null = null;
    public pathReference: VariableReference | null = null;
    public isClosingTag = false;
    public isInterpolationNode = false;
    public isOpenedBy: AntlersNode | null = null;
    public isClosedBy: AntlersNode | null = null;
    public isSelfClosing = false;
    public children: AbstractNode[] = [];
    public runtimeNodes: AbstractNode[] = [];
    public parsedRuntimeNodes: AbstractNode[] = [];
    public hasParsedRuntimeNodes = false;
    public parameters: ParameterNode[] = [];
    public hasParameters = false;
    public contentOffset: Position | null = null;
    private cachedContent: string | null = null;
    private cachedInnerContent: string | null = null;
    public hasRecursiveNode = false;
    public recursiveReference: RecursiveNode | null = null;
    public rawStart = "";
    public rawEnd = "";
    public originalNode: AntlersNode | null = null;
    public interpolationRegions: Map<string, INodeInterpolation> = new Map();
    public processedInterpolationRegions: Map<string, AbstractNode[]> = new Map();
    public hasProcessedInterpolationRegions = false;
    public ref = 0;
    private contentStartRelativeIndex: number | null = null;
    public antlersNodeIndex = 0;
    public nameStartsOn: Position | null = null;
    public nameEndsOn: Position | null = null;
    public nameMethodPartStartsOn: Position | null = null;
    public documentText = '';
    public nodeContent = '';
    public childDocument: ChildDocument | null = null;
    public readonly structure: NodeVirtualHierarchy = new NodeVirtualHierarchy(this);
    public isInlineAntlers = false;
    /** Start: Internal Parser State Variables */
    public mustClose = false;
    public reference: any | null = null;
    public _conditionParserAbandonPairing = false;
    public _isEndVirtual = false;

    getOriginalContent() {
        if (this.startPosition == null || this.endPosition == null || this.parser == null) {
            return '';
        }

        if (this.isClosedBy != null) {
            if (this.isClosedBy.startPosition == null || this.isClosedBy.endPosition == null) {
                return '';
            }

            return this.parser.getText(
                this.startPosition.index,
                this.isClosedBy.endPosition.index + 1
            );
        }

        return this.parser.getText(
            this.startPosition.index, this.endPosition.index + 1
        );
    }

    getNodeDocumentText() {
        if (this.startPosition == null || this.endPosition == null || this.parser == null) {
            return '';
        }

        return this.parser.getText(this.startPosition.index, this.endPosition.index + 1);
    }

    getImmediateChildren(): AbstractNode[] {
        const immediateChildren: AbstractNode[] = [];

        for (let i = 0; i < this.children.length; i++) {
            const node = this.children[i];

            if (node.parent == this) {
                if (node == this.isClosedBy) { break; }
                immediateChildren.push(node);
            }
        }

        return cleanNodes(immediateChildren);
    }

    getChildren(): AbstractNode[] {
        if (this.isClosedBy == null) { return []; }

        const newChildren: AbstractNode[] = [];

        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];

            if (child instanceof AntlersNode && child.refId == this.isClosedBy.refId) { break; }
            newChildren.push(child);
        }

        return newChildren;
    }

    getInnerDocumentText() {
        if (this.startPosition == null || this.endPosition == null || this.parser == null) {
            return '';
        }

        if (this.isClosedBy == null) {
            return this.getNodeDocumentText();
        }

        const closeStart = this.isClosedBy.startPosition;

        if (closeStart == null) {
            return '';
        }

        return this.parser.getText(this.endPosition.index + 1, closeStart.index);
    }

    nodeAtIndex(index: number): AbstractNode | null {
        if (this.runtimeNodes.length == 0) {
            return null;
        }

        for (let i = 0; i < this.runtimeNodes.length; i++) {
            if (this.runtimeNodes[i].index == index) {
                return this.runtimeNodes[i];
            }
        }

        return null;
    }

    getDepthCount(): number {
        if (this.parent == null) {
            return 1;
        }

        let parent: AbstractNode | null = this.parent,
            depth = 1;

        while (parent != null) {
            depth += 1;

            if (parent.parent === parent) {
                parent = null;
                break;
            }

            parent = parent.parent;
        }

        return depth;
    }

    isEmpty() {
        return this.content.trim().length == 0;
    }

    nameMatches(content: string): boolean {
        if (this.name == null) {
            return false;
        }

        return this.name.content == content;
    }

    copyBasicDetails() {
        return this.copyBasicDetailsTo(new AntlersNode());
    }

    copyBasicDetailsTo(instance: AntlersNode) {
        instance.refId = this.refId;
        instance.isComment = this.isComment;
        instance.isTagNode = this.isTagNode;
        instance.children = this.children;
        instance.parent = this.parent;
        instance.parameters = this.parameters;
        instance.isClosingTag = this.isClosingTag;
        instance.rawStart = this.rawStart;
        instance.rawEnd = this.rawEnd;
        instance.startPosition = this.startPosition;
        instance.endPosition = this.endPosition;

        instance.originalAbstractNode = this;
        instance.containsAnyFragments = this.containsAnyFragments;
        instance.containsChildStructures = this.containsChildStructures;
        instance.isInScriptTag = this.isInScriptTag;
        instance.isInStyleTag = this.isInStyleTag;

        return instance;
    }

    id() {
        return this.refId as string;
    }

    innerContent() {
        if (this.cachedInnerContent == null) {
            this.cachedInnerContent = this.content.replace('"', '\\"');
        }

        return this.cachedInnerContent;
    }

    resetContentCache() {
        this.cachedContent = null;
        this.cachedInnerContent = null;
    }

    hasMethodPart(): boolean {
        if (this.name == null) {
            return false;
        }

        const methodPart = this.name.getMethodName();

        if (methodPart != null) {
            return true;
        }

        return false;
    }

    runtimeName(): string {
        if (this.name == null) {
            return "";
        }

        return this.name.getCompoundTagName();
    }

    getTagName(): string {
        if (this.name == null) {
            return "";
        }

        return this.name.name;
    }

    getNameContent() {
        if (this.name == null) {
            return "";
        }

        return this.name.content;
    }

    getMethodNameValue(): string {
        if (this.name == null) {
            return "";
        }

        const methodPart = this.name.getMethodName();

        if (methodPart != null) {
            return methodPart as string;
        }

        return "";
    }

    methodIsEmptyOrMatches(testValue: string): boolean {
        return this.getMethodNameValue() == testValue;
    }

    hasParameter(name: string): boolean {
        const paramMatch = this.findParameter(name);

        return paramMatch != null;
    }

    /**
     * Tests if the AntlersNode contains a parameter with the given value.
     *
     * @param name
     * @param expectedValue
     * @returns
     */
    hasParameterWithValue(name: string, expectedValue: string): boolean {
        const paramMatch = this.findParameter(name);

        if (paramMatch == null) {
            return false;
        }

        return paramMatch.value == expectedValue;
    }

    findParameterValue(name: string, defaultValue: string): string {
        const paramMatch = this.findParameter(name);

        if (paramMatch == null) {
            return defaultValue;
        }

        return paramMatch.value;
    }


    findParameterValueOrNull(name: string): string | null {
        const paramMatch = this.findParameter(name);

        if (paramMatch == null) {
            return null;
        }

        return paramMatch.value;
    }

    findParameter(name: string): ParameterNode | null {
        if (this.parameters.length == 0) {
            return null;
        }

        for (let i = 0; i < this.parameters.length; i++) {
            if (this.parameters[i].name == name) {
                return this.parameters[i];
            }
        }

        return null;
    }

    findAnyParameter(names: string[]): ParameterNode | null {
        for (let i = 0; i < names.length; i++) {
            const tempValue = this.findParameter(names[i]);

            if (tempValue != null) {
                return tempValue;
            }
        }

        return null;
    }

    getContentRelativeStartIndex(): number {
        if (this.contentStartRelativeIndex == null) {
            const chars = this.content.split("");

            for (let i = 0; i < chars.length; i++) {
                if (!StringUtilities.ctypeSpace(chars[i])) {
                    this.contentStartRelativeIndex = i;
                    break;
                }
            }

            if (this.contentStartRelativeIndex == null) {
                this.contentStartRelativeIndex = chars.length;
            }

            this.contentStartRelativeIndex += this.rawStart.length;
        }

        return this.contentStartRelativeIndex as number;
    }

    getContentAfterName() {
        let start = 0;

        if (this.nameEndsOn != null) {
            start = this.nameEndsOn.char - this.rawStart.length - 1;
        }

        return this.content.substring(start);
    }

    getContent() {
        if (this.cachedContent == null) {
            if (this.isComment) {
                this.cachedContent = this.content;
                this.contentOffset = this.startPosition;
            } else {
                if (this.isTagNode) {
                    let contentToAnalyze = this.content;

                    contentToAnalyze = StringUtilities.trimLeft(contentToAnalyze);

                    let compoundNameLen = 0;

                    if (this.name != null) {
                        compoundNameLen = this.name.compound.length;
                    }

                    if (this.parameters.length > 0) {
                        let startPosIndex = 0;
                        const firstParam = this.parameters[0];

                        if (firstParam.startPosition != null) {
                            startPosIndex = firstParam.startPosition.index - 1;
                        }

                        const leadContent = contentToAnalyze,
                            contentWithoutSpace = leadContent.trimLeft(),
                            leadingWsCount = leadContent.length - contentWithoutSpace.length,
                            leadNameLen = compoundNameLen;

                        // Get the content before the first parameter.
                        contentToAnalyze = contentToAnalyze.substr(0, startPosIndex);
                    }

                    const contentWithoutSpace = contentToAnalyze.trimLeft(),
                        leadingWsCount =
                            contentToAnalyze.length - contentWithoutSpace.length,
                        leadOffset = compoundNameLen + leadingWsCount + 2;

                    if (this.parser != null) {
                        let startPosOffset = 0;

                        if (this.startPosition != null) {
                            startPosOffset = this.startPosition.offset;
                        }

                        this.contentOffset ==
                            this.parser.positionFromOffset(startPosOffset + leadOffset, 0);
                    }

                    if (this.name != null) {
                        if (
                            this.name.name == "if" ||
                            this.name.name == "elseif" ||
                            this.name.name == "unless" ||
                            this.name.name == "elseunless"
                        ) {
                            contentToAnalyze = " " + contentToAnalyze.trimLeft();
                            this.cachedContent = contentToAnalyze.substr(
                                this.name.compound.length + 1
                            );
                        } else {
                            this.cachedContent = contentToAnalyze;
                        }
                    } else {
                        this.cachedContent = contentToAnalyze;
                    }
                } else {
                    if (this.parameters.length > 0) {
                        const firstParam = this.parameters[0];

                        let startPosIndex = 0;

                        if (firstParam.startPosition != null) {
                            startPosIndex = firstParam.startPosition.index - 1;
                        }

                        this.contentOffset = this.startPosition;
                        this.cachedContent = this.content.substr(0, startPosIndex);
                    } else {
                        this.contentOffset = this.startPosition;
                        this.cachedContent = this.content;
                    }
                }
            }
        }
        return this.cachedContent;
    }

    relativePositionFromOffset(offset: number, index: number): Position | null {
        if (this.parser == null) {
            return null;
        }

        return this.parser.positionFromOffset(
            (this.contentOffset?.offset ?? 0) + offset,
            index
        );
    }

    getInterpolationNode(varName: string): AntlersNode | null {
        if (this.processedInterpolationRegions.has(varName)) {
            const refRegion = this.processedInterpolationRegions.get(
                varName
            ) as AbstractNode[];

            if (refRegion.length > 0 && refRegion[0] instanceof AntlersNode) {
                return refRegion[0];
            }
        }

        return null;
    }

    _lexerRelativeOffset(offset: number, index: number | null = null) {
        let indexToUse = offset;

        if (index != null) {
            indexToUse = index;
        }

        if (this.parser == null) {
            const position = new Position();
            position.index = offset;
            position.offset = offset;

            return position;
        }

        let relativeIndex = offset + this.rawStart.length + (this.startPosition?.index ?? 0);

        if (this.isTagNode && this.nameStartsOn != null) {
            relativeIndex = this.nameStartsOn.index + offset;

            if (!ConditionPairAnalyzer.isConditionalStructure(this)) {
                relativeIndex -= this.rawStart.length;
            }
        }

        const resolvedOffset = this.parser.positionFromOffset(
            relativeIndex,
            relativeIndex,
            true
        );

        return resolvedOffset;
    }

    relativeOffset(offset: number, index: number | null = null) {
        let indexToUse = offset;

        if (index != null) {
            indexToUse = index;
        }

        if (this.parser == null) {
            const position = new Position();
            position.index = offset;
            position.offset = offset;

            return position;
        }

        const relativeIndex = offset + this.rawStart.length + (this.startPosition?.index ?? 0);

        const resolvedOffset = this.parser.positionFromOffset(
            relativeIndex,
            relativeIndex,
            true
        );

        return resolvedOffset;
    }

    isPaired() {
        if (this.isClosingTag && this.isSelfClosing == false && this.isOpenedBy != null) {
            return true;
        }

        if (this.isClosedBy == null) {
            return false;
        }

        if (this.isSelfClosing) {
            return false;
        }

        return true;
    }

    getFinalClosingTag(): AntlersNode {
        if (this.isClosedBy == null) { return this; }

        return this.isClosedBy.getFinalClosingTag();
    }

    rawContent(): string {
        return this.rawStart + this.content + this.rawEnd;
    }

    getTrueRuntimeNodes(): AbstractNode[] {
        if (this.originalNode != null && this.originalNode != this) {
            return this.originalNode.getTrueRuntimeNodes();
        }

        return this.runtimeNodes;
    }

    getTrueRawContent(): string {
        if (this.originalNode != null && this.originalNode != this) {
            return this.originalNode.getTrueRawContent();
        }

        return this.rawContent();
    }

    getTrueNode(): AntlersNode {
        if (this.originalNode != null && this.originalNode != this) {
            return this.originalNode.getTrueNode();
        }

        return this;
    }

    getStructuralChildren(): AntlersNode[] {
        if (this.isClosedBy != null) {
            // Nodes with children will always have the
            // closing node added as the last child.
            return filterStructuralAntlersNodes(this.children.slice(0, -1));
        }

        return filterStructuralAntlersNodes(this.children);
    }

    findParentOfType(types: string[]): AntlersNode | null {
        if (this.parent == null) { return null; }

        if (this.parent instanceof AntlersNode) {
            if (this.parent.name != null && types.includes(this.parent.getTagName())) {
                return this.parent;
            }

            return this.parent.findParentOfType(types);
        }

        return null;
    }
}

export class ParserFailNode extends AntlersNode {
    static makeWithStartPosition(startPosition: Position) {
        const newNode = new ParserFailNode();
        newNode.startPosition = startPosition;
        newNode.endPosition = startPosition;

        return newNode;
    }
}

export class AntlersParserFailNode extends ParserFailNode {

}

export class RecursiveNode extends AntlersNode {
    public recursiveParent: AntlersNode | null = null;
    public isNestedRecursive = false;
}

export class PhpExecutionNode extends AntlersNode {
    public isEchoNode = false;
}

export class CommentParserFailNode extends ParserFailNode {

}

export class PhpParserFailNode extends ParserFailNode { }

export class EscapedContentNode extends AntlersNode {
    public isNoParseRegion = false;
}

export class ParameterNode extends AbstractNode {
    public modifier: IModifier | null = null;
    public isModifierParameter = false;
    public nameDelimiter:string|null = '"';
    public isVariableReference = false;
    public name = "";
    public value = "";

    public interpolations: string[] = [];
    public parent: AntlersNode | null = null;

    public blockPosition: Range | null = null;
    public namePosition: Range | null = null;
    public valuePosition: Range | null = null;

    public hasValidValueDelimiter: boolean = true;

    containsSimpleValue() {
        return (
            this.hasInterpolations() == false && this.isVariableReference == false
        );
    }

    hasInterpolations() {
        return this.interpolations.length > 0;
    }

    getArrayValue(): string[] {
        return this.value.split("|");
    }

    getValue() {
        return this.value;
    }
}

export class ModifierChainNode {
    public modifierTarget: AbstractNode | null = null;
    public modifierChain: ModifierNode[] = [];
    public startPosition: Position | null = null;
    public endPosition: Position | null = null;

    public lastManifestedModifier: ModifierNode | null = null;
    public lastModifier: IModifier | null = null;

    updateValues() {
        if (this.modifierChain.length == 0) {
            this.startPosition = null;
            this.endPosition = null;
        } else {
            const firstModifier = this.modifierChain[0],
                lastModifier = this.modifierChain[this.modifierChain.length - 1];
            this.startPosition = firstModifier.startPosition;
            this.endPosition = lastModifier.endPosition;
        }
    }
}

export class ModifierNode extends AbstractNode {

    public modifier: IModifier | null = null;

    public methodStyleArguments: ArgumentGroup | null = null;
    public nameNode: ModifierNameNode | null = null;
    public name = '';
    public valueNodes: AbstractNode[] = [];
    public parameters: ModifierParameterNode[] = [];

    getParameterValues() {
        const values: string[] = [];

        this.parameters.forEach((param) => {
            values.push(param.value);
        });

        return values;
    }
}

export class ValueDirectionNode extends AbstractNode {
    public order = 0;
    public name: AbstractNode | null = null;
    public directionNode: AbstractNode | null = null;
}

export class ModifierParameterNode extends AbstractNode {
    public value = '';
}

export class FalseConstant extends AbstractNode { }
export class NullConstant extends AbstractNode { }
export class TrueConstant extends AbstractNode { }

export class AdditionOperator extends AbstractNode implements OperatorNodeContract, ArithmeticNodeContract { }
export class DivisionOperator extends AbstractNode implements OperatorNodeContract, ArithmeticNodeContract {

}

export class ExponentiationOperator extends AbstractNode implements OperatorNodeContract, ArithmeticNodeContract {

}
export class FactorialOperator extends AbstractNode implements ArithmeticNodeContract {
    public repeat = 1;
}

export class ModulusOperator extends AbstractNode implements OperatorNodeContract, ArithmeticNodeContract {

}

export class MultiplicationOperator extends AbstractNode implements OperatorNodeContract, ArithmeticNodeContract {

}
export class SubtractionOperator extends AbstractNode implements OperatorNodeContract, ArithmeticNodeContract {

}
export class AdditionAssignmentOperator extends AbstractNode implements AssignmentOperatorNodeContract {

}

export class DivisionAssignmentOperator extends AbstractNode implements AssignmentOperatorNodeContract {

}

export class LeftAssignmentOperator extends AbstractNode implements AssignmentOperatorNodeContract {

}
export class ModulusAssignmentOperator extends AbstractNode implements AssignmentOperatorNodeContract {

}

export class MultiplicationAssignmentOperator extends AbstractNode implements AssignmentOperatorNodeContract {

}

export class SubtractionAssignmentOperator extends AbstractNode implements AssignmentOperatorNodeContract {

}


export class EqualCompOperator extends AbstractNode implements OperatorNodeContract {

}
export class GreaterThanCompOperator extends AbstractNode implements OperatorNodeContract {

}

export class GreaterThanEqualCompOperator extends AbstractNode implements OperatorNodeContract {

}
export class LessThanCompOperator extends AbstractNode implements OperatorNodeContract {

}

export class LessThanEqualCompOperator extends AbstractNode implements OperatorNodeContract {

}
export class NotEqualCompOperator extends AbstractNode implements OperatorNodeContract {

}

export class NotStrictEqualCompOperator extends AbstractNode implements OperatorNodeContract {

}
export class SpaceshipCompOperator extends AbstractNode implements OperatorNodeContract {

}

export class StrictEqualCompOperator extends AbstractNode implements OperatorNodeContract {

}

export class ConditionalVariableFallbackOperator extends AbstractNode implements OperatorNodeContract {

}
export class LanguageOperatorConstruct extends AbstractNode implements OperatorNodeContract {

}

export class StatementSeparatorNode extends AbstractNode {

}
export class DirectionGroup extends AbstractNode {
    public orderClauses: ValueDirectionNode[] = [];
}

export class InlineBranchSeparator extends AbstractNode {

}
export class ModifierSeparator extends AbstractNode {

}
export class NullCoalescenceGroup extends AbstractNode {
    public left: AbstractNode | null = null;
    public right: AbstractNode | null = null;
}
export class ModifierValueSeparator extends AbstractNode {
    public isTenaryBranchSeparator = false;
}
export class InlineTernarySeparator extends AbstractNode {

}
export class LogicalAndOperator extends AbstractNode implements OperatorNodeContract {

}

export class LogicalNegationOperator extends AbstractNode implements OperatorNodeContract {

}
export class LogicalOrOperator extends AbstractNode implements OperatorNodeContract {

}
export class LogicalXorOperator extends AbstractNode implements OperatorNodeContract {

}

export class NullCoalesceOperator extends AbstractNode implements OperatorNodeContract {

}

export class ScopeAssignmentOperator extends AbstractNode {

}

export class StringConcatenationOperator extends AbstractNode implements OperatorNodeContract {

}
export class LogicGroupEnd extends AbstractNode {

}
export class LogicGroupBegin extends AbstractNode {

}
export class ListValueNode extends AbstractNode {
    public values: AbstractNode[] = [];
    public isNamedNode = false;
    public parsedName: StringValueNode | null = null;
}
export class LogicGroup extends AbstractNode {
    public start: LogicGroupBegin | null = null;
    public end: LogicGroupEnd | null = null;
    public nodes: AbstractNode[] = [];

    public scopeOperator: ScopeAssignmentOperator | null = null;
}

export class SwitchCase extends AbstractNode {
    public condition: LogicGroup | null = null;
    public expression: LogicGroup | null = null;
}
export class SwitchGroup extends AbstractNode {
    public cases: SwitchCase[] = [];
}
export class ConditionalFallbackGroup extends AbstractNode {
    public left: AbstractNode | null = null;
    public right: AbstractNode | null = null;
}
export class ArrayNode extends AbstractNode {
    public nodes: (NameValueNode | ArrayNode)[] = [];
}
export class TernaryCondition extends AbstractNode {
    public head: AbstractNode | null = null;
    public truthBranch: AbstractNode | null = null;
    public falseBranch: AbstractNode | null = null;
}


export class ArgSeparator extends AbstractNode {

}
export class SemanticGroup extends AbstractNode {
    public nodes: AbstractNode[] = [];
    public separatorToken: StatementSeparatorNode | null = null;
}

export class ScopedLogicGroup extends LogicGroup {
    public scope: VariableNode | null = null;

    extract() {
        let scopeName: string | null = null;

        if (this.scope != null) {
            scopeName = this.scope.name;
        }

        const sematicWrapper = this.nodes[0] as SemanticGroup;

        return [
            scopeName,
            sematicWrapper.nodes
        ];
    }
}

export class AliasedScopeLogicGroup extends ScopedLogicGroup {
    public alias: StringValueNode | null = null;
}

export class ArgumentGroup extends AbstractNode {
    public args: AbstractNode[] = [];
    public hasNamedArguments = false;
    public numberOfNamedArguments = 0;
}

export class TupleListStart extends AbstractNode {

}

export class TupleList extends AbstractNode {

}

export class TupleScopedLogicGroup extends LogicGroup {
    public target: any = null;
    public name: any = null;
    public item1: any = null;
    public item2: any = null;
    public isDynamicNames = false;
}

export class LibraryInvocationConstruct extends AbstractNode {
    public libraryName = '';
    public methodName = '';
    public arguments: ArgumentGroup | null = null;
}

export class LiteralNode extends AbstractNode {
    public sourceContent = '';
}

export class MethodInvocationNode extends AbstractNode {
    public method: VariableNode | null = null;
    public args: ArgumentGroup | null = null;
}


export class ModifierNameNode extends AbstractNode {
    public name = '';
}

export class ModifierValueNode extends AbstractNode {
    public value = '';
    public name = '';
}

export class NamedArgumentNode extends AbstractNode {
    public name: AbstractNode | null = null;
    public value: AbstractNode | null = null;
}

export class NameValueNode extends AbstractNode {
    public name: AbstractNode | null = null;
    public value: AbstractNode | null = null;
}


export class NumberNode extends AbstractNode {
    public value: number | null = null;
}

export class StringValueNode extends AbstractNode {
    public value = '';
    public sourceTerminator = '';
    public sourceContent = '';
}

export class VariableNode extends AbstractNode {
    public name = '';
    public mergeRefName = '';
    public variableReference: VariableReference | null = null;
    public interpolationNodes: AbstractNode[] = [];
    public isInterpolationReference = false;
}


export class AccessorNode extends AbstractNode {
    public name = '';
}

export class PathNode extends AbstractNode {
    public delimiter = '';
    public name = '';
    public isStringVar = false;
    public isFinal = false;
}

export class VariableReference {
    public originalContent = '';
    public normalizedReference = '';
    public isStrictTagReference = false;
    public isStrictVariableReference = false;
    public isExplicitVariableReference = false;
    public isVariableVariable = false;
    public pathParts: PathNode[] | VariableReference[] = [];
    public isFinal = false;

    /** Start: Internal Parser State Variables */
    public _isFromEmptyFailState = false;
    /** End: Internal Parser State Variables */

    clone() {
        const reference = new VariableReference();
        reference.originalContent = this.originalContent;
        reference.normalizedReference = this.normalizedReference;
        reference.isStrictVariableReference = this.isStrictVariableReference;
        reference.isExplicitVariableReference = this.isExplicitVariableReference;
        reference.pathParts = this.pathParts;
        reference.isFinal = this.isFinal;

        return reference;
    }

    implodePaths() {
        const stringParts: string[] = [];

        this.pathParts.forEach((part: any) => {
            if (part instanceof PathNode) {
                stringParts.push(part.name);
            } else if (part instanceof VariableReference) {
                stringParts.push(part.implodePaths());
            }
        });

        return stringParts.join('.');
    }
}

export class StaticTracedAssignment {
    public target: AbstractNode;
    public value: AbstractNode;
    public operator: AbstractNode;

    constructor(target: AbstractNode, value: AbstractNode, operator: AbstractNode) {
        this.target = target;
        this.value = value;
        this.operator = operator;
    }
}