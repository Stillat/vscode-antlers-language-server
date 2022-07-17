import assert = require('assert');
import { formatStringWithPrettier } from '../formatting/prettier/utils';

suite('Formatter Prettier JavaScript and Antlers', () => {
    test('it preserves antlers in scripts inside conditions', () => {
        const input = `{{ if conditionOne }}
<script>
    const test = {{ data }};
</script>
{{ if conditionTwo }}
<script>
    const testTwo = {{ dataTwo }};
</script>
{{ if conditionThree }}
<script>
    const testThree = {{ dataThree }};
</script>
{{ /if }}
{{ /if }}
{{ /if }}`;
        const expected = `{{ if conditionOne }}
    <script>
        const test = {{ data }};
    </script>
    {{ if conditionTwo }}
        <script>
            const testTwo = {{ dataTwo }};
        </script>
        {{ if conditionThree }}
            <script>
                const testThree = {{ dataThree }};
            </script>
        {{ /if }}
    {{ /if }}
{{ /if }}`;
        assert.strictEqual(formatStringWithPrettier(input).trim(), expected);
    });

    
    test('it preserves antlers inside scripts', () => {
        const input = `<script>const element = {{ value }};</script>`;
        const expected = `<script>
    const element = {{ value }};
</script>`;
        assert.strictEqual(formatStringWithPrettier(input).trim(), expected);
        
    });
});