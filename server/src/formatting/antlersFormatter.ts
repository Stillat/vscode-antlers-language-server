// eslint-disable-next-line @typescript-eslint/no-var-requires
const beautify = require("js-beautify").html;

import { AntlersDocument } from '../runtime/document/antlersDocument';
import { AbstractNode, AdditionOperator, AntlersNode, ArgSeparator, ConditionNode, DivisionOperator, InlineBranchSeparator, InlineTernarySeparator, LeftAssignmentOperator, LiteralNode, LogicGroupBegin, LogicGroupEnd, ModifierNameNode, ModifierSeparator, ModifierValueNode, ModifierValueSeparator, MultiplicationOperator, NumberNode, ParameterNode, ScopeAssignmentOperator, StatementSeparatorNode, StringValueNode, TupleListStart, VariableNode } from '../runtime/nodes/abstractNode';
import { LanguageParser } from '../runtime/parser/languageParser';
import { NodeHelpers } from '../runtime/utilities/nodeHelpers';
import { replaceAllInString } from '../utils/strings';
import { FrontMatterFormatter } from './frontMatterFormatter';
import { getFormatOption, getTagsFormatOption, IHTMLFormatConfiguration } from './htmlCompat';
import { GenericPrinters } from './printers/genericPrinters';

export interface AntlersFormattingOptions {
    htmlOptions: IHTMLFormatConfiguration,
    tabSize: number,
    insertSpaces: boolean,
    formatFrontMatter: boolean,
    maxStatementsPerLine: number
}

interface IExtractedFrontMatter {
    frontMatter: string;
    documentContents: string;
}

function extractFrontMatter(contents: string): IExtractedFrontMatter {
    if (contents.trim().length == 0) {
        return {
            documentContents: contents,
            frontMatter: "",
        };
    }
    const analysisDocument = contents.trim();

    let lines = analysisDocument.replace(/(\r\n|\n|\r)/gm, "\n").split("\n");

    if (lines.length <= 1) {
        return {
            documentContents: contents,
            frontMatter: "",
        };
    }

    if (lines[0].trim().startsWith("---") == false) {
        return {
            documentContents: contents,
            frontMatter: "",
        };
    }

    let breakAtIndex = 0;
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim().startsWith("---")) {
            breakAtIndex = i;
            break;
        }
    }

    const frontMatterLines = lines.slice(0, breakAtIndex + 1);

    lines = lines.slice(breakAtIndex + 1);

    return {
        documentContents: lines.join("\n"),
        frontMatter: frontMatterLines.join("\n"),
    };
}

class NodeBuffer {
    private baseIndent: number;
    private buffer = '';
    private closeString = '';

    constructor(node: AntlersNode, indent: number, prepend: string | null) {
        this.baseIndent = indent;

        if (node.isInterpolationNode) {
            this.buffer = '{';
            this.closeString = '}';
        } else {
            this.buffer = '{{ ';
            this.closeString = ' }}';
        }

        if (prepend != null && prepend.trim().length > 0) {
            this.buffer += prepend + ' ';
        }
    }

    close() {
        if (this.closeString == ' }}') {
            if (this.buffer.endsWith(' ')) {
                this.buffer += '}}';
            } else {
                this.buffer += this.closeString;
            }
        } else {
            this.buffer += this.closeString;
        }

        return this;
    }

    appendT(text: string) {
        if (this.buffer.endsWith(' ')) {
            this.buffer = this.buffer.trimEnd();
        }

        this.buffer += text;

        return this;
    }

    appendTS(text: string) {
        if (this.buffer.endsWith(' ')) {
            this.buffer = this.buffer.trimEnd();
        }

        if (this.buffer.endsWith('{')) {
            text = text.trimStart();
        }

        this.buffer += text;

        return this;
    }

    append(text: string) {
        this.buffer += text;

        return this;
    }

    appendS(text: string) {
        let appendBuffer = '';

        if (this.buffer.endsWith(' ') == false) {
            appendBuffer += ' ';
        }

        appendBuffer += text + ' ';

        this.buffer += appendBuffer;

        return this;
    }

    indent() {
        let repeatCount = this.baseIndent;

        if (repeatCount == 0) { repeatCount = 1; } else { repeatCount += 2; }

        this.buffer += ' '.repeat(repeatCount);

        return this;
    }

    addIndent(number: number) {
        if (number <= 0) { return; }

        this.buffer += ' '.repeat(number);

        return this;
    }

