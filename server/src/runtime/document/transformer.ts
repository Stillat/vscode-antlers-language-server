import { AsyncHTMLFormatter, AsyncPHPFormatter, HTMLFormatter, PHPFormatter, YAMLFormatter } from '../../formatting/formatters.js';
import { replaceAllInString } from '../../utils/strings.js';
import { ConditionPairAnalyzer } from '../analyzers/conditionPairAnalyzer.js';
import { AbstractNode, AntlersNode, ConditionNode, EscapedContentNode, ExecutionBranch, FragmentPosition, LiteralNode, StructuralFragment } from '../nodes/abstractNode.js';
import { StringUtilities } from '../utilities/stringUtilities.js';
import { AntlersDocument } from './antlersDocument.js';
import { AsyncInlineFormatter, InlineFormatter } from './inlineFormatter.js';
import { CommentPrinter } from './printers/commentPrinter.js';
import { IndentLevel } from './printers/indentLevel.js';
import { NodePrinter } from './printers/nodePrinter.js';
import { TransformOptions } from './transformOptions.js';

interface TransformedLogicBranch {
    branch: ExecutionBranch,
    slug: string,
    doc: string,
    pairOpen: string,
    pairClose: string,
    isFirst: boolean,
    isLast: boolean,
    virtualOpen: string,
    virtualClose: string,
    virtualSlug: string,
    virtualBreakOpen: string,
    virtualBreakClose: string
}

interface EmbeddedDocument {
    slug: string,
    content: string,
    isScript: boolean
}

interface TransformedCondition {
    condition: ConditionNode,
    structures: TransformedLogicBranch[],
    pairOpen: string,
    pairClose: string
}

interface VirtualBlockStructure {
    node: AbstractNode,
    pairOpen: string,
    pairClose: string,
    virtualElement: string
}

interface TransformedTagPair {
    innerDoc: string,
    slug: string,
    tag: AntlersNode,
    virtualElementSlug: string,
    isInline: boolean
}

export class Transformer {
    private doc: AntlersDocument;
    private formatIgnoreStart = 'format-ignore-start';
    private formatIgnoreEnd = 'format-ignore-end';
    private htmlFormatter: HTMLFormatter | null = null;
    private asyncHtmlFormatter: AsyncHTMLFormatter | null = null;
    private yamlFormatter: YAMLFormatter | null = null;
    private phpFormatter: PHPFormatter | null = null;
    private asyncPhpFormatter: AsyncPHPFormatter | null = null;

    private slugs: string[] = [];
    private removeLines: string[] = [];
    private virtualStructureOpens: string[] = [];
    private virtualStructureClose: string[] = [];
    private structureLines: string[] = [];
    private parentTransformer: Transformer | null = null;
    private tagPairs: Map<string, TransformedTagPair> = new Map();
    private conditions: TransformedCondition[] = [];
    private inlineIfs: Map<string, ConditionNode> = new Map();
    private createExraStructuralPairs = false;
    private spanNodes: Map<string, AntlersNode> = new Map();
    private inlineNodes: Map<string, AntlersNode> = new Map();
    private virtualBlocks: VirtualBlockStructure[] = [];
    private inlineComments: Map<string, AntlersNode> = new Map();
    private blockComments: VirtualBlockStructure[] = [];
    private dynamicElementAntlers: Map<string, string> = new Map();
    private dynamicElementAntlersNodes: Map<string, AntlersNode> = new Map();
    private dynamicElementPairedAntlers: Map<string, string> = new Map();
    private dynamicElementPairedAntlersNodes: Map<string, AntlersNode> = new Map();
    private dynamicElementConditionAntlers: Map<string, string> = new Map();
    private dynamicElementConditionAntlersNodes: Map<string, ConditionNode> = new Map();
    private noParses: Map<string, EscapedContentNode> = new Map();
    private options: TransformOptions;
    private forceBreaks: string[] = [];
    private inlineFormatter: InlineFormatter | null = null;
    private asyncInlineFormatter: AsyncInlineFormatter | null = null;
    private ignoredLiteralBlocks: Map<string, AbstractNode[]> = new Map();
    private activeLiteralSlug: string = '';
    private isInsideIgnoreFormatter: boolean = false;

    constructor(doc: AntlersDocument) {
        this.doc = doc;

        this.options = {
            tabSize: 4,
            newlinesAfterFrontMatter: 1,
            maxAntlersStatementsPerLine: 3,
            endNewline: true
        };
    }

    withInlineFormatter(inlineFormatter: InlineFormatter) {
        this.inlineFormatter = inlineFormatter;

        return this;
    }

    withAsyncInlineFormatter(asyncInlineFormatter: AsyncInlineFormatter) {
        this.asyncInlineFormatter = asyncInlineFormatter;

        return this;
    }

    produceExtraStructuralPairs(doCreate: boolean) {
        this.createExraStructuralPairs = doCreate;

        return this;
    }

    withHtmlFormatter(formatter: HTMLFormatter | null) {
        this.htmlFormatter = formatter;

        return this;
    }

    withAsyncHtmlFormatter(formatter: AsyncHTMLFormatter | null) {
        this.asyncHtmlFormatter = formatter;

        return this;
    }

    withYamlFormatter(formatter: YAMLFormatter | null) {
        this.yamlFormatter = formatter;

        return this;
    }

    withPhpFormatter(formatter: PHPFormatter | null) {
        this.phpFormatter = formatter;

        return this;
    }

    withAsyncPhpFormatter(formatter: AsyncPHPFormatter | null) {
        this.asyncPhpFormatter = formatter;

        return this;
    }

    withOptions(options: TransformOptions) {
        this.options = options;

        if (this.options.tabSize <= 0) {
            this.options.tabSize = 4;
        }

        if (this.options.newlinesAfterFrontMatter < 0) {
            this.options.newlinesAfterFrontMatter = 1;
        }

        return this;
    }

