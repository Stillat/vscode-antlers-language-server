// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import php from '@prettier/plugin-php/standalone';
import type { Options } from 'prettier';
import * as prettier from 'prettier/standalone';

const phpPlugin = {
    ...php,
    options: {
        ...php.options,
        singleQuote: {
            category: 'Common',
            type: 'boolean',
            default: false,
            description: 'Use single quotes instead of double quotes.'
        }
    }
};

const internalOptionNames = [
    'cursorOffset',
    'rangeEnd',
    'rangeStart',
    'locEnd',
    'locStart',
    'printer',
    'originalText',
    'astFormat'
];

function cleanOptions(options: Options): Options {
    const cleanedOptions = { ...options } as Record<string, unknown>;

    internalOptionNames.forEach((optionName) => {
        delete cleanedOptions[optionName];
    });

    return cleanedOptions as Options;
}

export async function formatPhp(text: string, options: Options = {}): Promise<string> {
    const originalPhp = text.trim();
    let result = (await prettier.format(`<?php ${text}`, {
        singleQuote: false,
        ...cleanOptions(options),
        parser: 'php',
        plugins: [phpPlugin]
    })).trim();

    if (!result.startsWith('<?php')) {
        throw new Error('Unable to locate the temporary PHP opening tag.');
    }

    result = result.substring(5).trim();

    if (!originalPhp.endsWith(';') && result.endsWith(';')) {
        result = result.substring(0, result.length - 1);
    }

    return result.trim();
}