    paramS(param: ParameterNode) {
        let bParam = ' ';

        if (param.isVariableReference) {
            bParam += ':';
        }

        bParam += param.name + '=' + param.nameDelimiter + param.value + param.nameDelimiter;

        this.append(bParam);

        return this;
    }

    replace(find: string, replace: string) {
        this.buffer = replaceAllInString(this.buffer, find, replace);

        return this;
    }

    newlineIndent() {
        this.newLine();
        this.indent();

        return this;
    }

    newLine() {
        this.buffer += "\n";

        return this;
    }

    getContent() {
        return this.buffer;
    }
}

export class AntlersFormatter {
    private antlersRegions: Map<string, AntlersNode> = new Map();
    private conditionRegions: Map<string, AntlersNode> = new Map();
    private commentRegions: Map<string, AntlersNode> = new Map();
    private pruneList: string[] = [];
    private chopList: string[] = [];
    private formatOptions: AntlersFormattingOptions;
    private commentCount = 0;

    constructor(options: AntlersFormattingOptions) {
        this.formatOptions = options;
    }

    private tabIndent(): string {
        let indentSize = this.formatOptions.tabSize;

        if (indentSize <= 0) {
            indentSize = 4;
        }

        return ' '.repeat(indentSize);
    }

    private printComment(node: AntlersNode) {
        const commentText = node.getContent().trim();

        if (commentText.includes("\n")) {
            let contents = "{{#\n";

            const commentLines = commentText.replace(/(\r\n|\n|\r)/gm, "\n").split("\n");

            commentLines.forEach((line) => {
                contents += this.tabIndent() + line.trim() + "\n";
            });

            contents += "#}}";

            return contents;
        }

        return '{{# ' + commentText + ' #}}';
    }