    setParentTransformer(transformer: Transformer) {
        this.parentTransformer = transformer;

        return this;
    }

    private close(value: string): string {
        return '</' + value + '>';
    }

    private open(value: string): string {
        return '<' + value + '>';
    }

    private selfClosing(value: string): string {
        return '<' + value + ' />';
    }

    private selfClosingNs(value: string): string {
        return '<' + value + '/>';
    }

    private pair(value: string, innerContent = ''): string {
        return '<' + value + '>' + innerContent + '</' + value + '>';
    }

    private makeSlug(length: number): string {
        const slug = StringUtilities.makeSlug(length);

        if (this.slugs.includes(slug)) {
            return this.makeSlug(length + 1);
        }

        this.slugs.push(slug);

        return slug;
    }

    private transformInlineConditions(value: string): string {
        let results = value;

        this.inlineIfs.forEach((condition, slug) => {
            results = results.replace(slug, condition.nodeContent);
        });

        return results;
    }

    private registerCondition(transformedCondition: TransformedCondition) {
        if (this.parentTransformer != null) {
            this.parentTransformer.registerCondition(transformedCondition);
        } else {
            this.conditions.push(transformedCondition);
        }
    }

    private registerInlineCondition(slug: string, node: ConditionNode) {
        if (this.parentTransformer != null) {
            this.parentTransformer.registerInlineCondition(slug, node);
        } else {
            this.inlineIfs.set(slug, node);
        }
    }

    private registerVirtualBlock(structure: VirtualBlockStructure) {
        if (this.parentTransformer != null) {
            this.parentTransformer.registerVirtualBlock(structure);
        } else {
            this.virtualBlocks.push(structure);
        }
    }

    private registerNoParse(slug: string, node: EscapedContentNode) {
        if (this.parentTransformer != null) {
            this.parentTransformer.registerNoParse(slug, node);
        } else {
            this.noParses.set(slug, node);
        }
    }

    private prepareNoParse(node: EscapedContentNode): string {
        const slug = this.makeSlug(35);

        this.registerNoParse(slug, node);

        return slug;
    }

    private registerForcedBreak(): string {
        if (this.parentTransformer != null) {
            return this.parentTransformer.registerForcedBreak();
        } else {
            const breakSlug = this.makeSlug(15),
                innerSlug = this.makeSlug(10);
            this.forceBreaks.push(breakSlug);
            this.forceBreaks.push(innerSlug);
            this.removeLines.push(this.open(breakSlug));
            this.removeLines.push(this.close(breakSlug));
            this.removeLines.push(this.selfClosing(innerSlug));
            return this.pair(breakSlug, this.selfClosing(innerSlug));
        }
    }

    private transformVirtualStructures(content: string): string {
        let value = content;

        this.virtualBlocks.forEach((block) => {
            this.removeLines.push(block.pairClose);
            const targetIndent = this.indentLevel(block.pairOpen);

            if (block.virtualElement.length > 0) {
                this.removeLines.push(this.open(block.virtualElement));
                this.removeLines.push(this.close(block.virtualElement));
            }

            if (block.node instanceof EscapedContentNode) {
                const replaceNoParse = "{{ noparse }}" + block.node.getInnerDocumentText();
                value = value.replace(block.pairOpen, replaceNoParse);
            }

            if (block.node instanceof AntlersNode) {
                const antlersNode = block.node as AntlersNode;

                value = value.replace(block.pairClose, antlersNode.isClosedBy?.getOriginalContent() as string);

            } else {
                this.removeLines.push(block.pairClose);
            }
        });

        this.noParses.forEach((node, slug) => {
            value = value.replace(slug, `{{ noparse }}${node.getInnerDocumentText()}{{ /noparse }}`);
        });

        return value;
    }

    private async printNodeAsync(node: AntlersNode, targetIndent: number | null = null): Promise<string> {
        const printNode = node.getTrueNode();

        if ((printNode.rawStart == '{{?' || printNode.rawStart == '{{$') && this.asyncPhpFormatter != null) {
            try {
                const formattedPhp = await this.asyncPhpFormatter(printNode.content);

                return `${printNode.rawStart} ${formattedPhp} ${printNode.rawEnd}`;
            } catch (err) { }
        }

        let doc = this.doc;

        if (node.childDocument != null) {
            doc = node.childDocument.document;
        }

        let prepend: string | null = null;

        if (ConditionPairAnalyzer.isConditionalStructure(node)) {
            prepend = printNode.runtimeName();

            if (node.isClosingTag && (prepend == 'if' || prepend == 'unless')) {
                return `{{ /${prepend} }}`;
            }
        }

        if (node.isClosingTag) {
            if (printNode.runtimeName() == 'endunless') {
                return `{{ /unless }}`;
            }

            return `{{ ${printNode.sourceContent.trim()} }}`;
        }

        let result = NodePrinter.prettyPrintNode(printNode, doc, 0, this.options, prepend, null);

        const forceBreakOperatorNames = ['switch', 'list'];

        if (targetIndent != null && result.includes("\n")) {
            if (node.isVirtual && (node.name?.name == 'switch' || node.name?.name == 'list')) {
                result = IndentLevel.shiftIndent(result, targetIndent + this.options.tabSize, true);
            } else {
                result = IndentLevel.shiftIndent(result, targetIndent - (this.options.tabSize * 2), true);
            }
        }

        return result;
    }

