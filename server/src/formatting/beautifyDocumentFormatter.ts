import beautify from 'js-beautify';
import { AntlersFormattingOptions } from './antlersFormattingOptions.js';
import { DocumentFormatter } from './documentFormatter.js';
import { FrontMatterFormatter } from './frontMatterFormatter.js';
import { getFormatOption, getTagsFormatOption } from './htmlCompat.js';

export class BeautifyDocumentFormatter extends DocumentFormatter {
    private options: AntlersFormattingOptions;

    constructor(options: AntlersFormattingOptions) {
        super();

        this.options = options;
        this.withHtmlFormatter(this.formatHtml)
            .withYamlFormatter(FrontMatterFormatter.formatFrontMatter)
            .withTransformOptions({
                endNewline: getFormatOption(options.htmlOptions, "endWithNewline", false) as boolean,
                maxAntlersStatementsPerLine: options.maxStatementsPerLine,
                newlinesAfterFrontMatter: 1,
                tabSize: options.tabSize
            });
    }

    formatHtml(input: string): string {
        return beautify.html(input, {
            indent_size: this.options.tabSize,
            indent_char: this.options.insertSpaces ? " " : "\t",
            indent_empty_lines: getFormatOption(this.options.htmlOptions, "indentEmptyLines", false),
            wrap_line_length: getFormatOption(this.options.htmlOptions, "wrapLineLength", 120),
            unformatted: getTagsFormatOption(this.options.htmlOptions, "unformatted", []) ?? [],
            content_unformatted: [],
            indent_inner_html: getFormatOption(this.options.htmlOptions, "indentInnerHtml", false),
            preserve_newlines: getFormatOption(this.options.htmlOptions, "preserveNewLines", true),
            max_preserve_newlines: getFormatOption(
                this.options.htmlOptions,
                "maxPreserveNewLines",
                32786
            ),
            indent_handlebars: getFormatOption(this.options.htmlOptions, "indentHandlebars", false),
            end_with_newline: getFormatOption(this.options.htmlOptions, "endWithNewline", false),
            extra_liners: [], //getTagsFormatOption(this.this.options.htmlOptions, "extraLiners", []),
            wrap_attributes: getFormatOption(this.options.htmlOptions, "wrapAttributes", "auto"),
            wrap_attributes_indent_size: getFormatOption(
                this.options.htmlOptions,
                "wrapAttributesIndentSize",
                void 0
            ),
            eol: "\n",
            indent_scripts: getFormatOption(this.options.htmlOptions, "indentScripts", "normal"),
            unformatted_content_delimiter: getFormatOption(
                this.options.htmlOptions,
                "unformattedContentDelimiter",
                ""
            ),
        }) as string;
    }    
}