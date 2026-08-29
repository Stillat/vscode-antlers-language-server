import assert from 'assert';
import { formatStringWithPrettier } from '../formatting/prettier/utils.js';

function formatPreserved(text: string) {
    return formatStringWithPrettier(text, { antlersArrayWrap: 'preserve' } as any);
}

function formatCollapsed(text: string) {
    return formatStringWithPrettier(text, { antlersArrayWrap: 'collapse' } as any);
}

suite('Prettier Formatter Array Wrapping', () => {
    test('multi line arrays are preserved by default', async () => {
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

        assert.strictEqual((await formatStringWithPrettier(input)).trim(), expected);
        assert.strictEqual((await formatPreserved(input)).trim(), expected);
    });

    test('multi line arrays are collapsed when requested', async () => {
        const input = `<div class="{{ [
    'one',
    'two',
    'three' => condition
] | classes }}">test</div>`;
        const expected = `<div class="{{ ['one', 'two', 'three' => condition] | classes }}">test</div>`;

        const firstPass = await formatCollapsed(input);

        assert.strictEqual(firstPass.trim(), expected);
        assert.strictEqual(await formatCollapsed(firstPass), firstPass);
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
        <span class="{{ [
            'one',
            'two' => condition
        ] | classes }}">
            test
        </span>
    </div>
</section>`;

        const firstPass = await formatPreserved(input);

        assert.strictEqual(firstPass.trim(), expected);
        assert.strictEqual(await formatPreserved(firstPass), firstPass);
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

    test('empty arrays remain inline', async () => {
        const input = `<div class="{{ [] | classes }}">test</div>`;

        assert.strictEqual((await formatStringWithPrettier(input)).trim(), input);
        assert.strictEqual((await formatCollapsed(input)).trim(), input);
    });

    test('brackets merged into variable names are handled', async () => {
        // Brackets that are not separated by whitespace become part of the
        // neighboring variable name, producing the names "[one" and "three]".
        const input = `{{ [
    one,
    'two',
    three
] }}`;

        assert.strictEqual((await formatStringWithPrettier(input)).trim(), input);
        assert.strictEqual((await formatCollapsed(input)).trim(), `{{ [one, 'two', three] }}`);
    });

    test('preserved arrays normalize nested indentation', async () => {
        const input = `{{
    test = [
            'one' => 1,
            'two' => 2,
            'nested' => [
            'one' => 1,
            'two' => 2,

    ]
        ]
}}`,
            expected = `{{ test = [
    'one' => 1,
    'two' => 2,
    'nested' => [
        'one' => 1,
        'two' => 2,
    ]
] }}`,
            firstPass = await formatPreserved(input);

        assert.strictEqual(firstPass.trim(), expected);
        assert.strictEqual(await formatPreserved(firstPass), firstPass);
    });

    test('preserved arrays use configured indentation widths', async () => {
        const inputs = [
            `{{ [
  'one',
  [
    'two'
  ]
] }}`,
            `{{ [
        'one',
        [
                'two'
        ]
] }}`
        ];

        for (const input of inputs) {
            const firstPass = await formatPreserved(input);

            assert.strictEqual(firstPass.trim(), `{{ [
    'one',
    [
        'two'
    ]
] }}`);
            assert.strictEqual(await formatPreserved(firstPass), firstPass);
        }
    });

    test('preserved nested arrays use configured tabs', async () => {
        const input = `{{ values = [
        'one' => [
        'two' => [
        'three'
]
]
] }}`,
            expected = `{{ values = [
\t'one' => [
\t\t'two' => [
\t\t\t'three'
\t\t]
\t]
] }}`,
            options = { antlersArrayWrap: 'preserve', useTabs: true, tabWidth: 4 } as any,
            firstPass = await formatStringWithPrettier(input, options);

        assert.strictEqual(firstPass.trim(), expected);
        assert.strictEqual(await formatStringWithPrettier(firstPass, options), firstPass);
    });

    test('tabs remain stable inside nested HTML', async () => {
        const input = `<main>
\t<section>
\t\t<div class="{{ [
\t\t\t'one',
\t\t\t[
\t\t\t\t'two'
\t\t\t]
\t\t] | classes }}">content</div>
\t</section>
</main>`,
            expected = `<main>
\t<section>
\t\t<div class="{{ [
\t\t\t'one',
\t\t\t[
\t\t\t\t'two'
\t\t\t]
\t\t] | classes }}">content</div>
\t</section>
</main>`,
            options = { antlersArrayWrap: 'preserve', useTabs: true, tabWidth: 4 } as any,
            firstPass = await formatStringWithPrettier(input, options);

        assert.strictEqual(firstPass.trim(), expected);
        assert.strictEqual(await formatStringWithPrettier(firstPass, options), firstPass);
    });

    test('trailing separators do not add blank lines', async () => {
        const input = `{{ [
    'one',
] | classes }}`;

        assert.strictEqual((await formatStringWithPrettier(input)).trim(), input);
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

    test('array literals preserve following statement boundaries', async () => {
        const input = `{{
    _array = [
        'one' => 1,
        'three' => [
            'four' => 4,
            'five' => 5
        ]
    ]

    _value = _array['three']['five']
}}`;
        const preserved = `{{ _array = [
    'one' => 1,
    'three' => [
        'four' => 4,
        'five' => 5
    ]
]
 _value = _array['three']['five'] }}`;
        const collapsed = `{{ _array = ['one' => 1, 'three' => ['four' => 4, 'five' => 5]]
 _value = _array['three']['five'] }}`;

        const preservedOutput = await formatStringWithPrettier(input);

        assert.strictEqual(preservedOutput.trim(), preserved);
        assert.strictEqual((await formatCollapsed(input)).trim(), collapsed);
        assert.strictEqual(await formatStringWithPrettier(preservedOutput), preservedOutput);
    });

    test('adjacent brackets retain nesting and statement boundaries', async () => {
        const input = `{{ values = [['one'], [], [
        'two',
        'three',
    ]]
after = values[2][1] }}`,
            preserved = `{{ values = [
    ['one'],
    [],
    [
        'two',
        'three',
    ]
]
 after = values[2][1] }}`,
            collapsed = `{{ values = [['one'], [], ['two', 'three',]]
 after = values[2][1] }}`,
            preservedOutput = await formatPreserved(input),
            collapsedOutput = await formatCollapsed(input);

        assert.strictEqual(preservedOutput.trim(), preserved);
        assert.strictEqual(await formatPreserved(preservedOutput), preservedOutput);
        assert.strictEqual(collapsedOutput.trim(), collapsed);
        assert.strictEqual(await formatCollapsed(collapsedOutput), collapsedOutput);
    });

    test('multiple multi line arrays retain relative indentation', async () => {
        const input = `{{ first = [
    'one',
    'two'
]
second = [
    'three',
    'four'
]
second }}`,
            expected = `{{ first = [
    'one',
    'two'
]
 second = [
     'three',
     'four'
 ]
 second }}`,
            firstPass = await formatPreserved(input);

        assert.strictEqual(firstPass.trim(), expected);
        assert.strictEqual(await formatPreserved(firstPass), firstPass);
    });
});
