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

    test('repeated formatting does not continue to indent structures inside scripts', () => {
        const input = `<div>
<!-- ... -->
</div>

<script>
const localLocations = JSON.parse(\`{{ local_locations | to_json }}\`)

let linkColour = \`{{ if segment_2 === 'location-1' }} #20332E {{ else }} #073C4A {{ /if }}\`
</script>`;
        const expected = `<div>
    <!-- ... -->
</div>

<script>
    const localLocations = JSON.parse(\`{{ local_locations | to_json }}\`)

    let linkColour = \`{{ if segment_2 === 'location-1' }} #20332E {{ else }} #073C4A {{ /if }}\`
</script>`;
        let output = formatStringWithPrettier(input).trim();

        assert.strictEqual(output, expected);

        for (let i = 0; i < 5; i++) {
            output = formatStringWithPrettier(output).trim();
            assert.strictEqual(output, expected);
        }
    });
});