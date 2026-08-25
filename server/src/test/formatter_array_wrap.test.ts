import assert from 'assert';
import { AntlersFormattingOptions } from '../formatting/antlersFormattingOptions.js';
import { ArrayWrapStyle } from '../runtime/document/transformOptions.js';
import { formatAntlers } from './testUtils/formatAntlers.js';

function formattingOptions(arrayWrap: ArrayWrapStyle | string): AntlersFormattingOptions {
    return {
        htmlOptions: { wrapLineLength: 500 },
        tabSize: 4,
        insertSpaces: true,
        formatFrontMatter: true,
        maxStatementsPerLine: 3,
        formatExtensions: [],
        arrayWrap: arrayWrap as ArrayWrapStyle
    };
}

suite('Formatter Array Wrapping', () => {
    test('multi line arrays are preserved by default', () => {
        const input = `{{ [
    'one',
    'two' => condition
] | classes }}`;

        assert.strictEqual(formatAntlers(input), input);
    });

    test('multi line arrays can be collapsed', () => {
        const input = `{{ [
    'one',
    'two' => condition
] | classes }}`;

        assert.strictEqual(
            formatAntlers(input, formattingOptions('collapse')),
            `{{ ['one', 'two' => condition] | classes }}`
        );
    });

    test('invalid array wrapping falls back to preserve', () => {
        const input = `{{ [
    'one',
    'two'
] }}`;

        assert.strictEqual(formatAntlers(input, formattingOptions('invalid')), input);
    });

    test('preserved arrays retain tabs and nested indentation', () => {
        const input = `{{ [
\t'one',
\t[
\t\t'two'
\t]
] | classes }}`;

        assert.strictEqual(formatAntlers(input), input);
    });

    test('quoted parameter arrays are unchanged', () => {
        const input = `{{ tag :items="[
    'one',
    ['two', 'three']
]" }}`;

        assert.strictEqual(formatAntlers(input), input);
    });

    test('preserved arrays are stable across multiple runs', () => {
        const input = `{{ [
    'one',
    'two' => condition,
] | classes }}`;

        const firstPass = formatAntlers(input),
            secondPass = formatAntlers(firstPass);

        assert.strictEqual(firstPass, input);
        assert.strictEqual(secondPass, firstPass);
    });
});
