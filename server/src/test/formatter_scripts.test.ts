import assert = require('assert');
import { formatAntlers } from './testUtils/formatAntlers';

suite('Formatter: JavaScript and Antlers', () => {
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
        assert.strictEqual(formatAntlers(input), expected);
    });

    test('it preserves antlers inside scripts', () => {
        const input = `<script>const element = {{ value }};</script>`;
        const expected = `<script>
    const element = {{ value }};
</script>`;
        assert.strictEqual(formatAntlers(input), expected);
        
    });

    test('it does not duplicate script tags', () => {
        const template = `<script type="application/json">
{{ if something }}
{{ /if }}
</script>
AAA 
BBB
{{ if somethingElse }}

<script>
</script>

{{ /if }}`;
        const out = `<script type="application/json">
{{ if something }}
{{ /if }}
</script>
AAA
BBB
{{ if somethingElse }}
    <script>
    </script>
{{ /if }}`;
        assert.strictEqual(formatAntlers(template), out);
    });
});