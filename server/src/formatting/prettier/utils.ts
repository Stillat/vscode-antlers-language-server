import * as prettier from 'prettier';
import plugin from './plugin.js';

let htmlOptions: prettier.ParserOptions;

export function cleanOptions(options: prettier.ParserOptions): prettier.ParserOptions {
    [
        "cursorOffset",
        "rangeEnd",
        "rangeStart",
        "locEnd",
        "locStat",
        "printer",
        "originalText",
        "astFormat",
    ].forEach((p) => {
        // @ts-ignore
        delete options[p];
    });

    return options;
}

export function setOptions(options: prettier.ParserOptions) {
    htmlOptions = cleanOptions(
        Object.assign({}, options,
            { htmlWhitespaceSensitivity: "ignore", parser: "html", plugins: options.plugins }
        )
    );
}

export function getHtmlOptions(): prettier.ParserOptions {
    return htmlOptions as prettier.ParserOptions;
}

export function formatAsHtml(text: string) {
    return prettier.format(text, htmlOptions);
}

export function formatStringWithPrettier(text: string, options: prettier.Options = {}) {
    return prettier.format(text, {
        parser: 'antlers',
        plugins: [plugin as any as string],
        ...options
    });
}
