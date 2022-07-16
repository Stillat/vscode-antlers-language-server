import { AntlersFormattingOptions } from '../../formatting/antlersFormattingOptions';
import { BeautifyDocumentFormatter } from '../../formatting/BeautifyDocumentFormatter';
import { IHTMLFormatConfiguration } from '../../formatting/htmlCompat';
import { AntlersDocument } from '../../runtime/document/antlersDocument';

const htmlOptions: IHTMLFormatConfiguration = {
    wrapLineLength: 500,

};
const antlersOptions: AntlersFormattingOptions = {
    htmlOptions: htmlOptions,
    tabSize: 4,
    insertSpaces: true,
    formatFrontMatter: true,
    maxStatementsPerLine: 3,
    formatExtensions: []
};

export function formatAntlers(text: string): string {
    return (new BeautifyDocumentFormatter(antlersOptions)).formatDocument(AntlersDocument.fromText(text));
}