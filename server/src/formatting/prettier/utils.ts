import * as prettier from 'prettier';
import * as plugin from './plugin';

// @ts-ignore
import php from "@prettier/plugin-php/standalone";

let phpOptions: prettier.ParserOptions,
    htmlOptions: prettier.ParserOptions;

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

    phpOptions = cleanOptions(
        Object.assign({}, options, {
            parser: 'php',
            plugins: [php]
        })
    );
}

export function getHtmlOptions(): prettier.ParserOptions {
    return htmlOptions as prettier.ParserOptions;
}

export function formatPhp(text: string) {
    let result = prettier.format('<?php ' + text, phpOptions).trim();

    result = result.substring(5);

    if (text.endsWith(';') == false && result.endsWith(';')) {
        result = result.substring(0, result.length - 1);
    }

    return result.trim();
}

export function formatAsHtml(text: string) {
    return prettier.format(text, htmlOptions);
}

export function formatStringWithPrettier(text: string) {
    return prettier.format(text, {
        parser: 'antlers',
        plugins: [plugin as any as string]
    });
}
