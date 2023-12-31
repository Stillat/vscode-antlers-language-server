import assert from 'assert';
import { formatStringWithPrettier } from '../formatting/prettier/utils.js';

suite('Formatter PRettier CSS and Antlers', () => {
    test('it does not do weird things with many chained strings and numeric values', async () => {
        const template = `<html>
        <head>
        </head>
        <body>
        <style>
        :root {
            --primary-color: {{ thxme:primary_color ?? "#FA\\"7268" 
            ?? 23.0 }};
            --secondary-color: {{ thxmed:secondary_color ?? "#C62368" ?? 320.0 ?? "#C62fff368" ?? "#C62368aaa" ?? "#C6236bbb8" ?? null }};
            --plyr-color-main: {{ thxmedddd:primary_color ?? "#C62368" }};
        }
        
        </style>
        <script>
        window.primaryColor = '{{ thxmeddddd:primary_color ?? "#FA7268" }}';
        window.secondaryColor = '{{ theme:secondary_color ?? "#C62368" }}';
        </script>
        </body>
        </html>`;
        const output = `<html>
    <head></head>
    <body>
        <style>
            :root {
                --primary-color: {{ thxme:primary_color ?? "#FA\\"7268" ?? 23.0 }};
                --secondary-color: {{ thxmed:secondary_color ?? "#C62368" ?? 320.0 ?? "#C62fff368" ?? "#C62368aaa" ?? "#C6236bbb8" ?? null }};
                --plyr-color-main: {{ thxmedddd:primary_color ?? "#C62368" }};
            }
        </style>
        <script>
            window.primaryColor =
                "{{ thxmeddddd:primary_color ?? "#FA7268" }}";
            window.secondaryColor = "{{ theme:secondary_color ?? "#C62368" }}";
        </script>
    </body>
</html>`;
        assert.strictEqual((await formatStringWithPrettier(template)).trim(), output);
    });
});