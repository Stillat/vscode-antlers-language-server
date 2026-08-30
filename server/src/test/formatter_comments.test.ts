import assert from 'assert';
import { formatAntlers } from './testUtils/formatAntlers.js';

suite('Formatter Comments', () => {
    test('it does not continue to indent comments', () => {
        const initial = `<div>
        {{#  comment 1 #}}
        {{# comment 2 #}}
        {{ variable }}
        </div>`;
        const output = `<div>
    {{# comment 1 #}}
    {{# comment 2 #}}
    {{ variable }}
</div>`;
        assert.strictEqual(formatAntlers(initial), output);
        for (let i = 0; i <= 10; i++) {
            assert.strictEqual(formatAntlers(output), output);
        }
    });

    test('trailing nodes are note deleted after comments', () => {
        assert.strictEqual(
            formatAntlers(`<div>
{{# {{ partial src="something" }} #}}
<h1>Help! I get deleted!</h1>
</div>`),
            `<div>
    {{# {{ partial src="something" }} #}}
    <h1>Help! I get deleted!</h1>
</div>`
        );

        const result = formatAntlers(`<div>
        {{# {{ partial src="something" }} #}}
        <h1>Help! I get deleted!</h1>
        </div>`);
        for (let i = 0; i < 10; i++) {
            assert.strictEqual(formatAntlers(result), result);
        }
    });

    test('comment end sequence is not doubled up when it begins the line before final literal', () => {
        const input = `Showing {{title }}

{{# {{ partial src="default" }} #}}

`;
        const expected = `Showing {{ title }}

{{# {{ partial src="default" }} #}}`;
        assert.strictEqual(formatAntlers(input).trim(), expected);
    });

    test('tab-indented comments remain stable', () => {
        const input = [
            '<div>',
            '\t<div>',
            '\t\t{{#',
            '            @name Button',
            '\t\t\t@param href Creates a link',
            '                - nested detail',
            '\t\t#}}',
            '\t</div>',
            '</div>'
        ].join('\n');
        const expected = [
            '<div>',
            '\t<div>',
            '\t\t{{#',
            '\t\t\t@name Button',
            '\t\t\t@param href Creates a link',
            '\t\t\t\t- nested detail',
            '\t\t#}}',
            '\t</div>',
            '</div>'
        ].join('\n');
        const options = {
            htmlOptions: { wrapLineLength: 500 },
            tabSize: 4,
            insertSpaces: false,
            formatFrontMatter: true,
            maxStatementsPerLine: 3,
            formatExtensions: []
        };

        let result = formatAntlers(input, options);
        assert.strictEqual(result, expected);

        for (let i = 0; i < 5; i++) {
            result = formatAntlers(result, options);
            assert.strictEqual(result, expected);
        }
    });
});