    private printNode(node: AntlersNode, targetIndent: number | null = null) {
        const printNode = node.getTrueNode();

        if ((printNode.rawStart == '{{?' || printNode.rawStart == '{{$') && this.phpFormatter != null) {
            try {
                const formattedPhp = this.phpFormatter(printNode.content);

                return `${printNode.rawStart} ${formattedPhp} ${printNode.rawEnd}`;
            } catch (err) { }
        }

        let doc = this.doc;

        if (node.childDocument != null) {
            doc = node.childDocument.document;
        }

        let prepend: string | null = null;

        if (ConditionPairAnalyzer.isConditionalStructure(node)) {
            prepend = printNode.runtimeName();

            if (node.isClosingTag && (prepend == 'if' || prepend == 'unless')) {
                return `{{ /${prepend} }}`;
            }
        }

        if (node.isClosingTag) {
            if (printNode.runtimeName() == 'endunless') {
                return `{{ /unless }}`;
            }

            return `{{ ${printNode.sourceContent.trim()} }}`;
        }

        let result = NodePrinter.prettyPrintNode(printNode, doc, 0, this.options, prepend, null);

        const forceBreakOperatorNames = ['switch', 'list'];

        if (targetIndent != null && result.includes("\n")) {
            if (node.isVirtual && (node.name?.name == 'switch' || node.name?.name == 'list')) {
                result = IndentLevel.shiftIndent(result, targetIndent + this.options.tabSize, true);
            } else {
                result = IndentLevel.shiftIndent(result, targetIndent - (this.options.tabSize * 2), true);
            }
        }

        return result;
    }


    private async transformConditionsAsync(content: string): Promise<string> {
        let value = content;

        for (let i = 0; i < this.conditions.length; i++) {
            const condition = this.conditions[i];

            for (let j = 0; j < condition.structures.length; j++) {
                const structure = condition.structures[j];
                const structureTag = structure.branch.head as AntlersNode;

                if (structure.virtualBreakOpen.length > 0) {
                    this.removeLines.push(structure.virtualBreakOpen);
                }

                if (structure.virtualBreakClose.length > 0) {
                    value = value.replace(structure.virtualBreakClose, structure.virtualBreakClose + "\n");
                    this.removeLines.push(structure.virtualBreakClose);
                }

                this.virtualStructureOpens.push(structure.virtualOpen);
                this.removeLines.push(structure.virtualOpen);
                this.removeLines.push(structure.virtualClose);

                if (!structure.isLast) {
                    const virtualInline = this.selfClosing(structure.virtualSlug);

                    if (!value.includes(virtualInline)) {
                        const replaceRegex = '<' + structure.virtualSlug + '(\\s)+\\/>',
                            regex = new RegExp(replaceRegex, 'gm');

                        value = value.replace(regex, virtualInline);
                    }

                    if (value.includes(virtualInline)) {
                        value = value.replace(virtualInline, structure.doc.trim());
                    }

                    this.removeLines.push(structure.pairClose);
                    value = value.replace(structure.pairOpen, await this.printNodeAsync(structureTag, this.indentLevel(structure.pairOpen)));
                } else {
                    const virtualInline = this.selfClosing(structure.virtualSlug);

                    if (!value.includes(virtualInline)) {
                        const replaceRegex = '<' + structure.virtualSlug + '(\\s)+\\/>',
                            regex = new RegExp(replaceRegex, 'gm');

                        value = value.replace(regex, virtualInline);
                    }

                    if (value.includes(virtualInline)) {
                        value = value.replace(virtualInline, structure.doc.trim());
                    }

                    value = value.replace(structure.pairOpen, await this.printNodeAsync(structureTag, this.indentLevel(structure.pairOpen)));
                    value = value.replace(structure.pairClose, await this.printNodeAsync(structureTag.isClosedBy as AntlersNode));
                }
            }
        }

        return value;
    }

    private transformConditions(content: string): string {
        let value = content;

        this.conditions.forEach((condition) => {
            condition.structures.forEach((structure) => {
                const structureTag = structure.branch.head as AntlersNode;

                if (structure.virtualBreakOpen.length > 0) {
                    this.removeLines.push(structure.virtualBreakOpen);
                }

                if (structure.virtualBreakClose.length > 0) {
                    value = value.replace(structure.virtualBreakClose, structure.virtualBreakClose + "\n");
                    this.removeLines.push(structure.virtualBreakClose);
                }

                this.virtualStructureOpens.push(structure.virtualOpen);
                this.removeLines.push(structure.virtualOpen);
                this.removeLines.push(structure.virtualClose);

                if (!structure.isLast) {
                    const virtualInline = this.selfClosing(structure.virtualSlug);

                    if (!value.includes(virtualInline)) {
                        const replaceRegex = '<' + structure.virtualSlug + '(\\s)+\\/>',
                            regex = new RegExp(replaceRegex, 'gm');

                        value = value.replace(regex, virtualInline);
                    }

                    if (value.includes(virtualInline)) {
                        value = value.replace(virtualInline, structure.doc.trim());
                    }

                    this.removeLines.push(structure.pairClose);
                    value = value.replace(structure.pairOpen, this.printNode(structureTag, this.indentLevel(structure.pairOpen)));
                } else {
                    const virtualInline = this.selfClosing(structure.virtualSlug);

                    if (!value.includes(virtualInline)) {
                        const replaceRegex = '<' + structure.virtualSlug + '(\\s)+\\/>',
                            regex = new RegExp(replaceRegex, 'gm');

                        value = value.replace(regex, virtualInline);
                    }

                    if (value.includes(virtualInline)) {
                        value = value.replace(virtualInline, structure.doc.trim());
                    }

                    value = value.replace(structure.pairOpen, this.printNode(structureTag, this.indentLevel(structure.pairOpen)));
                    value = value.replace(structure.pairClose, this.printNode(structureTag.isClosedBy as AntlersNode));
                }
            });
        });

        return value;
    }

    private getAntlersChildDoc(node: AntlersNode | ExecutionBranch): string {
        if (node.childDocument != null) {
            return node.childDocument.document.transform().setParentTransformer(this).toStructure();
        }

        return this.clone().toStructure(node.getImmediateChildren());
    }

