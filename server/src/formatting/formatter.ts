// eslint-disable-next-line @typescript-eslint/no-var-requires
const beautify = require('js-beautify').html;

import { DocumentFormattingParams, Position } from 'vscode-languageserver-protocol';
import { Range, TextDocument, TextEdit } from 'vscode-languageserver-textdocument';
import { AntlersParser } from '../antlers/parser';
import { htmlFormatterSettings } from '../server';
import { documentMap, parserInstances } from '../session';
import { getFormatOption, getTagsFormatOption, IHTMLFormatConfiguration } from './htmlCompat';

const Conditionals: string[] = ['if', 'elseif', 'else', '/if', 'unless', 'elseunless', '/unless'];

function balanceIfStatements(lines: string[]): string[] {
	const newLines: string[] = [],
		lineOffsets: number[] = [],
		leads: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const trimmedLine = lines[i].trim();

		if (trimmedLine.startsWith('{{ if')) {
			const startsAt = lines[i].indexOf('{{ if');

			lineOffsets.push(startsAt);
			newLines.push(lines[i]);
			leads.push(lines[i].substr(0, startsAt));

			continue;
		} else if (trimmedLine.startsWith('{{ elseif')) {
			const startsAt = lines[i].indexOf('{{ elseif'),
				adjustLine = lines[i].substr(startsAt),
				lead = leads[leads.length - 1];

			newLines.push(lead + adjustLine);

			continue;
		} else if (trimmedLine.startsWith('{{ else')) {
			const startsAt = lines[i].indexOf('{{ else'),
				adjustLine = lines[i].substr(startsAt),
				lead = leads[leads.length - 1];

			newLines.push(lead + adjustLine);

			continue;
		} else if (trimmedLine.startsWith('{{ /if')) {
			const startsAt = lines[i].indexOf('{{ /if'),
				adjustLine = lines[i].substr(startsAt),
				lead = leads[leads.length - 1];

			newLines.push(lead + adjustLine);

			lineOffsets.pop();
			leads.pop();
			continue;
		} else {
			newLines.push(lines[i]);
		}
	}

	return newLines;
}

function padTags(content: string): string {
	const newContent = content.split('');
	let addOpeningSpace = false,
		addClosingSpace = false;

	if (newContent.length >= 4) {
		if (newContent[0] == '{' && newContent[1] == '{' && newContent[2] != ' ') {
			addOpeningSpace = true;
		}

		if (newContent[newContent.length - 1] == '}' && newContent[newContent.length - 2] == '}' && newContent[newContent.length - 3] != ' ') {
			addClosingSpace = true;
		}
	}

	if (addOpeningSpace) {
		newContent.splice(2, 0, ' ');
	}

	if (addClosingSpace) {
		newContent.splice(newContent.length - 2, 0, ' ');
	}

	return newContent.join('');
}

export function formatAntlersDocument(params: DocumentFormattingParams): TextEdit[] | null {
	const documentPath = decodeURIComponent(params.textDocument.uri);
	const options = htmlFormatterSettings.format as IHTMLFormatConfiguration;

	if (documentMap.has(documentPath)) {
		const document = documentMap.get(documentPath) as TextDocument,
			parser = parserInstances.get(documentPath) as AntlersParser;
		let docText = document.getText().replace(/(\r\n|\n|\r)/gm, "\n");

		const symbols = parser.getSymbols(),
			replaceMapping: Map<string, string> = new Map(),
			ifPrefixMapping: Map<string, string> = new Map(),
			dumpMapping: Map<string, string> = new Map();

		for (let i = 0; i < symbols.length; i++) {
			const symb = symbols[i];
			let content = symb.content,
				formatTag = '';

			content = padTags(content);

			if (Conditionals.includes(symb.name)) {
				if (symb.name == '/if') {
					if (ifPrefixMapping.has(symb.id)) {
						const prefixId = ifPrefixMapping.get(symb.id) as string;

						formatTag = '</IF:' + prefixId + '>';
					} else {
						formatTag = '</IF:' + symb.id + '>';
					}
				} else {
					if (symb.isClosedBy != null) {

						ifPrefixMapping.set(symb.isClosedBy.id, symb.id);

						if (ifPrefixMapping.has(symb.id)) {
							const prefixId = ifPrefixMapping.get(symb.id) as string;

							formatTag = '</IF:' + prefixId + '>';
							formatTag += '<IF:' + symb.id + '>';
							replaceMapping.set('</IF:' + prefixId + '>', content);
							dumpMapping.set('<IF:' + symb.id + '>', '');
						} else {
							formatTag = '<IF:' + symb.id + '>';
						}
					}
				}
			} else {
				if (symb.isClosedBy == null) {
					if (symb.isClosingTag && symb.belongsTo != null) {
						formatTag = '</ANTLR:' + symb.belongsTo.id + '>';
					} else {
						formatTag = '<ANTLR:' + symb.id + ' />';
					}
				} else {
					formatTag = '<ANTLR:' + symb.id + '>';
				}
			}

			docText = docText.replace(symb.content, formatTag);
			replaceMapping.set(formatTag, content);
		}

		const includesEnd = docText.endsWith("\n");

		let formattingResults = beautify(docText, {
			indent_size: params.options.tabSize,
			indent_char: params.options.insertSpaces ? ' ' : '\t',			
			indent_empty_lines: getFormatOption(options, 'indentEmptyLines', false),
			wrap_line_length: getFormatOption(options, 'wrapLineLength', 120),
			//unformatted: getTagsFormatOption(options, 'unformatted', void 0),
			content_unformatted: getTagsFormatOption(options, 'contentUnformatted', void 0),
			indent_inner_html: getFormatOption(options, 'indentInnerHtml', false),
			preserve_newlines: getFormatOption(options, 'preserveNewLines', true),
			max_preserve_newlines: getFormatOption(options, 'maxPreserveNewLines', 32786),
			indent_handlebars: getFormatOption(options, 'indentHandlebars', false),
			end_with_newline: includesEnd && getFormatOption(options, 'endWithNewline', false),
			extra_liners: getTagsFormatOption(options, 'extraLiners', void 0),
			wrap_attributes: getFormatOption(options, 'wrapAttributes', 'auto'),
			wrap_attributes_indent_size: getFormatOption(options, 'wrapAttributesIndentSize', void 0),
			eol: '\n',
			indent_scripts: getFormatOption(options, 'indentScripts', 'normal'),
			/*templating: getTemplatingFormatOption(options, 'all'),*/
			unformatted_content_delimiter: getFormatOption(options, 'unformattedContentDelimiter', ''),
		});

		replaceMapping.forEach((content: string, formatTag: string) => {
			formattingResults = formattingResults.replace(formatTag, content);
		});

		const lines = formattingResults.replace(/(\r\n|\n|\r)/gm, "\n").split("\n");
		let newLines: string[] = [];

		for (let i = 0; i < lines.length; i++) {
			if (dumpMapping.has(lines[i].trim())) {
				continue;
			}

			newLines.push(lines[i]);
		}

		newLines = balanceIfStatements(newLines);

		formattingResults = newLines.join("\n");

		dumpMapping.forEach((content: string, format: string) => {
			formattingResults = formattingResults.replace(format, content);
		});

		const range: Range = {
			start: Position.create(0, 0),
			end: document.positionAt(docText.length)
		};

		return [{
			range: range,
			newText: formattingResults
		}];
	}

	return null;
}
