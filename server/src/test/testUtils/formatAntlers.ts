import { AntlersSettings } from '../../antlersSettings';
import { AntlersFormattingOptions } from '../../formatting/antlersFormattingOptions';
import { BeautifyDocumentFormatter } from '../../formatting/beautifyDocumentFormatter';
import { IHTMLFormatConfiguration } from '../../formatting/htmlCompat';
import { AntlersDocument } from '../../runtime/document/antlersDocument';

const defaultAntlersSettings: AntlersSettings = {
    formatFrontMatter: false,
    showGeneralSnippetCompletions: true,
    diagnostics: {
        warnOnDynamicCssClassNames: true,
        validateTagParameters: true,
        reportDiagnostics: true
    },
    trace: { server: 'off' },
    formatterIgnoreExtensions: ['xml'],
    languageVersion: 'runtime'
};
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



export function formatAntlers(text: string, options: AntlersFormattingOptions | null = null): string {
    if (options == null) {
        options = antlersOptions;
    }

    return (new BeautifyDocumentFormatter(options)).formatDocument(AntlersDocument.fromText(text), defaultAntlersSettings);
}