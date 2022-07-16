import assert = require('assert');
import { AntlersFormattingOptions } from '../formatting/antlersFormattingOptions';
import { IHTMLFormatConfiguration } from '../formatting/htmlCompat';
import { formatAntlers } from './testUtils/formatAntlers';

suite('Formatter Continued Formatting Test', () => {
    test('it does not distort formatted results', () => {
        const htmlOptions: IHTMLFormatConfiguration = {
            wrapLineLength: 500,
            wrapAttributes: 'force-expand-multiline'
        };

        const antlersOptions: AntlersFormattingOptions = {
            htmlOptions: htmlOptions,
            tabSize: 4,
            insertSpaces: true,
            formatFrontMatter: true,
            maxStatementsPerLine: 3,
            formatExtensions: []
        };

        const template = `<a class="inline-block {{ if downsize == false }}  px-20 py-2 text-lg{{else}} px-4 sm:px-16 py-2 text-xs sm:text-base{{ /if }} md:px-16 md:py-2 md:text-lg font-bold text-center tracking-wide text-white uppercase rounded-full bg-blue"
        href="{{ cta_url }}" {{ if new_tab }} target="_blank" rel="noopener noreferrer" {{ /if }}>
        {{ cta_text }}
        </a>`,
            expected = `<a
    class="inline-block {{ if downsize == false }}  px-20 py-2 text-lg{{else}} px-4 sm:px-16 py-2 text-xs sm:text-base{{ /if }} md:px-16 md:py-2 md:text-lg font-bold text-center tracking-wide text-white uppercase rounded-full bg-blue"
    href="{{ cta_url }}"
    {{ if new_tab }} target="_blank" rel="noopener noreferrer" {{ /if }}
>
    {{ cta_text }}
</a>`;
        assert.strictEqual(formatAntlers(template, antlersOptions), expected);
        let result = formatAntlers(expected, antlersOptions);
        // Just keep formatting the results.
        for (let i = 0; i < 5; i++) {
            const tempResult = formatAntlers(result, antlersOptions);
            assert.strictEqual(tempResult, expected);
            result = tempResult;
        }
    });
});