    private prettyPrintNode(antlersNode: AntlersNode, doc: AntlersDocument, indent: number, prepend: string | null): string {
        if (antlersNode.isComment) {
            return this.printComment(antlersNode);
        }

        const lexerNodes = antlersNode.getTrueRuntimeNodes();
        let nodeStatements = 0;

        if (lexerNodes.length > 0) {
            const nodeBuffer = new NodeBuffer(antlersNode, indent, prepend);

            let lastPrintedNode: AbstractNode | null = null;


            for (let i = 0; i < lexerNodes.length; i++) {
                const node = lexerNodes[i];

                if (lastPrintedNode != null) {
                    if (node.endPosition?.isBefore(lastPrintedNode.startPosition)) {
                        continue;
                    }
                }

                let insertNlAfter = false;

                if (node instanceof LogicGroupEnd) {
                    if (node.next instanceof LogicGroupEnd == false && node.next != null) {
                        if (!LanguageParser.isOperatorType(node.next) || !LanguageParser.isAssignmentOperator(node.next)) {
                            if (node.next instanceof StatementSeparatorNode == false && node.next instanceof InlineBranchSeparator == false) {
                                if (!node.isSwitchGroupMember && !LanguageParser.isOperatorType(node.next)) {
                                    insertNlAfter = true;
                                }
                            }
                        }
                    }
                } else {
                    if (!node.prev?.isVirtual && node.prev?.isVirtualGroupOperatorResolve && node.prev.producesVirtualStatementTerminator) {
                        if (node.next != null) {
                            if (!(node.prev instanceof VariableNode)) {
                                nodeBuffer.newlineIndent();
                            }
                        }
                    }
                }

                if (node instanceof VariableNode) {
                    if (node.convertedToOperator) {
                        if (node.name == 'arr') {
                            nodeBuffer.appendT(' arr');
                        } else if (node.name == 'switch' || node.name == 'list') {
                            nodeBuffer.appendTS(' ' + node.name);

                            if (i + 1 < lexerNodes.length) {
                                const next = lexerNodes[i + 1];

                                if (!(next instanceof LogicGroupBegin)) {
                                    break;
                                }

                                // Keep <switch/list>( together, and start a new line for the conditions.

                                nodeBuffer.append('(');
                                if (node.name != 'list') {
                                    nodeBuffer.newlineIndent().indent();
                                }
                                i += 1;
                                lastPrintedNode = lexerNodes[i + 1];
                                continue;
                            } else {
                                break;
                            }
                        } else {
                            nodeBuffer.appendS(node.name);
                        }
                        lastPrintedNode = node;
                        continue;
                    }
                    if (node.mergeRefName != null && node.mergeRefName.trim().length > 0 && node.mergeRefName != node.name) {
                        nodeBuffer.append(node.mergeRefName.trim());
                    } else {
                        nodeBuffer.append(node.name.trim());
                    }
                } else if (node instanceof TupleListStart) {
                    nodeBuffer.appendTS(' list');

                    if (i + 1 < lexerNodes.length) {
                        const next = lexerNodes[i + 1];

                        if (!(next instanceof LogicGroupBegin)) {
                            break;
                        }

                        // Keep <switch/list>( together, and start a new line for the conditions.

                        nodeBuffer.append('(');
                        i += 1;
                        lastPrintedNode = lexerNodes[i + 1];
                        continue;
                    } else {
                        break;
                    }
                } else if (node instanceof ModifierSeparator) {
                    nodeBuffer.appendS('|');
                } else if (node instanceof InlineBranchSeparator) {
                    if (lastPrintedNode != null) {
                        if (node.startPosition?.isBefore(lastPrintedNode.endPosition)) {
                            continue;
                        }
                    }

                    if (node.next instanceof VariableNode) {
                        if (node.next.mergeRefName.startsWith(':')) {
                            continue;
                        }
                    }

                    if (doc.getDocumentParser().getLanguageParser().isMergedVariableComponent(node)) {
                        continue;
                    }

                    if (node.prev != null && node.next != null) {
                        if (NodeHelpers.distance(node.prev, node) <= 1 && NodeHelpers.distance(node.next, node) <= 1) {
                            nodeBuffer.append(':');
                            lastPrintedNode = node;
                            continue;
                        }
                    }

                    if (doc.getDocumentParser().getLanguageParser().isActualModifierSeparator(node)) {
                        nodeBuffer.append(':');
                        lastPrintedNode = node;
                        continue;
                    }

                    if (lastPrintedNode instanceof ModifierNameNode || lastPrintedNode instanceof ModifierValueNode) {
                        nodeBuffer.append(':');
                        lastPrintedNode = node;
                        continue;
                    }

                    nodeBuffer.appendS(':');
                } else if (node instanceof ModifierNameNode) {
                    nodeBuffer.append(node.name);
                } else if (node instanceof InlineTernarySeparator) {
                    nodeBuffer.appendS('?');
                } else if (node instanceof ModifierValueSeparator) {
                    if (doc.getDocumentParser().getLanguageParser().isMergedVariableComponent(node)) {
                        continue;
                    }
                    if (doc.getDocumentParser().getLanguageParser().isActualModifierSeparator(node)) {
                        nodeBuffer.append(':');
                        lastPrintedNode = node;
                        continue;
                    }

                    nodeBuffer.append(':');
                } else if (node instanceof ModifierValueNode) {
                    nodeBuffer.append(node.value.trim());
                } else if (node instanceof LogicGroupBegin) {
                    nodeBuffer.append('(');
                } else if (node instanceof LogicGroupEnd) {
                    nodeBuffer.append(')');
                } else if (node instanceof StringValueNode) {
                    if (doc.getDocumentParser().getLanguageParser().isMergedVariableComponent(node)) {
                        continue;
                    }

                    if (node.startPosition != null && node.endPosition != null) {
                        const originalDocText = doc.getText(node.startPosition.index, node.endPosition.index + 1);

                        nodeBuffer.append(originalDocText);
                    } else {
                        nodeBuffer.append(node.sourceTerminator + node.value + node.sourceTerminator);
                    }
                } else if (node instanceof ArgSeparator) {
                    if (node.isSwitchGroupMember) {
                        nodeBuffer.append(',')
                            .newlineIndent()
                            .indent();
                    } else {
                        nodeBuffer.append(', ');
                    }
                } else if (node instanceof NumberNode) {
                    lastPrintedNode = node;
                    if (doc.getDocumentParser().getLanguageParser().isMergedVariableComponent(node)) {
                        continue;
                    }

                    nodeBuffer.append(node.value?.toString() ?? '');
                } else if (node instanceof LeftAssignmentOperator) {
                    nodeBuffer.appendS('=');
                } else if (node instanceof ScopeAssignmentOperator) {
                    nodeBuffer.appendS('=>');
                } else if (node instanceof AdditionOperator) {
                    nodeBuffer.appendS('+');
                } else if (node instanceof MultiplicationOperator) {
                    nodeBuffer.appendS('*');
                } else if (node instanceof DivisionOperator) {
                    lastPrintedNode = node;

                    if (node.startPosition?.isBefore(antlersNode.nameEndsOn)) {
                        nodeBuffer.append('/');
                        continue;
                    }

                    if (doc.getDocumentParser().getLanguageParser().isMergedVariableComponent(node)) {
                        continue;
                    }

                    nodeBuffer.appendS('/');
                    continue;
                } else if (node instanceof StatementSeparatorNode) {
                    if (node.isListGroupMember) {
                        nodeBuffer.append(';')
                            .newlineIndent().indent().addIndent(7);

                        if (i + 1 < lexerNodes.length && (lexerNodes[i + 1] instanceof LogicGroupEnd) == false) {
                            nodeBuffer.indent();
                        }
                    } else {
                        nodeStatements += 1;

                        if (nodeStatements < this.formatOptions.maxStatementsPerLine) {
                            nodeBuffer.appendT('; ');
                        } else {
                            nodeBuffer.appendT(';').newlineIndent();
                            nodeStatements = 0;
                        }
                    }
                } else {
                    nodeBuffer.appendS(node.rawContent());
                }

                if (insertNlAfter) {
                    nodeBuffer.newlineIndent();
                }

                lastPrintedNode = node;
            }

            if (antlersNode.hasParameters) {
                antlersNode.parameters.forEach((param) => {
                    nodeBuffer.paramS(param);
                });
            }

            nodeBuffer.close();


            let bContent = nodeBuffer.getContent();

            if (antlersNode.processedInterpolationRegions.size > 0) {
                antlersNode.processedInterpolationRegions.forEach((region, key) => {
                    const iTResult = this.formatDocumentNodes(region, doc);
                    bContent = replaceAllInString(bContent, key, iTResult);
                });
            }

            return bContent;
        }

        return antlersNode.getTrueRawContent();
    }