    private prepareCondition(node: ConditionNode) {
        const headNode = node.logicBranches[0].head as AntlersNode;

        if (headNode.fragmentPosition == FragmentPosition.InsideFragment || headNode.fragmentPosition == FragmentPosition.InsideFragmentParameter) {
            const slug = this.makeSlug(node.nodeContent.length);

            this.registerInlineCondition(slug, node);

            return slug;
        }

        if (headNode.fragmentPosition == FragmentPosition.IsDynamicFragmentName) {
            return this.prepareDynamicCondition(node);
        }

        const transformedBranches: TransformedLogicBranch[] = [];
        let result = '';

        if (headNode.prev instanceof AntlersNode && headNode.prev.isInlineAntlers) {
            result += this.registerForcedBreak();
        }

        node.logicBranches.forEach((branch, index) => {
            const tag = branch.head as AntlersNode,
                innerDoc = this.getAntlersChildDoc(branch);
            const openSlug = this.makeSlug(tag.sourceContent.length),
                virtualSlug = this.makeSlug(10);

            const tBranch: TransformedLogicBranch = {
                branch: branch,
                slug: openSlug,
                doc: innerDoc,
                pairOpen: this.open(openSlug),
                pairClose: this.close(openSlug),
                virtualOpen: this.open(virtualSlug),
                virtualClose: this.close(virtualSlug),
                virtualSlug: virtualSlug,
                isFirst: index == 0,
                isLast: index == node.logicBranches.length - 1,
                virtualBreakClose: '',
                virtualBreakOpen: ''
            };

            if (branch.head?.name?.getCompoundTagName() == 'else') {
                result += "\n" + tBranch.pairOpen;
                const virtualBreakSlug = this.makeSlug(25);

                if (this.createExraStructuralPairs && branch.head.containsChildStructures == false && branch.head.containsAnyFragments == false) {
                    tBranch.virtualBreakOpen = this.open(virtualBreakSlug);
                    tBranch.virtualBreakClose = this.close(virtualBreakSlug);
                    tBranch.virtualSlug = virtualBreakSlug;
                    result += "\n" + this.selfClosing(virtualBreakSlug);
                    result += tBranch.pairClose + "\n";
                } else {
                    tBranch.virtualBreakOpen = this.selfClosing(virtualBreakSlug);
                    result += tBranch.virtualBreakOpen + "\n";
                    result += innerDoc;
                    result += "\n" + tBranch.pairClose;
                }
            } else {

                if (this.createExraStructuralPairs && branch.head?.containsAnyFragments == false && branch.head?.containsChildStructures == false) {
                    const ifBreakSlug = this.makeSlug(25);

                    tBranch.virtualBreakOpen = this.open(ifBreakSlug);
                    tBranch.virtualBreakClose = this.close(ifBreakSlug);
                    tBranch.virtualSlug = ifBreakSlug;

                    result += "\n" + tBranch.pairOpen;
                    result += "\n" + this.selfClosing(ifBreakSlug);
                    result += tBranch.pairClose + "\n";
                } else {
                    result += tBranch.pairOpen;
                    result += "\n";
                    result += innerDoc;
                    result += "\n";
                    result += tBranch.pairClose;
                }
            }

            transformedBranches.push(tBranch);
        });

        const pairOpen = transformedBranches[0].pairOpen as string,
            pairClose = transformedBranches[transformedBranches.length - 1].pairClose as string;

        const tCond: TransformedCondition = {
            pairOpen: pairOpen,
            pairClose: pairClose,
            structures: transformedBranches,
            condition: node
        };

        this.registerCondition(tCond);

        return result;
    }

    private registerPairedAntlers(slug: string, transformedTag: TransformedTagPair) {
        if (this.parentTransformer != null) {
            this.parentTransformer.registerPairedAntlers(slug, transformedTag);
        } else {
            this.tagPairs.set(slug, transformedTag);
        }
    }

    private preparePairedAntlers(node: AntlersNode): string {
        const slug = this.makeSlug(node.getOriginalContent().length),
            innerDoc = this.getAntlersChildDoc(node);

        if (node.fragmentPosition != FragmentPosition.IsDynamicFragmentName) {
            let virtualSlug = '';
            let result = '';

            if (node.prev instanceof AntlersNode && node.prev.isPaired() == false) {
                result += this.registerForcedBreak();
            }

            result += `${this.open(slug)}\n`;

            if (node.containsChildStructures == false && node.containsAnyFragments == false) {
                let createVirtual = false,
                    literalsAllWhiteSpace = true,
                    allAntlersInline = true,
                    antlersCount = 0;

                for (let i = 0; i < node.children.length; i++) {
                    const thisNode = node.children[i];

                    if (thisNode instanceof LiteralNode) {
                        if (thisNode.sourceContent.trim().length > 0) {
                            createVirtual = true;
                            literalsAllWhiteSpace = false;
                            break;
                        }
                    }
                }

                if (node.children.length == 2 && node.children[0] instanceof AntlersNode) {
                    createVirtual = true;
                }

                let inlineAntlers = 0;

                for (let i = 0; i < node.children.length - 1; i++) {
                    const thisNode = node.children[i];

                    if (thisNode instanceof AntlersNode) {
                        antlersCount += 1;

                        if (thisNode.isInlineAntlers) {
                            inlineAntlers += 1;
                        } else {
                            allAntlersInline = false;
                        }
                    }
                }

                if (inlineAntlers == 0) {
                    createVirtual = true;
                }

                if (allAntlersInline == false) {
                    createVirtual = false;
                }

                if (literalsAllWhiteSpace == false && antlersCount == 0) {
                    createVirtual = false;
                }

                if (createVirtual) {
                    virtualSlug = this.makeSlug(15);
                    result += this.pair(virtualSlug, innerDoc);
                } else {
                    result += innerDoc;
                }
            } else {
                result += innerDoc;
            }

            result += `\n${this.close(slug)}\n`;

            this.virtualStructureOpens.push(this.open(virtualSlug));
            this.virtualStructureClose.push(this.close(virtualSlug));
            this.virtualStructureClose.push(this.close(slug));

            this.registerPairedAntlers(slug, {
                innerDoc: innerDoc,
                slug: slug,
                tag: node,
                virtualElementSlug: virtualSlug,
                isInline: false
            });

            return result;
        }

        return this.prepareConditionalAntlersPair(node);
    }

