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

    test('it preserves relative indents when formatting comments', () => {
        const template = `
<div>
    {{# 
    {{ collection:articles limit="5" as="articles" }}
        {{ if no_results }}
            <h2 class="text-3xl italic tracking-tight">
                Feel the rhythm! Feel the rhyme! Get on up, it's writing time! Cool writings!
            </h2>
        {{ /if }}
    {{ /collection:articles }}
    #}}
</div>
`;
        const formatted = `<div>
    {{#
        {{ collection:articles limit="5" as="articles" }}
            {{ if no_results }}
                <h2 class="text-3xl italic tracking-tight">
                    Feel the rhythm! Feel the rhyme! Get on up, it's writing time! Cool writings!
                </h2>
            {{ /if }}
        {{ /collection:articles }}
    #}}
</div>`;
assert.strictEqual(formatStringWithPrettier(template).trim(), formatted);
    })
});
