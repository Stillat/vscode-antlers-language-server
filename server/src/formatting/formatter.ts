import { DocumentFormattingParams, DocumentRangeFormattingParams, Position, } from "vscode-languageserver-protocol";
import { Range, TextDocument, TextEdit, } from "vscode-languageserver-textdocument";
import { documentMap, sessionDocuments } from '../languageService/documents.js';
import { htmlFormatterSettings } from '../languageService/htmlFormatterSettings.js';
import { AntlersDocument } from '../runtime/document/antlersDocument.js';
import { getAntlersSettings } from '../server.js';
import { AntlersFormattingOptions } from './antlersFormattingOptions.js';
import { BeautifyDocumentFormatter } from './beautifyDocumentFormatter.js';
import { IHTMLFormatConfiguration } from "./htmlCompat.js";
import { commonIndent, completeLineRange, reindentFormattedRange } from "./rangeFormatting.js";

export async function formatAntlersDocument(params: DocumentFormattingParams): Promise<TextEdit[] | null> {
    const settings = getAntlersSettings();
    const documentPath = decodeURIComponent(params.textDocument.uri);
    const options = htmlFormatterSettings.format as IHTMLFormatConfiguration;

    if (settings.formatterIgnoreExtensions.length > 0) {
        for (let i = 0; i < settings.formatterIgnoreExtensions.length; i++) {
            if (documentPath.toLowerCase().endsWith(settings.formatterIgnoreExtensions[i].toLowerCase())) {
                return null;
            }
        }
    }

    if (sessionDocuments.hasDocument(documentPath) && documentMap.has(documentPath)) {
        const document = documentMap.get(documentPath) as TextDocument,
            docText = document.getText(),
            antlersDoc = AntlersDocument.fromText(docText),
            antlersFormatterOptions: AntlersFormattingOptions = {
                htmlOptions: options,
                formatFrontMatter: settings.formatFrontMatter,
                insertSpaces: params.options.insertSpaces,
                tabSize: params.options.tabSize,
                maxStatementsPerLine: 3,
                formatExtensions: [],
                arrayWrap: settings.formatterArrayWrap
            };

        const formatter = new BeautifyDocumentFormatter(antlersFormatterOptions),
            results = await formatter.formatDocumentAsync(antlersDoc, getAntlersSettings());

        const replaceEndPosition = document.positionAt(docText.length);


        const range: Range = {
            start: Position.create(0, 0),
            end: replaceEndPosition
        };

        return [
            {
                range: range,
                newText: results,
            },
        ];
    }

    return null;
}

export async function formatAntlersRange(
    params: DocumentRangeFormattingParams
): Promise<TextEdit[] | null> {
    const settings = getAntlersSettings();
    const documentPath = decodeURIComponent(params.textDocument.uri);

    if (settings.formatterIgnoreExtensions.some((extension) =>
        documentPath.toLowerCase().endsWith(extension.toLowerCase())
    )) {
        return null;
    }

    if (!documentMap.has(documentPath)) {
        return null;
    }

    const document = documentMap.get(documentPath) as TextDocument;
    const range = completeLineRange(document, params.range);
    const source = document.getText(range);

    if (source.trim().length === 0) {
        return [];
    }

    const indent = commonIndent(source);
    const dedented = source
        .split(/\r?\n/)
        .map((line) => line.startsWith(indent) ? line.slice(indent.length) : line)
        .join("\n");
    const options = htmlFormatterSettings.format as IHTMLFormatConfiguration;
    const formatter = new BeautifyDocumentFormatter({
        htmlOptions: options,
        formatFrontMatter: false,
        insertSpaces: params.options.insertSpaces,
        tabSize: params.options.tabSize,
        maxStatementsPerLine: 3,
        formatExtensions: [],
        arrayWrap: settings.formatterArrayWrap
    });
    const formatted = await formatter.formatDocumentAsync(
        AntlersDocument.fromText(dedented),
        settings
    );

    return [{
        range,
        newText: reindentFormattedRange(source, formatted)
    }];
}