    private registerInlineAntlers(node: AntlersNode): string {
        if (node.fragmentPosition == FragmentPosition.InsideFragment || node.fragmentPosition == FragmentPosition.InsideFragmentParameter) {
            node.isInlineAntlers = true;
        }

        if (this.parentTransformer != null) {
            return this.parentTransformer.registerInlineAntlers(node);
        } else {
            const slug = this.makeSlug(node.getOriginalContent().length);

            if (node.isInlineAntlers) {
                this.spanNodes.set(slug, node);

                return slug;
            } else {
                this.inlineNodes.set(slug, node);

                return this.selfClosing(slug);
            }
        }
    }

    private registerVirtualComment(structure: VirtualBlockStructure) {
        if (this.parentTransformer != null) {
            this.parentTransformer.registerVirtualComment(structure);
        } else {
            this.blockComments.push(structure);
        }
    }

    private registerComment(slug: string, comment: AntlersNode) {
        if (this.parentTransformer != null) {
            this.parentTransformer.registerComment(slug, comment);
        } else {
            this.inlineComments.set(slug, comment);
        }
    }

    private prepareComment(node: AntlersNode): string {
        const sourceContent = node.getContent(),
            content = sourceContent.trim();

        if (content.includes("\n")) {
            const slug = this.makeSlug(10),
                virtualSlug = this.makeSlug(10),
                virtualStructure: VirtualBlockStructure = {
                    node: node,
                    pairOpen: this.open(slug),
                    pairClose: this.close(slug),
                    virtualElement: this.selfClosing(virtualSlug)
                };

            this.registerVirtualComment(virtualStructure);

            return virtualStructure.pairOpen + "\n" + virtualStructure.virtualElement + "\n" + virtualStructure.pairClose;
        }

        const slug = this.makeSlug(sourceContent.length);

        this.registerComment(slug, node);

        return this.selfClosing(slug);
    }

    private registerDynamicAntlersPair(slug: string, node: AntlersNode) {
        if (this.parentTransformer != null) {
            this.dynamicElementPairedAntlers.set(node.nodeContent, slug);
            this.parentTransformer.registerDynamicAntlersPair(slug, node);
        } else {
            this.dynamicElementPairedAntlers.set(node.nodeContent, slug);
            this.dynamicElementPairedAntlersNodes.set(slug, node);
        }
    }

    private prepareConditionalAntlersPair(node: AntlersNode): string {
        if (this.dynamicElementPairedAntlers.has(node.nodeContent)) {
            return this.dynamicElementPairedAntlers.get(node.nodeContent) as string;
        }

        const slug = this.makeSlug(node.nodeContent.length);

        this.registerDynamicAntlersPair(slug, node);

        return slug;
    }

    private registerDynamicCondition(slug: string, node: ConditionNode) {
        if (this.parentTransformer != null) {
            this.dynamicElementConditionAntlers.set(node.nodeContent, slug);
            this.parentTransformer.registerDynamicCondition(slug, node);
        } else {
            this.dynamicElementConditionAntlers.set(node.nodeContent, slug);
            this.dynamicElementConditionAntlersNodes.set(slug, node);
        }
    }

    private prepareDynamicCondition(node: ConditionNode): string {
        if (this.dynamicElementConditionAntlers.has(node.nodeContent)) {
            return this.dynamicElementConditionAntlers.get(node.nodeContent) as string;
        }

        const slug = this.makeSlug(node.nodeContent.length);

        this.registerDynamicCondition(slug, node);

        return slug;
    }

    private registerDynamicAntlers(slug: string, node: AntlersNode) {
        if (this.parentTransformer != null) {
            this.dynamicElementAntlers.set(node.content, slug);
            this.parentTransformer.registerDynamicAntlers(slug, node);
        } else {
            this.dynamicElementAntlers.set(node.content, slug);
            this.dynamicElementAntlersNodes.set(slug, node);
        }
    }

    private prepareConditionalAntlers(node: AntlersNode): string {
        if (this.dynamicElementAntlers.has(node.content)) {
            return this.dynamicElementAntlers.get(node.content) as string;
        }

        const slug = this.makeSlug(node.content.length);

        this.registerDynamicAntlers(slug, node);

        return slug;
    }

    private prepareAntlers(node: AntlersNode): string {
        if (node.isClosedBy != null) {
            return this.preparePairedAntlers(node);
        }

        if (node.fragmentPosition == FragmentPosition.IsDynamicFragmentName) {
            return this.prepareConditionalAntlers(node);
        }

        return this.registerInlineAntlers(node);
    }

    private async transformDynamicAntlersAsync(content: string): Promise<string> {
        let value = content;

        for (const [slug, node] of this.dynamicElementAntlersNodes) {
            const antlersContent = await this.printNodeAsync(node);

            value = replaceAllInString(value, slug, antlersContent);
        }

        this.dynamicElementPairedAntlersNodes.forEach((node, slug) => {
            const antlersContent = node.nodeContent;

            value = replaceAllInString(value, slug, antlersContent);
        });

        this.dynamicElementConditionAntlersNodes.forEach((node, slug) => {
            const antlersContent = node.nodeContent;

            value = replaceAllInString(value, slug, antlersContent);
        });

        return value;
    }

