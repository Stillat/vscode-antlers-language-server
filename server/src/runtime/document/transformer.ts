import { replaceAllInString } from '../../utils/strings';
import { AbstractNode, AntlersNode, ConditionNode, EscapedContentNode, ExecutionBranch, FragmentPosition, LiteralNode, PhpExecutionNode } from '../nodes/abstractNode';
import { StringUtilities } from '../utilities/stringUtilities';
import { AntlersDocument } from './antlersDocument';
import { AntlersPrinter } from './printers/antlersPrinter';
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
    private options: TransformOptions;

    constructor(doc: AntlersDocument) {
        this.doc = doc;

        this.options = {
            tabSize: 4,
            newlinesAfterFrontMatter: 1,
            maxAntlersStatementsPerLine: 3,
            endNewline: true
        };
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

    private prepareNoParse(node: EscapedContentNode): string {
        const slug = this.makeSlug(35),
            open = this.open(slug),
            close = this.close(slug),
            virtualElement = this.makeSlug(25);

        this.registerVirtualBlock({
            pairOpen: open,
            pairClose: close,
            virtualElement: virtualElement,
            node: node
        });

        return this.pair(slug, this.pair(virtualElement));
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
                const replaceNoParse = "{{ noparse }}\n" + IndentLevel.shiftClean(
                    block.node.getInnerDocumentText(), this.options.tabSize
                );
                value = value.replace(block.pairOpen, replaceNoParse);
            }

            if (block.node instanceof AntlersNode) {
                const antlersNode = block.node as AntlersNode;

                value = value.replace(block.pairClose, antlersNode.isClosedBy?.getOriginalContent() as string);

            } else {
                this.removeLines.push(block.pairClose);
            }
        });

        return value;
    }

    private printNode(node: AntlersNode) {
        return NodePrinter.prettyPrintNode(node, this.doc, 0, this.options, null, null);
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
                    this.removeLines.push(structure.pairClose);
                    value = value.replace(structure.pairOpen, this.printNode(structureTag));
                } else {
                    value = value.replace(structure.pairOpen, this.printNode(structureTag));
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

    private prepareCondition(node: ConditionNode) {
        const headNode = node.logicBranches[0].head as AntlersNode;

        if (headNode.fragmentPosition == FragmentPosition.InsideFragment) {
            const slug = this.makeSlug(node.nodeContent.length);

            this.registerInlineCondition(slug, node);

            return slug;
        }

        if (headNode.fragmentPosition == FragmentPosition.IsDynamicFragmentName) {
            return this.prepareDynamicCondition(node);
        }

        const transformedBranches: TransformedLogicBranch[] = [];
        let result = '';

        node.logicBranches.forEach((branch, index) => {
            const tag = branch.head as AntlersNode,
                innerDoc = branch.childDocument?.document.transform().setParentTransformer(this).toStructure() as string;
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
                    result += tBranch.virtualBreakOpen + "\n";
                    result += innerDoc;
                    result += "\n" + tBranch.virtualBreakClose + "\n" + tBranch.pairClose;
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


                    result += tBranch.pairOpen;
                    result += "\n" + tBranch.virtualBreakOpen;
                    result += innerDoc;
                    result += "\n" + tBranch.virtualBreakClose;
                    result += tBranch.pairClose;
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
            innerDoc = node.childDocument?.document.transform().setParentTransformer(this).toStructure() as string;

        if (node.fragmentPosition != FragmentPosition.IsDynamicFragmentName) {
            let virtualSlug = '';
            let result = `${this.open(slug)}\n`;

            if (node.containsChildStructures == false && node.containsAnyFragments == false) {
                virtualSlug = this.makeSlug(15);
                result += this.pair(virtualSlug, innerDoc);
            } else {
                result += innerDoc;
            }

            result += `${this.close(slug)}\n`;

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
            this.dynamicElementAntlers.set(node.documentText, slug);
            this.parentTransformer.registerDynamicAntlers(slug, node);
        } else {
            this.dynamicElementAntlers.set(node.documentText, slug);
            this.dynamicElementAntlersNodes.set(slug, node);
        }
    }

    private prepareConditionalAntlers(node: AntlersNode): string {
        if (this.dynamicElementAntlers.has(node.documentText)) {
            return this.dynamicElementAntlers.get(node.documentText) as string;
        }

        const slug = this.makeSlug(node.documentText.length);

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

            value = value.replace(open, this.printNode(originalTag));

            value = value.replace(close, originalTag.isClosedBy?.getOriginalContent() as string);
        });

        return value;
    }

    private transformInlineAntlers(content: string): string {
        let value = content;

        this.inlineNodes.forEach((node: AntlersNode, slug: string) => {
            const inline = this.selfClosing(slug);

            value = value.replace(inline, this.printNode(node));
        });

        this.spanNodes.forEach((node: AntlersNode, slug: string) => {
            value = value.replace(slug, this.printNode(node));
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

            // TODO: Transform options.
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

    toStructure(): string {
        let result = '';

        // TODO: Php nodes/etc.
        const nodes = this.doc.getDocumentParser().getRenderNodes();
        nodes.forEach((node) => {
            if (node instanceof LiteralNode) {
                result += node.content;
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
            const referenceDocument = AntlersDocument.fromText(result);

            structures.forEach((pair) => {
                const ref = this.doc.getDocumentParser().getText((pair.start.endPosition?.offset ?? 0) + 1, pair.end.startPosition?.offset ?? 0),
                    refOpen = referenceDocument.getDocumentParser().getFragmentsParser().getEmbeddedFragment(pair.start.embeddedIndex),
                    refClose = referenceDocument.getDocumentParser().getFragmentsParser().getClosingFragmentAfter(refOpen),
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

    private indentLevel(value: string): number {
        for (let i = 0; i < this.structureLines.length; i++) {
            const thisLine = this.structureLines[i];

            if (thisLine.includes(value)) {
                const trimmed = thisLine.trimLeft();

                return thisLine.length - trimmed.length;
            }
        }
        return 0;
    }


    private forceCleanLines: string[] = [
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
            if (line.startsWith(this.forceCleanLines[i])) {
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
        // Step 1: Reflow lines that appear after a remove line.
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
        results = this.removeVirtualStructures(results);

        results = this.cleanStructuralNewLines(results);

        if (this.doc.hasFrontMatter()) {
            const frontMatter = this.doc.getFrontMatter(),
                insertFrontMatter = `---\n${frontMatter}\n---\n` + "\n".repeat(this.options.newlinesAfterFrontMatter);

            results = insertFrontMatter + results.trimLeft();
        }

        results = results.trimRight();

        if (this.options.endNewline) {
            results += "\n";
        }

        return results;
    }
}