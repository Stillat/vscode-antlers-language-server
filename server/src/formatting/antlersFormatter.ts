// eslint-disable-next-line @typescript-eslint/no-var-requires
const beautify = require("js-beautify").html;

import { AntlersDocument } from '../runtime/document/antlersDocument';
import { AbstractNode, AntlersNode, ConditionNode, LiteralNode } from '../runtime/nodes/abstractNode';
import { replaceAllInString } from '../utils/strings';
import { getFormatOption, getTagsFormatOption, IHTMLFormatConfiguration } from './htmlCompat';

export interface AntlersFormattingOptions {
	htmlOptions: IHTMLFormatConfiguration,
	tabSize: number,
	insertSpaces: boolean
}

export class AntlersFormatter {
	private antlersRegions:Map<string, AntlersNode> = new Map();
	private conditionRegions:Map<string, AntlersNode> = new Map();
	private pruneList:string[] = [];

	formatDocumentNodes(nodes:AbstractNode[], options:AntlersFormattingOptions) : string {
		let rootText = '';
		const content_unformatted:string[] = [],
			antlersSingleNodes:Map<string, AntlersNode> = new Map(),
			includesEnd = false;

		nodes.forEach((node) => {
			if (node instanceof LiteralNode) {
				rootText += node.rawContent();
			} else if (node instanceof AntlersNode) {
				if (node.isSelfClosing || node.isClosedBy == null) {
					const elementConstruction = '<span ANTLR_' + node.index.toString() + ' />';
					//content_unformatted.push(elementConstruction);
					rootText += elementConstruction;
					antlersSingleNodes.set(elementConstruction, node);
				} else if (node.children.length > 0) {
					const formatChildren = node.children;
					formatChildren.pop(); // Remove self-reference closing tag pair.
					const tChildResult = this.formatDocumentNodes(formatChildren, options);
					const elementConstruction = '<ANTLR_' + node.index.toString() + '>';
					const closeConstruct = '</ANTLR_' + node.index.toString() + '>';
					this.antlersRegions.set(elementConstruction, node);
					rootText += elementConstruction + tChildResult + closeConstruct;
				}
			} else if (node instanceof ConditionNode) {
				for (let i = 0; i < node.logicBranches.length; i++) {
					const logicBranch = node.logicBranches[i];

					if (logicBranch.head == null) { continue; }
					
					const logicChildren = logicBranch.head.children;
					logicChildren.pop();

					const tChildResult = this.formatDocumentNodes(logicChildren, options);
					const elementConstruction = '<ANTLER_COND' + logicBranch.head.index.toString() + '>';
					const closeConstruct = '</ANTLER_COND' + logicBranch.head.index.toString() + '>';
					this.conditionRegions.set(elementConstruction, logicBranch.head);
					rootText += elementConstruction + tChildResult + closeConstruct;
				}
			} else {
				const howdy = 'there';
			}
		});

		let tResult = beautify(rootText, {
			indent_size: options.tabSize,
			indent_char: options.insertSpaces ? " " : "\t",
			indent_empty_lines: getFormatOption(options.htmlOptions, "indentEmptyLines", false),
			wrap_line_length: getFormatOption(options.htmlOptions, "wrapLineLength", 120),
			unformatted: getTagsFormatOption(options.htmlOptions, "unformatted", void 0),
			content_unformatted: content_unformatted,
			indent_inner_html: getFormatOption(options.htmlOptions, "indentInnerHtml", false),
			preserve_newlines: getFormatOption(options.htmlOptions, "preserveNewLines", true),
			max_preserve_newlines: getFormatOption(
				options.htmlOptions,
				"maxPreserveNewLines",
				32786
			),
			indent_handlebars: getFormatOption(options.htmlOptions, "indentHandlebars", false),
			end_with_newline:
				includesEnd && getFormatOption(options.htmlOptions, "endWithNewline", false),
			extra_liners: getTagsFormatOption(options.htmlOptions, "extraLiners", void 0),
			wrap_attributes: getFormatOption(options.htmlOptions, "wrapAttributes", "auto"),
			wrap_attributes_indent_size: getFormatOption(
				options.htmlOptions,
				"wrapAttributesIndentSize",
				void 0
			),
			eol: "\n",
			indent_scripts: getFormatOption(options.htmlOptions, "indentScripts", "normal"),
			unformatted_content_delimiter: getFormatOption(
				options.htmlOptions,
				"unformattedContentDelimiter",
				""
			),
		}) as string;

		antlersSingleNodes.forEach((node, construction) => {
			tResult = replaceAllInString(tResult, construction, node.getTrueRawContent());
		});

		return tResult;
	}

	formatDocument(doc:AntlersDocument, options:AntlersFormattingOptions) {
		const rootNodes = doc.getDocumentParser().getRenderNodes();
		
		let documentRootFormatted = this.formatDocumentNodes(rootNodes, options);
		
		this.antlersRegions.forEach((node, construction) => {
			const tOpenContent = node.getTrueRawContent().trim(),
				closeConstruct = '</ANTLR_' + node.index.toString() + '>';
			let tCloseContent = '';

			if (node.isClosedBy != null) {
				tCloseContent = node.isClosedBy.getTrueRawContent().trim();
			}

			documentRootFormatted = replaceAllInString(documentRootFormatted, construction, tOpenContent);
			documentRootFormatted = replaceAllInString(documentRootFormatted, closeConstruct, tCloseContent);
		});

		this.conditionRegions.forEach((node, construction) => {
			const closeConstruct = '</ANTLER_COND' + node.index.toString() + '>';
			let doReplaceClose = true;

			if (node.isClosedBy != null && node.isClosedBy.name?.name != 'if') {
				this.pruneList.push(closeConstruct.toLowerCase());
				doReplaceClose = false;
			}

			documentRootFormatted = replaceAllInString(documentRootFormatted, construction, node.getTrueRawContent().trim());

			if (doReplaceClose) {
				const tCloseContent = node.isClosedBy?.getTrueRawContent().trim() ?? '';

				documentRootFormatted = replaceAllInString(documentRootFormatted, closeConstruct, tCloseContent);
			}
		});

		if (this.pruneList.length > 0) {
			const rLines = documentRootFormatted.replace(/(\r\n|\n|\r)/gm, "\n").split("\n");
			const nLines:string[] = [];

			rLines.forEach((line) => {
				if (this.pruneList.includes(line.trim().toLowerCase())) {
					return;
				}

				nLines.push(line);
			});

			documentRootFormatted = nLines.join("\n");
		}


		console.log(documentRootFormatted);
		return 'Hello';
	}

}