    private async transformPairedAntlersAsync(content: string): Promise<string> {
        let value = content;

        for (const [slug, tag] of this.tagPairs) {
            const originalTag = tag.tag;

            if (tag.virtualElementSlug.length > 0) {
                const open = this.open(tag.virtualElementSlug),
                    close = this.close(tag.virtualElementSlug);
                this.virtualStructureOpens.push(open);
                this.removeLines.push(open);
                this.removeLines.push(close);
            }

            const open = this.open(slug),
                close = this.close(slug);

            value = value.replace(open, await this.printNodeAsync(originalTag, this.indentLevel(open)));

            value = value.replace(close, await this.printNodeAsync(originalTag.isClosedBy as AntlersNode));
        }

        return value;
    }

    private async transformInlineAntlersAsync(content: string): Promise<string> {
        let value = content;

        for (const [slug, node] of this.inlineNodes) {
            const inline = this.selfClosing(slug),
                inlineNs = this.selfClosingNs(slug),
                printed = await this.printNodeAsync(node, this.indentLevel(inline));
            value = value.replace(inline, printed);
            value = value.replace(inlineNs, printed);
        }

        for (const [slug, node] of this.spanNodes) {
            let level = 0;

            if (node.isVirtual && (node.name?.name == 'switch' || node.name?.name == 'list')) {
                level = this.indentLevel(slug, true);
            }

            const printed = await this.printNodeAsync(node, level),
                slugNs = this.selfClosingNs(slug);

            value = value.replace(slug, printed);
            value = value.replace(slugNs, printed);
        }

        return value;
    }

    private transformDynamicAntlers(content: string): string {
        let value = content;

        this.dynamicElementAntlersNodes.forEach((node, slug) => {
            const antlersContent = this.printNode(node);

            value = replaceAllInString(value, slug, antlersContent);
        });

        this.dynamicElementPairedAntlersNodes.forEach((node, slug) => {
            const antlersContent = node.nodeContent;

            value = replaceAllInString(value, slug, antlersContent);
        });

        this.dynamicElementConditionAntlersNodes.forEach((node, slug) => {
            const antlersContent = node.nodeContent;

            value = replaceAllInString(value, slug, antlersContent);
        });

        return value;
    }

    private transformPairedAntlers(content: string): string {
        let value = content;

        this.tagPairs.forEach((tag: TransformedTagPair, slug: string) => {
            const originalTag = tag.tag;

            if (tag.virtualElementSlug.length > 0) {
                const open = this.open(tag.virtualElementSlug),
                    close = this.close(tag.virtualElementSlug);
                this.virtualStructureOpens.push(open);
                this.removeLines.push(open);
                this.removeLines.push(close);
            }

            const open = this.open(slug),
                close = this.close(slug);

            value = value.replace(open, this.printNode(originalTag, this.indentLevel(open)));

            value = value.replace(close, this.printNode(originalTag.isClosedBy as AntlersNode));
        });

        return value;
    }

    private transformInlineAntlers(content: string): string {
        let value = content;

        this.inlineNodes.forEach((node: AntlersNode, slug: string) => {
            const inline = this.selfClosing(slug),
                inlineNs = this.selfClosingNs(slug),
                printed = this.printNode(node, this.indentLevel(inline));
            value = value.replace(inline, printed);
            value = value.replace(inlineNs, printed);
        });

        this.spanNodes.forEach((node: AntlersNode, slug: string) => {
            let level = 0;

            if (node.isVirtual && (node.name?.name == 'switch' || node.name?.name == 'list')) {
                level = this.indentLevel(slug, true);
            }

            const printed = this.printNode(node, level),
                slugNs = this.selfClosingNs(slug);

            value = value.replace(slug, printed);
            value = value.replace(slugNs, printed);
        });

        return value;
    }

    private async transformCommentsAsync(content: string): Promise<string> {
        let value = content;

        for (const [slug, comment] of this.inlineComments) {
            const open = this.selfClosing(slug),
                commentResult = await CommentPrinter.printCommentAsync(comment, this.options.tabSize, 0, this.asyncInlineFormatter);

            value = value.replace(open, commentResult);
        }

        for (let i = 0; i < this.blockComments.length; i++) {
            const structure = this.blockComments[i];

            const comment = structure.node as AntlersNode,
                commentResult = await CommentPrinter.printCommentAsync(comment, this.options.tabSize, this.indentLevel(structure.pairOpen), this.asyncInlineFormatter);

            value = value.replace(structure.pairOpen, commentResult);
            this.removeLines.push(structure.pairClose);
            this.removeLines.push(structure.virtualElement);
        }

        return value;
    }

    private transformComments(content: string): string {
        let value = content;

        this.inlineComments.forEach((comment, slug) => {
            const open = this.selfClosing(slug),
                commentResult = CommentPrinter.printComment(comment, this.options.tabSize, 0, this.inlineFormatter);

            value = value.replace(open, commentResult);
        });

        this.blockComments.forEach((structure) => {
            const comment = structure.node as AntlersNode,
                commentResult = CommentPrinter.printComment(comment, this.options.tabSize, this.indentLevel(structure.pairOpen), this.inlineFormatter);

            value = value.replace(structure.pairOpen, commentResult);
            this.removeLines.push(structure.pairClose);
            this.removeLines.push(structure.virtualElement);
        });

        return value;
    }

    withIgnoredRegions(regions: Map<string, AbstractNode[]>): Transformer {
        this.ignoredLiteralBlocks = regions;

        return this;
    }

    clone(): Transformer {
        const cloned = new Transformer(this.doc);
        cloned.withOptions(this.options).setParentTransformer(this);
        cloned.withIgnoredRegions(this.ignoredLiteralBlocks);

        return cloned;
    }

