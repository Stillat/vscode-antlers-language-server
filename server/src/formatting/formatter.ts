import { DocumentFormattingParams, Position, } from "vscode-languageserver-protocol";
import { Range, TextDocument, TextEdit, } from "vscode-languageserver-textdocument";
import { documentMap, sessionDocuments } from '../languageService/documents';
import { htmlFormatterSettings } from '../languageService/htmlFormatterSettings';
import { AntlersDocument } from '../runtime/document/antlersDocument';
import { getAntlersSettings } from '../server';
import { AntlersFormatter, AntlersFormattingOptions } from './antlersFormatter';
import { IHTMLFormatConfiguration } from "./htmlCompat";

export function formatAntlersDocument(params: DocumentFormattingParams): TextEdit[] | null {
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
            sessionDocument = sessionDocuments.getDocument(documentPath),
            docText = document.getText(),
            antlersDoc = AntlersDocument.fromText(docText),
            antlersFormatterOptions: AntlersFormattingOptions = {
                htmlOptions: options,
                formatFrontMatter: settings.formatFrontMatter,
                insertSpaces: params.options.insertSpaces,
                tabSize: params.options.tabSize,
                maxStatementsPerLine: 3,
                formatExtensions: []
            };

        AntlersFormatter.applyPositionsFromDocument(sessionDocument, antlersDoc);
        const formatter = new AntlersFormatter(antlersFormatterOptions),
            results = formatter.formatDocument(antlersDoc);

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
