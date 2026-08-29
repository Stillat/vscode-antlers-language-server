import { ArrayWrapStyle } from './runtime/document/transformOptions.js';

export interface ServerTrace {
    server: string;
}

export interface AntlersDiagnosticsSettings {
    warnOnDynamicCssClassNames: boolean;
    validateTagParameters: boolean;
    reportDiagnostics: boolean;
}

export interface AntlersSettings {
    formatFrontMatter: boolean;
    showGeneralSnippetCompletions: boolean;
    diagnostics: AntlersDiagnosticsSettings;
    trace: ServerTrace;
    formatterIgnoreExtensions: string[];
    formatterArrayWrap?: ArrayWrapStyle;
    languageVersion: string;
}