    formatDocumentNodes(nodes: AbstractNode[], doc: AntlersDocument): string {
        let rootText = '';
        const unformatted: string[] = getTagsFormatOption(this.formatOptions.htmlOptions, "unformatted", void 0) ?? [];
        const content_unformatted: string[] = [],
            antlersSingleNodes: Map<string, AntlersNode> = new Map(),
            includesEnd = false;
        let lastLiteralNode: AbstractNode | null = null;

        nodes.forEach((node) => {
            if (node instanceof LiteralNode) {
                rootText += node.rawContent();
                lastLiteralNode = node;
            } else if (node instanceof AntlersNode) {
                if (node.isComment) {
                    this.commentCount += 1;
                    const commentConstruction = '__ANTLR_COMMENT' + this.commentCount.toString() + 'C';
                    this.commentRegions.set(commentConstruction, node);
                    rootText += commentConstruction;
                } else {
                    if (node.isSelfClosing || node.isClosedBy == null) {
                        const elementConstruction = '__ANTLR_' + node.refId;

                        rootText += elementConstruction;
                        antlersSingleNodes.set(elementConstruction, node);
                    } else if (node.children.length > 0) {
                        const formatChildren = node.children;
                        formatChildren.pop(); // Remove self-reference closing tag pair.
                        const tChildResult = this.formatDocumentNodes(formatChildren, doc);
                        const elementConstruction = '<ANTLR_' + node.refId + '>';
                        const closeConstruct = '</ANTLR_' + node.refId + '>';

                        this.antlersRegions.set(elementConstruction, node);
                        rootText += elementConstruction + "\n" + tChildResult + "\n" + closeConstruct;
                    }
                }
            } else if (node instanceof ConditionNode) {
                for (let i = 0; i < node.logicBranches.length; i++) {
                    const logicBranch = node.logicBranches[i];

                    if (logicBranch.head == null) { continue; }

                    const logicChildren = logicBranch.head.children;
                    logicChildren.pop();

                    const tChildResult = this.formatDocumentNodes(logicChildren, doc);
                    const elementConstruction = '<ANTLER_COND' + logicBranch.head.refId + '>';
                    const closeConstruct = '</ANTLER_COND' + logicBranch.head.refId + '>';
                    this.conditionRegions.set(elementConstruction, logicBranch.head);
                    rootText += elementConstruction + tChildResult + closeConstruct;
                }
            }
        });

        rootText = replaceAllInString(rootText, '<{{ as', '<ANTLER_COMMON_ALIAS');
        rootText = replaceAllInString(rootText, '</{{ as', '</ANTLER_COMMON_ALIAS');

        let tResult = beautify(rootText, {
            indent_size: this.formatOptions.tabSize,
            indent_char: this.formatOptions.insertSpaces ? " " : "\t",
            indent_empty_lines: getFormatOption(this.formatOptions.htmlOptions, "indentEmptyLines", false),
            wrap_line_length: getFormatOption(this.formatOptions.htmlOptions, "wrapLineLength", 120),
            unformatted: unformatted,
            content_unformatted: content_unformatted,
            indent_inner_html: getFormatOption(this.formatOptions.htmlOptions, "indentInnerHtml", false),
            preserve_newlines: getFormatOption(this.formatOptions.htmlOptions, "preserveNewLines", true),
            max_preserve_newlines: getFormatOption(
                this.formatOptions.htmlOptions,
                "maxPreserveNewLines",
                32786
            ),
            indent_handlebars: getFormatOption(this.formatOptions.htmlOptions, "indentHandlebars", false),
            end_with_newline:
                includesEnd && getFormatOption(this.formatOptions.htmlOptions, "endWithNewline", false),
            extra_liners: getTagsFormatOption(this.formatOptions.htmlOptions, "extraLiners", void 0),
            wrap_attributes: getFormatOption(this.formatOptions.htmlOptions, "wrapAttributes", "auto"),
            wrap_attributes_indent_size: getFormatOption(
                this.formatOptions.htmlOptions,
                "wrapAttributesIndentSize",
                void 0
            ),
            eol: "\n",
            indent_scripts: getFormatOption(this.formatOptions.htmlOptions, "indentScripts", "normal"),
            unformatted_content_delimiter: getFormatOption(
                this.formatOptions.htmlOptions,
                "unformattedContentDelimiter",
                ""
            ),
        }) as string;

        const indentLines = tResult.replace(/(\r\n|\n|\r)/gm, "\n").split("\n");

        antlersSingleNodes.forEach((node, construction) => {
            const constructionIndex = this.getIndent(construction, indentLines);
            tResult = replaceAllInString(tResult, construction, this.prettyPrintNode(node, doc, constructionIndex, null));
        });


        tResult = replaceAllInString(tResult, '<ANTLER_COMMON_ALIAS', '<{{ as');
        tResult = replaceAllInString(tResult, '</ANTLER_COMMON_ALIAS', '</{{ as');

        return tResult;
    }