    toStructure(renderNodes: AbstractNode[] | null = null): string {
        let result = '';

        if (renderNodes == null) {
            renderNodes = this.doc.getDocumentParser().getRenderNodes();
        }

        renderNodes.forEach((node) => {
            if (this.isInsideIgnoreFormatter) {
                this.ignoredLiteralBlocks.get(this.activeLiteralSlug)?.push(node);

                if (node instanceof AntlersNode && node.isComment) {
                    if (node.content.trim().toLowerCase() == this.formatIgnoreEnd) {
                        this.isInsideIgnoreFormatter = false;
                        return;
                    }
                }
                return;
            }
            if (node instanceof LiteralNode) {
                if (node.sourceContent == '') {
                    result += node.content;
                } else {
                    result += node.sourceContent;
                }
            } else if (node instanceof ConditionNode) {
                result += this.prepareCondition(node);
            } else if (node instanceof EscapedContentNode) {
                result += this.prepareNoParse(node);
            } else if (node instanceof AntlersNode) {
                if (node.isComment) {
                    if (node.content.trim() == this.formatIgnoreStart) {
                        this.isInsideIgnoreFormatter = true;
                        this.activeLiteralSlug = this.makeSlug(16);
                        this.ignoredLiteralBlocks.set(this.activeLiteralSlug, []);
                        this.ignoredLiteralBlocks.get(this.activeLiteralSlug)?.push(node);

                        result += this.selfClosing(this.activeLiteralSlug);
                    } else {
                        result += this.prepareComment(node);
                    }
                } else {
                    result += this.prepareAntlers(node);
                }
            }
        });

        return result;
    }

    private indentLevel(value: string, includeIndex = false): number {

        for (let i = 0; i < this.structureLines.length; i++) {
            const thisLine = this.structureLines[i];

            if (thisLine.includes(value)) {
                const trimmed = thisLine.trimLeft();

                let indent = thisLine.length - trimmed.length;

                if (includeIndex) {
                    indent += thisLine.indexOf(value);
                }

                return indent;
            }
        }
        return 0;
    }

    private forceCleanLines: string[] = [
        '{{ if ',
        '{{ /if',
        '{{ /unless',
        '{{ /noparse',
        '{{ else',
        '{{ unless'
    ];

    private shouldCleanAfter(line: string): boolean {
        for (let i = 0; i < this.removeLines.length; i++) {
            if (line.startsWith(this.removeLines[i])) {
                return true;
            }
        }

        for (let i = 0; i < this.forceCleanLines.length; i++) {
            if (line.startsWith(this.forceCleanLines[i])) {
                return true;
            }
        }

        return false;
    }

    private shouldCleanLine(line: string): boolean {
        for (let i = 0; i < this.forceCleanLines.length; i++) {
            const trimmedLine = line.trim();

            if (line.startsWith(this.forceCleanLines[i]) || (trimmedLine.startsWith('{{ /') && trimmedLine.endsWith('}}'))) {
                return true;
            }
        }

        return false;
    }

    cleanVirtualStructures(content: string): string {
        const newLines: string[] = [],
            contentLines = StringUtilities.breakByNewLine(content);

        let removeNewLines = false;

        for (let i = 0; i < contentLines.length; i++) {
            const checkLine = contentLines[i].trim();

            if (removeNewLines) {
                if (checkLine.length == 0) {
                    continue;
                } else {
                    removeNewLines = false;
                }
            } else {
                removeNewLines = this.shouldCleanAfter(checkLine);
            }

            if (this.shouldCleanLine(checkLine)) {
                for (let j = newLines.length - 1; j > 0; j--) {
                    const tLine = newLines[j];

                    if (tLine.trim().length == 0) {
                        newLines.pop();
                    } else {
                        break;
                    }
                }
            }

            if (this.removeLines.includes(checkLine)) {
                continue;
            } else {
                let newLine = contentLines[i];
                this.removeLines.forEach((line) => {
                    if (newLine.includes(line)) {
                        newLine = newLine.replace(line, '');
                    }
                });
                newLines.push(newLine);
            }
        }

        return newLines.join("\n");
    }

    public applyFragmentReplacements(content: string, fragments: Map<string, StructuralFragment>, tabSize: number): string {
        let value = content;

        fragments.forEach((fragment, slug) => {
            const targetIndent = this.indentLevel(slug);

            let fragmentContent = fragment.outerContent;

            if (targetIndent > 0) {
                let lDiff = fragmentContent.length - fragmentContent.trimStart().length;

                if (lDiff == 0 || lDiff > targetIndent) {
                    fragmentContent = IndentLevel.shiftIndentLTrim(fragmentContent, targetIndent).trimStart();
                }
            }

            value = value.replace(slug, fragmentContent);
        });

        return value;
    }

    private reflowSlugs(content: string): string {
        let result = content;

        this.slugs.forEach((slug) => {
            const open = this.open(slug),
                close = this.close(slug),
                selfClose = this.selfClosing(slug),
                openRegex = '/<' + slug + '(.*?)>/gms',
                closeRegex = '/</' + slug + '(.*?)>/gms',
                selfCloseRegex = '/<' + slug + '(.*?)/>/gms';
            result = result.replace(openRegex, open);
            result = result.replace(closeRegex, close);
            result = result.replace(selfCloseRegex, selfClose);
        });

        return result;
    }

