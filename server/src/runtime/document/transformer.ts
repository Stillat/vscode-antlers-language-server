import { HTMLFormatter, PHPFormatter, YAMLFormatter } from '../../formatting/formatters';
import { replaceAllInString } from '../../utils/strings';
import { ConditionPairAnalyzer } from '../analyzers/conditionPairAnalyzer';
import { AbstractNode, AntlersNode, ConditionNode, EscapedContentNode, ExecutionBranch, FragmentPosition, LiteralNode } from '../nodes/abstractNode';
import { StringUtilities } from '../utilities/stringUtilities';
import { AntlersDocument } from './antlersDocument';
import { CommentPrinter } from './printers/commentPrinter';
import { IndentLevel } from './printers/indentLevel';
import { NodePrinter } from './printers/nodePrinter';
import { TransformOptions } from './transformOptions';

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

    private htmlFormatter: HTMLFormatter | null = null;
    private yamlFormatter: YAMLFormatter | null = null;
    private phpFormatter: PHPFormatter | null = null;

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
    private extractedEmbeddedDocuments: Map<string, EmbeddedDocument> = new Map();
    private dynamicElementAntlers: Map<string, string> = new Map();
    private dynamicElementAntlersNodes: Map<string, AntlersNode> = new Map();
    private dynamicElementPairedAntlers: Map<string, string> = new Map();
    private dynamicElementPairedAntlersNodes: Map<string, AntlersNode> = new Map();
    private dynamicElementConditionAntlers: Map<string, string> = new Map();
    private dynamicElementConditionAntlersNodes: Map<string, ConditionNode> = new Map();
    private noParses: Map<string, EscapedContentNode> = new Map();
    private options: TransformOptions;
    private forceBreaks: string[] = [];

    constructor(doc: AntlersDocument) {
        this.doc = doc;

        this.options = {
            tabSize: 4,
            newlinesAfterFrontMatter: 1,
            maxAntlersStatementsPerLine: 3,
            endNewline: true
        };
    }

    produceExtraStructuralPairs(doCreate: boolean) {
        this.createExraStructuralPairs = doCreate;

        return this;
    }

    withHtmlFormatter(formatter: HTMLFormatter | null) {
        this.htmlFormatter = formatter;

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

    private pair(value: string, innerContent = ''): string {
        return '<' + value + '>' + innerContent + '</' + value + '>';
    }

    private makeSlug(length: number): string {
        if (length <= 2) {
            length = 7;
        }

        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
            charactersLength = characters.length;

        for (let i = 0; i < length - 1; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }

        const slug = 'A' + result + 'A';

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

            return `{{ ${printNode.content.trim()} }}`;
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

                    if (value.includes(virtualInline)) {
                        value = value.replace(virtualInline, structure.doc.trim());
                    }

                    this.removeLines.push(structure.pairClose);
                    value = value.replace(structure.pairOpen, this.printNode(structureTag, this.indentLevel(structure.pairOpen)));
                } else {
                    const virtualInline = this.selfClosing(structure.virtualSlug);

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

    private transformExtractedDocuments(content: string): string {
        let value = content;

        this.extractedEmbeddedDocuments.forEach((document, slug) => {
            let target = '',
                indent = 0;

            if (document.isScript) {
                target = '//' + slug;
            } else {
                target = '/*' + slug + '*/';
            }

            indent = this.indentLevel(target);

            if (value.includes(target)) {
                value = value.replace(target, IndentLevel.indentRelative(document.content, indent));
            }
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
            const inline = this.selfClosing(slug);
            const level = this.indentLevel(inline);
            value = value.replace(inline, this.printNode(node, this.indentLevel(inline)));
        });

        this.spanNodes.forEach((node: AntlersNode, slug: string) => {
            let level = 0;

            if (node.isVirtual && (node.name?.name == 'switch' || node.name?.name == 'list')) {
                level = this.indentLevel(slug, true);
            }

            value = value.replace(slug, this.printNode(node, level));
        });

        return value;
    }

    private transformComments(content: string): string {
        let value = content;

        this.inlineComments.forEach((comment, slug) => {
            const open = this.selfClosing(slug);

            value = value.replace(open, CommentPrinter.printComment(comment, this.options.tabSize, 0));
        });

        this.blockComments.forEach((structure) => {
            const comment = structure.node as AntlersNode;

            value = value.replace(structure.pairOpen, CommentPrinter.printComment(comment, this.options.tabSize, this.indentLevel(structure.pairOpen)));
            this.removeLines.push(structure.pairClose);
            this.removeLines.push(structure.virtualElement);
        });

        return value;
    }

    private registerEmbeddedDocument(slug: string, content: string, isScript: boolean): string {
        if (this.parentTransformer != null) {
            return this.parentTransformer.registerEmbeddedDocument(slug, content, isScript);
        }

        this.extractedEmbeddedDocuments.set(slug, {
            slug: slug,
            content: content,
            isScript: isScript
        });

        return slug;
    }

    clone(): Transformer {
        const cloned = new Transformer(this.doc);
        cloned.withOptions(this.options).setParentTransformer(this);

        return cloned;
    }

    toStructure(renderNodes: AbstractNode[] | null = null): string {
        let result = '';

        if (renderNodes == null) {
            renderNodes = this.doc.getDocumentParser().getRenderNodes();
        }

        renderNodes.forEach((node) => {
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
                    result += this.prepareComment(node);
                } else {
                    result += this.prepareAntlers(node);
                }
            }
        });

        const structures = this.doc.getDocumentParser().getFragmentsContainingStructures();

        if (structures.length > 0) {
            const referenceDocument = new AntlersDocument();
            referenceDocument.loadString(result);

            structures.forEach((pair) => {
                const ref = this.doc.getDocumentParser().getText((pair.start.endPosition?.offset ?? 0) + 1, pair.end.startPosition?.offset ?? 0),
                    refOpen = referenceDocument.getDocumentParser().getFragmentsParser().getEmbeddedFragment(pair.start.embeddedIndex);

                if (refOpen == null) { return; }
                const refClose = referenceDocument.getDocumentParser().getFragmentsParser().getClosingFragmentAfter(refOpen);
                if (refClose == null) { return; }

                const
                    curRef = referenceDocument.getDocumentParser().getText((refOpen.endPosition?.offset ?? 0) + 1, refClose?.startPosition?.offset ?? 0),
                    refSlug = this.makeSlug(16),
                    isScript = pair.start.name.toLowerCase() == 'script';

                let replaceSlug = refSlug;

                if (isScript) {
                    replaceSlug = '//' + refSlug;
                } else {
                    replaceSlug = '/*' + refSlug + '*/';
                }

                result = result.replace(curRef, replaceSlug);

                this.registerEmbeddedDocument(refSlug, ref, isScript);
            });
        }

        return result;
    }

    private removeVirtualStructures(content: string): string {
        let value = content;

        this.removeLines.forEach((line) => {
            value = value.replace(line, '');
        });

        return value;
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

    private cleanStructuralNewLines(content: string): string {
        const lines: string[] = StringUtilities.breakByNewLine(content),
            newLines: string[] = [];

        let pruneLines = false;

        lines.forEach((line) => {
            const checkLine = line.trim();

            if (checkLine.startsWith('{{') && checkLine.endsWith('}}')) {
                newLines.push(line);
                pruneLines = true;
                return;
            }

            if (pruneLines && checkLine.length > 0) {
                pruneLines = false;
            }

            if (!pruneLines) {
                newLines.push(line);
            }
        });

        return newLines.join("\n");
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

    private cleanLines(content:string): string {
        const lines:string[] = StringUtilities.breakByNewLine(content),
            newLines:string[] = [];

        let pruneLines = false,
            prunedCount = 0,
            isProbablyOpen = false;
        for (let i = 0; i < lines.length; i++) {
            const checkLine = lines[i].trim(),
                line = lines[i];

            if (checkLine.startsWith('{{') && checkLine.endsWith('}}')) {
                if (pruneLines) {
                    prunedCount =0;
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
        results = this.transformExtractedDocuments(results);
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

        if (this.options.endNewline) {
            results += "\n";
        }

        return results;
    }
}