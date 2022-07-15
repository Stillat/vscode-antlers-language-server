import assert = require('assert');
import { formatAntlers } from './testUtils/formatAntlers';

suite('Formatter Conditions', () => {
    test('it does not remove simple literals from simple ifs', () => {
        const expected = `<head>
    {{ if something }}
        wat
    {{ /if }}
</head>`;

        const input = `<head>
{{ if something }}
wat
{{ /if }}
</head>`;
        assert.strictEqual(formatAntlers(input), expected);
    });

    test('it emits strings when appearning after ternary nodes', () => {
        const template = `<html>
<head>
</head>
<body>
<style>
:root {
    --primary-color: {{ theme:primary_color ?? "#FA7268" }};
    --secondary-color: {{ theme:secondary_color ?? "#C62368" }};
    --plyr-color-main: {{ theme:primary_color ?? "#C62368" }};
}
</style>
<script>
window.primaryColor = '{{ theme:primary_color ?? "#FA7268" }}';
window.secondaryColor = '{{ theme:secondary_color ?? "#C62368" }}';
</script>
</body>
</html>`;
        const output = `<html>
<head>
</head>
<body>
    <style>
        :root {
            --primary-color: {{ theme:primary_color ?? "#FA7268" }};
            --secondary-color: {{ theme:secondary_color ?? "#C62368" }};
            --plyr-color-main: {{ theme:primary_color ?? "#C62368" }};
        }
    </style>
    <script>
        window.primaryColor = '{{ theme:primary_color ?? "#FA7268" }}';
        window.secondaryColor = '{{ theme:secondary_color ?? "#C62368" }}';
    </script>
</body>
</html>`;
        assert.strictEqual(formatAntlers(template), output);
    });
    
    test('template test 14', () => {
        const template = `{{ if string == "Hello wilderness" && content }}yes{{ endif }}`;
        const output = `{{ if string == "Hello wilderness" && content }}
    yes
{{ endif }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('it emits endif', () => {
        const template = `{{ if 		true == true }}Inner{{			 endif }}`,
            expected = `{{ if true == true }}
    Inner
{{ endif }}`;
        assert.strictEqual(formatAntlers(template), expected);
    });

});