    private cleanLines(content: string): string {
        const lines: string[] = StringUtilities.breakByNewLine(content),
            newLines: string[] = [];

        let pruneLines = false,
            prunedCount = 0,
            isProbablyOpen = false,
            isPartial = false;
        for (let i = 0; i < lines.length; i++) {
            const checkLine = lines[i].trim(),
                line = lines[i];

            if (checkLine.startsWith('{{')) { //&& checkLine.endsWith('}}')) {
                if (checkLine.endsWith('}}')) {
                    isPartial = false;
                } else {
                    isPartial = true;
                }

                if (checkLine.startsWith('{{#')) {
                    isPartial = false;
                }

                if (pruneLines) {
                    prunedCount = 0;
                }
                if (checkLine.startsWith('{{ /') == false) {
                    isProbablyOpen = true;
                } else {
                    isProbablyOpen = false;
                }
                pruneLines = true;
                newLines.push(line);
                continue;
            }

            if (!pruneLines) {
                newLines.push(line);
            } else {
                if (isPartial) {
                    newLines.push(line);
                    if (line.trim().endsWith('}}')) {
                        isPartial = false;
                    }
                    continue;
                }
                if (checkLine.length == 0) {
                    if (isProbablyOpen == false) {
                        prunedCount = 0;
                        pruneLines = false;
                        continue;
                    }
                    prunedCount += 1;
                    continue;
                } else {
                    if (isProbablyOpen && prunedCount > 1) {
                        newLines.push('');
                    }
                    prunedCount = 0;
                    newLines.push(line);
                    pruneLines = false;
                }
            }
        }

        return newLines.join("\n");
    }

    async fromStructureAsync(structure: string): Promise<string> {
        const reflowedContent = this.reflowSlugs(structure);

        this.structureLines = StringUtilities.breakByNewLine(reflowedContent);
        let results = this.transformInlineConditions(reflowedContent);
        results = await this.transformConditionsAsync(results);
        results = await this.transformInlineAntlersAsync(results);
        results = await this.transformCommentsAsync(results);
        results = this.transformVirtualStructures(results);
        results = await this.transformDynamicAntlersAsync(results);
        results = await this.transformPairedAntlersAsync(results);
        results = this.cleanVirtualStructures(results);
        results = this.cleanLines(results);
        //results = this.removeVirtualStructures(results);

        // results = this.cleanStructuralNewLines(results);

        if (this.doc.hasFrontMatter()) {
            let frontMatter = this.doc.getFrontMatter();

            const frontMatterDoc = this.doc.getFrontMatterDoc();

            if (frontMatterDoc != null && frontMatterDoc.isValid && this.yamlFormatter != null) {
                frontMatter = this.yamlFormatter(frontMatter);
            }

            const insertFrontMatter = `---\n${frontMatter}\n---\n` + "\n".repeat(this.options.newlinesAfterFrontMatter);

            results = insertFrontMatter + results.trimLeft();
        }

        results = results.trimRight();

        this.ignoredLiteralBlocks.forEach((nodes, slug) => {
            const replace = this.selfClosing(slug),
                startIndent = this.indentLevel(replace);

            results = results.replace(replace, this.dumpPreservedNodes(nodes, startIndent));
        });

        if (this.options.endNewline) {
            results += "\n";
        }

        return results;
    }

    fromStructure(structure: string): string {
        const reflowedContent = this.reflowSlugs(structure);

        this.structureLines = StringUtilities.breakByNewLine(reflowedContent);
        let results = this.transformInlineConditions(reflowedContent);
        results = this.transformConditions(results);
        results = this.transformInlineAntlers(results);
        results = this.transformComments(results);
        results = this.transformVirtualStructures(results);
        results = this.transformDynamicAntlers(results);
        results = this.transformPairedAntlers(results);
        results = this.cleanVirtualStructures(results);
        results = this.cleanLines(results);
        //results = this.removeVirtualStructures(results);

        // results = this.cleanStructuralNewLines(results);

        if (this.doc.hasFrontMatter()) {
            let frontMatter = this.doc.getFrontMatter();

            const frontMatterDoc = this.doc.getFrontMatterDoc();

            if (frontMatterDoc != null && frontMatterDoc.isValid && this.yamlFormatter != null) {
                frontMatter = this.yamlFormatter(frontMatter);
            }

            const insertFrontMatter = `---\n${frontMatter}\n---\n` + "\n".repeat(this.options.newlinesAfterFrontMatter);

            results = insertFrontMatter + results.trimLeft();
        }

        results = results.trimRight();

        this.ignoredLiteralBlocks.forEach((nodes, slug) => {
            const replace = this.selfClosing(slug),
                startIndent = this.indentLevel(replace);

            results = results.replace(replace, this.dumpPreservedNodes(nodes, startIndent));
        });

        if (this.options.endNewline) {
            results += "\n";
        }

        return results;
    }

    private dumpPreservedNodes(nodes: AbstractNode[], finalIndent: number): string {
        let stringResults = '';

        nodes.forEach((node) => {
            if (node instanceof LiteralNode) {
                stringResults += node.sourceContent;
            } else if (node instanceof ConditionNode) {
                stringResults += node.nodeContent;
            } else if (node instanceof EscapedContentNode) {
                stringResults += node.documentText;
            } else if (node instanceof AntlersNode) {
                if (node.isComment) {
                    if (node.content.trim().toLowerCase() == this.formatIgnoreEnd) {
                        let preservedLines = stringResults.split("\n");
                        if (preservedLines.length > 0) {
                            if (preservedLines[preservedLines.length - 1].trim().length == 0) {
                                preservedLines.pop();
                                preservedLines.push('');

                                stringResults = preservedLines.join("\n");
                            }
                        }
                        stringResults += ' '.repeat(finalIndent) + '{{#' + node.content + '#}}';
                    } else {
                        stringResults += '{{#' + node.content + '#}}';
                    }

                    return;
                }

                if (node.isPaired()) {
                    stringResults += node.nodeContent;
                } else {
                    stringResults += '{{' + node.content + '}}';
                }
            }
        });

        return stringResults;
    }
}