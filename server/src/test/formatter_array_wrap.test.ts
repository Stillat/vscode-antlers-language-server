import assert from 'assert';
import { AntlersFormattingOptions } from '../formatting/antlersFormattingOptions.js';
import { ArrayWrapStyle } from '../runtime/document/transformOptions.js';
import { formatAntlers } from './testUtils/formatAntlers.js';

function formattingOptions(arrayWrap: ArrayWrapStyle | string, insertSpaces = true): AntlersFormattingOptions {
    return {
        htmlOptions: { wrapLineLength: 500 },
        tabSize: 4,
        insertSpaces: insertSpaces,
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

    test('preserved arrays normalize nested indentation', () => {
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
] }}`;

        const firstPass = formatAntlers(input, formattingOptions('preserve'));

        assert.strictEqual(firstPass, expected);
        assert.strictEqual(formatAntlers(firstPass, formattingOptions('preserve')), firstPass);
    });

    test('preserved arrays use configured indentation widths', () => {
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

        inputs.forEach((input) => {
            const firstPass = formatAntlers(input);

            assert.strictEqual(firstPass, `{{ [
    'one',
    [
        'two'
    ]
] }}`);
            assert.strictEqual(formatAntlers(firstPass), firstPass);
        });
    });

    test('preserved nested arrays use configured tabs', () => {
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
            options = formattingOptions('preserve', false),
            firstPass = formatAntlers(input, options);

        assert.strictEqual(firstPass, expected);
        assert.strictEqual(formatAntlers(firstPass, options), firstPass);
    });

    test('preserved arrays retain their formatted leading indentation', () => {
        const input = `        {{ values = [
                    ['alpha'],
                    [],
                    [
                    'beta',
                    'gamma',
            ]
                ]
         after = values[2][1] }}`,
            expected = `        {{ values = [
            ['alpha'],
            [],
            [
                'beta',
                'gamma',
            ]
        ]
         after = values[2][1] }}`;

        let output = input;

        for (let pass = 0; pass < 5; pass++) {
            output = formatAntlers(output, formattingOptions('preserve'));
            assert.strictEqual(output, expected);
        }
    });

    test('tabs remain stable inside nested HTML', () => {
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
            options = formattingOptions('preserve', false),
            firstPass = formatAntlers(input, options);

        assert.strictEqual(firstPass, input);
        assert.strictEqual(formatAntlers(firstPass, options), firstPass);
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

    test('array literals preserve following statement boundaries', () => {
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

        assert.strictEqual(formatAntlers(input), preserved);
        assert.strictEqual(formatAntlers(input, formattingOptions('collapse')), collapsed);
        assert.strictEqual(formatAntlers(preserved), preserved);
    });

    test('adjacent brackets retain nesting and statement boundaries', () => {
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
 after = values[2][1] }}`;

        assert.strictEqual(formatAntlers(input), preserved);
        assert.strictEqual(formatAntlers(preserved), preserved);
        assert.strictEqual(formatAntlers(input, formattingOptions('collapse')), collapsed);
    });

    test('separators stay on the line of the value they terminate', () => {
        const input = `{{ [
    'one' => t !== 'a' && t !== 'b',
    'two' => p
] | classes }}`;

        assert.strictEqual(formatAntlers(input), input);
        assert.strictEqual(formatAntlers(formatAntlers(input)), input);
    });

    test('wrapped operator chains indent beneath their array item', () => {
        const input = `{{ [
    'one' => t !== 'a' && t !== 'b' && t !== 'c',
    'two' => p
] | classes }}`,
            expected = `{{ [
    'one' => t !== 'a' && t !== 'b'
        && t !== 'c',
    'two' => p
] | classes }}`,
            firstPass = formatAntlers(input);

        assert.strictEqual(firstPass, expected);
        assert.strictEqual(formatAntlers(firstPass), firstPass);
    });

    test('wrapped operator chains use configured tabs', () => {
        const input = `{{ [
\t'one' => t !== 'a' && t !== 'b' && t !== 'c',
\t'two' => p
] | classes }}`,
            expected = `{{ [
\t'one' => t !== 'a' && t !== 'b'
\t\t&& t !== 'c',
\t'two' => p
] | classes }}`,
            options = formattingOptions('preserve', false),
            firstPass = formatAntlers(input, options);

        assert.strictEqual(firstPass, expected);
        assert.strictEqual(formatAntlers(firstPass, options), firstPass);
    });

    test('operator chains outside arrays are unaffected', () => {
        const input = `{{ if t !== 'a' && t !== 'b' && t !== 'c' }}x{{ /if }}`;

        assert.strictEqual(formatAntlers(input), formatAntlers(formatAntlers(input)));
    });

    test('expand wraps arrays that were authored on one line', () => {
        const input = `{{ ['one', 'two' => condition] | classes }}`,
            expected = `{{ [
    'one',
    'two' => condition
] | classes }}`,
            options = formattingOptions('expand'),
            firstPass = formatAntlers(input, options);

        assert.strictEqual(firstPass, expected);
        assert.strictEqual(formatAntlers(firstPass, options), firstPass);
    });

    test('expand wraps nested arrays at every level', () => {
        const input = `{{ values = [['one'], ['two', ['three']]] }}`,
            expected = `{{ values = [
    [
        'one'
    ],
    [
        'two',
        [
            'three'
        ]
    ]
] }}`,
            options = formattingOptions('expand'),
            firstPass = formatAntlers(input, options);

        assert.strictEqual(firstPass, expected);
        assert.strictEqual(formatAntlers(firstPass, options), firstPass);
    });

    test('expand uses configured tabs', () => {
        const input = `{{ ['one', 'two'] | classes }}`,
            expected = `{{ [
\t'one',
\t'two'
] | classes }}`,
            options = formattingOptions('expand', false),
            firstPass = formatAntlers(input, options);

        assert.strictEqual(firstPass, expected);
        assert.strictEqual(formatAntlers(firstPass, options), firstPass);
    });

    test('expand keeps empty arrays on one line', () => {
        const input = `{{ values = [] }}`;

        assert.strictEqual(formatAntlers(input, formattingOptions('expand')), input);
    });

    test('expand leaves quoted parameter arrays alone', () => {
        const input = `{{ tag :items="[
    'one',
    ['two', 'three']
]" }}`;

        assert.strictEqual(formatAntlers(input, formattingOptions('expand')), input);
    });

    test('prefixed variables keep their prefix inside array literals', () => {
        const inputs = [
            `{{ [view:size, 'shrink-0', classes] | classes }}`,
            `{{ [page:title] | classes }}`,
            `{{ [foo:bar:baz] | classes }}`,
            `{{ [a, view:size] | classes }}`,
            `{{ ['a' => view:size] | classes }}`
        ];

        inputs.forEach((input) => {
            assert.strictEqual(formatAntlers(input).trim(), input);
            assert.strictEqual(formatAntlers(input, formattingOptions('collapse')).trim(), input);
        });
    });

    test('array accessors still collapse their merged components', () => {
        const inputs = [
            `{{ view:background['default'] }}`,
            `{{ view:background['default']['one'] }}`,
            `{{ posts[1].title }}`,
            `{{ values = [['one'], [], ['two']]
 after = values[2][1] }}`
        ];

        inputs.forEach((input) => {
            assert.strictEqual(formatAntlers(input, formattingOptions('collapse')).trim(), input);
        });
    });

    test('multiple multi line arrays retain relative indentation', () => {
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
            firstPass = formatAntlers(input);

        assert.strictEqual(firstPass, expected);
        assert.strictEqual(formatAntlers(firstPass), firstPass);
    });
});
