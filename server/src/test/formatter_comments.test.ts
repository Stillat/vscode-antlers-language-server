import assert = require('assert');
import { formatAntlers } from './testUtils/formatAntlers';

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
    {{# {{ partial src="something" }} #}}}}
    <h1>Help! I get deleted!</h1>
</div>`
        );
    });
});