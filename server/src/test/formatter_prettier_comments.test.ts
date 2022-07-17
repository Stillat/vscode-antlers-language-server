import assert = require('assert');
import { formatStringWithPrettier } from '../formatting/prettier/utils';

suite('Formatter Prettier Comments', () => {
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
        assert.strictEqual(formatStringWithPrettier(initial).trim(), output);
        for (let i = 0; i <= 10; i++) {
            assert.strictEqual(formatStringWithPrettier(output).trim(), output);
        }
    });
});
