import assert from 'assert';
import { formatStringWithPrettier } from '../formatting/prettier/utils.js';

function formatPreserved(text: string) {
    return formatStringWithPrettier(text, { antlersArrayWrap: 'preserve' } as any);
}

function formatExpanded(text: string) {
    return formatStringWithPrettier(text, { antlersArrayWrap: 'expand' } as any);
}

suite('Prettier Formatter Array Wrapping', () => {
    test('multi line arrays are collapsed by default', async () => {
        const input = `<div class="{{ [
    'one',
    'two',
    'three' => condition
] | classes }}">test</div>`;
        const expected = `<div
    class="{{ ['one', 'two', 'three' => condition] | classes }}"
>
    test
</div>`;

        assert.strictEqual((await formatStringWithPrettier(input)).trim(), expected);
    });

    test('multi line arrays are preserved when requested', async () => {
        const input = `<div class="{{ [
    'one',
    'two',
    'three' => condition
] | classes }}">test</div>`;
        const expected = `<div
    class="{{ [
        'one',
        'two',
        'three' => condition
    ] | classes }}"
>
    test
</div>`;

        assert.strictEqual((await formatPreserved(input)).trim(), expected);
    });

    test('single line arrays are not expanded when preserving', async () => {
        const input = `<div class="{{ ['one', 'two'] | classes }}">test</div>`;

        assert.strictEqual((await formatPreserved(input)).trim(), input);
    });

    test('preserved arrays are indented relative to their line', async () => {
        const input = `<section>
    <div>
        <span class="{{ [
            'one',
            'two' => condition
        ] | classes }}">test</span>
    </div>
</section>`;
        const expected = `<section>
    <div>
        <span
            class="{{ [
                'one',
                'two' => condition
            ] | classes }}"
        >
            test
        </span>
    </div>
</section>`;

        assert.strictEqual((await formatPreserved(input)).trim(), expected);
    });

    test('nested arrays retain their own wrapping', async () => {
        const input = `{{ tag :items="[
    'one',
    ['two', 'three'],
    [
        'four',
        'five'
    ]
]" }}`;
        const expected = `{{ tag :items="[
    'one',
    ['two', 'three'],
    [
        'four',
        'five'
    ]
]" }}`;

        assert.strictEqual((await formatPreserved(input)).trim(), expected);
    });

    test('single line arrays are broken up when expanding', async () => {
        const input = `<div class="{{ ['one', 'two' => condition] | classes }}">test</div>`;
        const expected = `<div class="{{ [
    'one',
    'two' => condition
] | classes }}">test</div>`;

        assert.strictEqual((await formatExpanded(input)).trim(), expected);
    });

    test('empty arrays are not expanded', async () => {
        const input = `<div class="{{ [] | classes }}">test</div>`;

        assert.strictEqual((await formatExpanded(input)).trim(), input);
    });

    test('brackets merged into variable names are handled', async () => {
        // Brackets that are not separated by whitespace become part of the
        // neighboring variable name, producing the names "[one" and "three]".
        const input = `{{ [one, 'two', three] }}`;
        const expected = `{{ [
    one,
    'two',
    three
] }}`;

        assert.strictEqual((await formatExpanded(input)).trim(), expected);
        assert.strictEqual((await formatPreserved(input)).trim(), input);
    });

    test('preserved arrays are stable across multiple runs', async () => {
        const input = `<div class="{{ [
    'one',
    'two' => condition
] | classes }}">test</div>`;

        const firstPass = await formatPreserved(input),
            secondPass = await formatPreserved(firstPass);

        assert.strictEqual(secondPass, firstPass);
    });
});
