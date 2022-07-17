import assert = require('assert');
import { formatAntlers } from './testUtils/formatAntlers';

suite('Formatter Escaped Nodes', () => {
    test('it emits escaped content chars 3', () => {
        const template = `@{{ foo bar="{baz}" }}`;
        const output = `@{{ foo bar="{baz}" }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('it emits complex escaped content', () => {
        const template= `{{ if conditionOne }}
@{{test}}
<script>
    const test = {{ data }};
</script>
@{{test}}
{{ if conditionTwo }}
@{{test}}
<script>
    const testTwo = {{ dataTwo }};
</script>
{{ if conditionThree }}
@{{test}}
<script>
    const testThree = {{ dataThree }};
</script>
@{{test}}
{{ /if }} @{{ test }}
{{ /if }} @{{test}}
{{ /if }}`;
        const expected = `{{ if conditionOne }}
    @{{test}}
    <script>
        const test = {{ data }};
    </script>
    @{{test}}
    {{ if conditionTwo }}
        @{{test}}
        <script>
            const testTwo = {{ dataTwo }};
        </script>
        {{ if conditionThree }}
            @{{test}}
            <script>
                const testThree = {{ dataThree }};
            </script>
            @{{test}}
        {{ /if }} @{{ test }}
    {{ /if }} @{{test}}
{{ /if }}`;
        assert.strictEqual(formatAntlers(template), expected);
    });

    test('it emits escpaed content chars 2', () => {
        const template = `@{{ foo
    bar:baz="qux"
  }} {{ qux }}
bar
{{ baz }}`;
        const output = `@{{ foo
    bar:baz="qux"
  }} {{ qux }}
bar
{{ baz }}`;
        assert.strictEqual(formatAntlers(template), output);
    });
    
    test('it does not do weird things with spacing on things not flagged as tags', () => {
        const template = `<html>
        <head>
        </head>
        <body>
        <style>
        :root {
            --primary-color: {{ thxme:primary_color ?? "#FA\\"7268" 
            ?? 23 }};
            --secondary-color: {{ thxmed:secondary_color ?? "#C62368" }};
            --plyr-color-main:    {{ thxmedddd:primary_color
                 ?? "#C62368@@@@@@@@" }};
        }
        </style>
        <script>
        window.primaryColor = '{{ thxmeddddd:primary_color ?? "#FA7268" }}';
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
            --primary-color: {{ thxme:primary_color ?? "#FA\\"7268" ?? 23 }};
            --secondary-color: {{ thxmed:secondary_color ?? "#C62368" }};
            --plyr-color-main: {{ thxmedddd:primary_color ?? "#C62368@@@@@@@@" }};
        }
    </style>
    <script>
        window.primaryColor = '{{ thxmeddddd:primary_color ?? "#FA7268" }}';
        window.secondaryColor = '{{ theme:secondary_color ?? "#C62368" }}';
    </script>
</body>
</html>`;
        assert.strictEqual(formatAntlers(template), output);
    });
    
    test('it emits escaped content chars', () => {
        const template = `start
        {{articles}}{{test}}@{{ foo }} {{ qux }} bar {{ /articles }}
        end`;
        const output = `start
{{ articles }}
    {{ test }}@{{ foo }} {{ qux }} bar 
{{ /articles }}
end`;
        assert.strictEqual(formatAntlers(template), output);
    });
    
    test('template test 22', () => {
        const template = `{{ tag:array }}{{ noparse }}{{ string }}{{ /noparse }}{{ /tag:array }}
{{ tag:loop }}
    {{ index }} {{ noparse }}{{ string }}{{ /noparse }} {{ string }}
{{ /tag:loop }}`;
        const output = `{{ tag:array }}
    {{ noparse }}{{ string }}{{ /noparse }}
{{ /tag:array }}
{{ tag:loop }}
    {{ index }} {{ noparse }}{{ string }}{{ /noparse }} {{ string }}
{{ /tag:loop }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('it emits escaped content characters', () => {
        assert.strictEqual(formatAntlers('{{ "hello{"@@{world@@}"}" }}'), '{{ "hello{"@@{world@@}"}" }}');
    });
});