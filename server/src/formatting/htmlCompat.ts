// Based on code from the vscode-html-languageservice codebase
// https://github.com/microsoft/vscode-html-languageservice/blob/main/src/services/htmlFormatter.ts
// Copyright Microsoft. Used under the MIT license.
// https://github.com/microsoft/vscode-html-languageservice/blob/main/LICENSE.md

export interface IHTMLFormatConfiguration {
    indentEmptyLines?: boolean;
    wrapLineLength?: number;
    unformatted?: string;
    contentUnformatted?: string;
    indentInnerHtml?: boolean;
    wrapAttributes?:
    | "auto"
    | "force"
    | "force-aligned"
    | "force-expand-multiline"
    | "aligned-multiple"
    | "preserve"
    | "preserve-aligned";
    wrapAttributesIndentSize?: number;
    preserveNewLines?: boolean;
    maxPreserveNewLines?: number;
    indentHandlebars?: boolean;
    endWithNewline?: boolean;
    extraLiners?: string;
    indentScripts?: "keep" | "separate" | "normal";
    templating?: boolean;
    unformattedContentDelimiter?: string;
}

export function getFormatOption(
    options: IHTMLFormatConfiguration,
    key: keyof IHTMLFormatConfiguration,
    dflt: any
): any {
    // eslint-disable-next-line no-prototype-builtins
    if (options && options.hasOwnProperty(key)) {
        const value = options[key];
        if (value !== null) {
            return value;
        }
    }
    return dflt;
}

export function getTagsFormatOption(
    options: IHTMLFormatConfiguration,
    key: keyof IHTMLFormatConfiguration,
    dflt: string[] | undefined
): string[] | undefined {
    const list = <string>getFormatOption(options, key, null);
    if (typeof list === "string") {
        if (list.length > 0) {
            return list.split(",").map((t) => t.trim().toLowerCase());
        }
        return [];
    }
    return dflt;
}
