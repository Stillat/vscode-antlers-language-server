import assert from 'assert';
import { formatAntlers } from './testUtils/formatAntlers.js';

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

    test('it does not continue to indent things', () => {
        const input = `
<script>{{ if thing }}{{ /if }}</script>
{{ if true }}
    <script>
        gtag('consent', 'default', {
            'ad_storage': 'denied',
            'analytics_storage': 'denied',
            'wait_for_update': 500
        });
        dataLayer.push({
            'event': 'default_consent'
        });
    </script>
{{ /if }}

`;
        const out = `<script>{{ if thing }}{{ /if }}</script>
{{ if true }}
    <script>
        gtag('consent', 'default', {
            'ad_storage': 'denied',
            'analytics_storage': 'denied',
            'wait_for_update': 500
        });
        dataLayer.push({
            'event': 'default_consent'
        });
    </script>
{{ /if }}`;
        assert.strictEqual(formatAntlers(input).trim(), out);
    });
});