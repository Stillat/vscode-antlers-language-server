import assert from 'assert';
import { formatAntlers } from './testUtils/formatAntlers.js';

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

    test('additional ifs with nested interpolations', () => {
        const template = `
{{ if 'test-wilderness' == 'test-{associative[default_key]}' }}yes{{ else }}nope{{ /if }}
{{ if 'test-{'wilderness'}'	 == 		'test-{associative[default_key]}' }}yes{{ else }}nope{{ /if }}
{{ if 'test-wilderness' == 'test-not-{associative[default_key]}' }}yes{{ else }}nope{{ /if }}
{{ if {truthy} }}yes{{ else }}no{{ /if }}
`;
        const output = `{{ if 'test-wilderness' == 'test-{associative[default_key]}' }}
    yes
{{ else }}
    nope
{{ /if }}
{{ if 'test-{'wilderness'}' == 'test-{associative[default_key]}' }}
    yes
{{ else }}
    nope
{{ /if }}
{{ if 'test-wilderness' == 'test-not-{associative[default_key]}' }}
    yes
{{ else }}
    nope
{{ /if }}
{{ if {truthy} }}
    yes
{{ else }}
    no
{{ /if }}`;
        assert.strictEqual(formatAntlers(template), output);
    });
    
    test('it indents conditionals', () => {
        const input = `<p>Outer Start</p>
{{ articles }}
<p>start</p>
{{ if title == 'Nectar of the Gods' }}
<p>Inner literal one.</p>
{{ elseif 5 < 10 }}
<p>Inner literal two.</p>
{{ else }}
<p>Else- inner literal three..</p>
{{ /if }}
<p>end</p>
{{ /articles }}
<p>Outer end</p>`;
        const expected = `<p>Outer Start</p>
{{ articles }}
    <p>start</p>
    {{ if title == 'Nectar of the Gods' }}
        <p>Inner literal one.</p>
    {{ elseif 5 < 10 }}
        <p>Inner literal two.</p>
    {{ else }}
        <p>Else- inner literal three..</p>
    {{ /if }}
    <p>end</p>
{{ /articles }}
<p>Outer end</p>`;
        assert.strictEqual(formatAntlers(input), expected);
    });

    test('it indents nested conditionals', () => {
        const input = `<p>Outer Start</p>
{{ articles }}
<p>start</p>
{{ if title == 'Nectar of the Gods' }}
<p>Inner literal one.</p>

{{ if true == true }}
{{ if true == false }}
{{ elseif false == true }}
{{ if abc == 'abc' }}

{{ /if }}
{{ /if }}
{{ else }}

{{ /if }}

{{ elseif 5 < 10 }}
<p>Inner literal two.</p>
{{ else }}
<p>Else- inner literal three..</p>
{{ /if }}
<p>end</p>
{{ /articles }}
<p>Outer end</p>`;
        const expected = `<p>Outer Start</p>
{{ articles }}
    <p>start</p>
    {{ if title == 'Nectar of the Gods' }}
        <p>Inner literal one.</p>
        {{ if true == true }}
            {{ if true == false }}
            {{ elseif false == true }}
                {{ if abc == 'abc' }}
                {{ /if }}
            {{ /if }}
        {{ else }}
        {{ /if }}
    {{ elseif 5 < 10 }}
        <p>Inner literal two.</p>
    {{ else }}
        <p>Else- inner literal three..</p>
    {{ /if }}
    <p>end</p>
{{ /articles }}
<p>Outer end</p>`;
        assert.strictEqual(formatAntlers(input), expected);
    });
});