    private getIndent(construction: string, lines: string[]): number {

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.includes(construction)) {
                const constructionIndex = line.indexOf(construction);

                if (constructionIndex >= 0) {
                    return constructionIndex + 1;
                }
            }
        }

        return 0;
    }

    static applyPositionsFromDocument(fromDoc: AntlersDocument, toDoc: AntlersDocument) {
        const fromNodes = fromDoc.getAllAntlersNodes(),
            toNodes = toDoc.getAllAntlersNodes();

        if (fromNodes.length != toNodes.length) {
            return;
        }

        for (let i = 0; i < fromNodes.length; i++) {
            const fromNode = fromNodes[i],
                toNode = toNodes[i];

            toNode.startPosition = fromNode.startPosition;
            toNode.endPosition = fromNode.endPosition;

            if (toNode.runtimeNodes.length == fromNode.runtimeNodes.length) {
                for (let j = 0; j < toNode.runtimeNodes.length; j++) {
                    const fromRuntimeNode = fromNode.runtimeNodes[j],
                        toRuntimeNode = toNode.runtimeNodes[j];

                    toRuntimeNode.startPosition = fromRuntimeNode.startPosition;
                    toRuntimeNode.endPosition = fromRuntimeNode.endPosition;
                }
            }
        }
    }

    formatDocument(doc: AntlersDocument) {
        if (doc.hasInvalidControlFlowStructures()) {
            return doc.getOriginalContent();
        }

        const rootNodes = doc.getDocumentParser().getRenderNodes();

        let documentRootFormatted = this.formatDocumentNodes(rootNodes, doc);

        const indentLines = documentRootFormatted.replace(/(\r\n|\n|\r)/gm, "\n").split("\n");

        this.antlersRegions.forEach((node, construction) => {
            const constructionIndex = this.getIndent(construction, indentLines);
            const tOpenPrettyPrint = this.prettyPrintNode(node, doc, constructionIndex, null),
                closeConstruct = '</ANTLR_' + node.refId + '>';
            let tCloseContent = '';

            if (node.isClosedBy != null) {
                tCloseContent = node.isClosedBy.getTrueRawContent().trim();
            }

            documentRootFormatted = replaceAllInString(documentRootFormatted, construction, tOpenPrettyPrint);
            documentRootFormatted = replaceAllInString(documentRootFormatted, closeConstruct, tCloseContent);
        });

        this.commentRegions.forEach((comment, construction) => {
            const constructionIndex = this.getIndent(construction, indentLines);
            const cPrettyPrint = this.prettyPrintNode(comment, doc, constructionIndex, null);
            documentRootFormatted = replaceAllInString(documentRootFormatted, construction, cPrettyPrint);
        });

        this.conditionRegions.forEach((node, construction) => {
            const closeConstruct = '</ANTLER_COND' + node.refId + '>';
            let doReplaceClose = true;

            const constructionIndex = this.getIndent(construction, indentLines),
                tOpenTrue = node.getTrueNode();

            if (node.isClosedBy != null) {
                const tCloseTrue = node.isClosedBy;
                if (tCloseTrue.startPosition != null && node.endPosition != null) {
                    if (tCloseTrue.startPosition.line == node.endPosition.line) {
                        this.chopList.push(closeConstruct + "\n");
                    }
                }
            }

            if (node.isClosedBy != null && node.isClosedBy.name?.name != 'if') {
                this.pruneList.push(closeConstruct.toLowerCase());
                this.chopList.push(closeConstruct);
                doReplaceClose = false;
            }


            let tOpenPrettyPrint = this.prettyPrintNode(tOpenTrue, doc, constructionIndex, tOpenTrue.runtimeName());
            let pushClose = false;
            if (node.isClosedBy != null) {
                const tCloseTrue = node.isClosedBy;
                if (tCloseTrue.startPosition != null && node.endPosition != null) {
                    if (tCloseTrue.startPosition.line != node.endPosition.line) {
                        tOpenPrettyPrint += "\n{{@cond_break@}}" + ' '.repeat(constructionIndex + 3);
                        pushClose = true;
                    }
                }
            }

            documentRootFormatted = replaceAllInString(documentRootFormatted, construction, tOpenPrettyPrint);

            if (doReplaceClose) {
                let tClosePrefix = '';

                if (pushClose) {
                    let closeConstructIndex = constructionIndex;

                    if (closeConstructIndex == 1) { closeConstructIndex = 0; }
                    tClosePrefix = "{{@cond_break@}}\n" + ' '.repeat(closeConstructIndex);
                }

                const trueCloseNode = node.isClosedBy?.getTrueNode();
                let trueName = trueCloseNode?.runtimeName();

                // Rewrite endunless to its proper /unless form.
                // It's not supported by either parser version
                // but it is easy to type it without thinking.
                // This just handles it for the developer.
                if (trueName?.toLowerCase() == 'endunless') {
                    trueName = 'unless';
                }

                let tCloseContent = tClosePrefix + '{{ ';

                if (trueName != 'endif') {
                    tCloseContent += '/';
                }

                tCloseContent += trueName + ' }}';

                documentRootFormatted = replaceAllInString(documentRootFormatted, closeConstruct, tCloseContent);
                documentRootFormatted = replaceAllInString(documentRootFormatted, closeConstruct, '');
            }
        });

        this.chopList.forEach((chop) => {
            documentRootFormatted = replaceAllInString(documentRootFormatted, chop, '');
        });

        const rLines = documentRootFormatted.replace(/(\r\n|\n|\r)/gm, "\n").split("\n");
        const nLines: string[] = [];

        rLines.forEach((line) => {
            if (this.pruneList.includes(line.trim().toLowerCase())) {
                return;
            }

            if (line.trim() == '{{@cond_break@}}') {
                return;
            }

            nLines.push(line);
        });

        documentRootFormatted = nLines.join("\n");

        documentRootFormatted = replaceAllInString(documentRootFormatted, '{{@cond_break@}}', '');

        if (doc.hasFrontMatter()) {
            const frontMatter = doc.getFrontMatter();

            if (this.formatOptions.formatFrontMatter) {
                documentRootFormatted = GenericPrinters.frontMatterBlock(FrontMatterFormatter.formatFrontMatter(frontMatter)) + documentRootFormatted;
            } else {
                documentRootFormatted = GenericPrinters.frontMatterBlock(frontMatter) + documentRootFormatted;
            }
        }


        return documentRootFormatted;
    }

}