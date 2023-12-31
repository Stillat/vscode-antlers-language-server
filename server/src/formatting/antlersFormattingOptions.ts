import { IHTMLFormatConfiguration } from './htmlCompat.js';

export interface AntlersFormattingOptions {
    htmlOptions: IHTMLFormatConfiguration,
    tabSize: number,
    insertSpaces: boolean,
    formatFrontMatter: boolean,
    maxStatementsPerLine: number,
    formatExtensions: string[]
}
