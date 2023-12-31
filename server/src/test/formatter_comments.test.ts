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
});