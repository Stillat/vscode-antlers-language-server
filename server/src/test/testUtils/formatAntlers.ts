import { AntlersSettings } from '../../antlersSettings.js';
import { AntlersFormattingOptions } from '../../formatting/antlersFormattingOptions.js';
import { BeautifyDocumentFormatter } from '../../formatting/beautifyDocumentFormatter.js';
import { IHTMLFormatConfiguration } from '../../formatting/htmlCompat.js';
import { AntlersDocument } from '../../runtime/document/antlersDocument.js';

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