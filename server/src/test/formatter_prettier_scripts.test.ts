import assert = require('assert');
import { formatStringWithPrettier } from '../formatting/prettier/utils';
import { formatAntlers } from './testUtils/formatAntlers';

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

    test('it does not attempt to format script tags that contain antlers pairs', () => {
        const input = `
<script>
    function contactFormAnimations() {
    }
    contactFormAnimations()
    document.addEventListener("alpine:initialized", () => {
        // Set value of 'building' field to the current building
        {{ nav from="/locations" select="title|slug" :slug:is="segment_2" }}
            document.getElementById('contactFormModalForm').building.value = \`{{ title }}\`;
            contactFormAnimations()
        {{ /nav }}
    })
</script>`;
        const expected = "<script>\n    function contactFormAnimations() {\n    }\n    contactFormAnimations()\n    document.addEventListener(\"alpine:initialized\", () => {\n        // Set value of 'building' field to the current building\n        {{ nav from=\"/locations\" select=\"title|slug\" :slug:is=\"segment_2\" }}\n            document.getElementById('contactFormModalForm').building.value = `{{ title }}`;\n            contactFormAnimations()\n        {{ /nav }}\n    })\n</script>";
        let output = formatAntlers(input).trim();

        assert.strictEqual(output, expected);

        for (let i = 0; i < 5; i++) {
            output = formatAntlers(output).trim();
            assert.strictEqual(output, expected);
        }
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

let linkColour = \`{{ $colorName}}\`
</script>`;
        const expected = `<div>
    <!-- ... -->
</div>

<script>
    const localLocations = JSON.parse(\`{{ local_locations | to_json }}\`);

    let linkColour = \`{{ $colorName }}\`;
</script>`;
        let output = formatStringWithPrettier(input).trim();

        assert.strictEqual(output, expected);

        for (let i = 0; i < 5; i++) {
            output = formatStringWithPrettier(output).trim();
            assert.strictEqual(output, expected);
        }
    });
});