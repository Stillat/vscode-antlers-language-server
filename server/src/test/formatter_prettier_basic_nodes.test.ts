import assert = require('assert');
import { formatStringWithPrettier } from '../formatting/prettier/utils';

suite('Prettier Formatter Basic Nodes', () => {

    test('it doesnt remove variable parts with neighboring numeric nodes', () => {
        assert.strictEqual(formatStringWithPrettier('{{ assets:0 }}').trim(), '{{ assets:0 }}');
        assert.strictEqual(formatStringWithPrettier('{{ assets:0:0 }}').trim(), '{{ assets:0:0 }}');
        assert.strictEqual(formatStringWithPrettier('{{ assets:0:0:test }}').trim(), '{{ assets:0:0:test }}');
        assert.strictEqual(formatStringWithPrettier('{{ assets.0:0:test }}').trim(), '{{ assets.0:0:test }}');
        assert.strictEqual(formatStringWithPrettier('{{ assets.0:0.test }}').trim(), '{{ assets.0:0.test }}');
    });

    test('it preserves hyphens in variables', () => {
        const input = `{{ tag:test-hyphens 
        
}} {{ 5-5 }} {{ test-var - another-var }}`;
        const output = "{{ tag:test-hyphens }} {{ 5 - 5 }} {{ test-var - another-var }}";
        assert.strictEqual(formatStringWithPrettier(input).trim(), output);
    });

    test('it preserves hyphens in tags', () => {
        const input = `{{ tag:test-hyphens 
        
        }} {{ 5-5 }}`;

        assert.strictEqual(formatStringWithPrettier(input).trim(), "{{ tag:test-hyphens }} {{ 5 - 5 }}");
    });

});