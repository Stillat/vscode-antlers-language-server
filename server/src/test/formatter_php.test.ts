import assert from 'assert';
import { AntlersFormattingOptions } from '../formatting/antlersFormattingOptions.js';
import { formatAntlersAsync } from './testUtils/formatAntlers.js';

const tabOptions: AntlersFormattingOptions = {
    htmlOptions: { wrapLineLength: 500 },
    tabSize: 4,
    insertSpaces: false,
    formatFrontMatter: true,
    maxStatementsPerLine: 3,
    formatExtensions: []
};

suite('Formatter PHP', () => {
    test('it formats both PHP node styles', async () => {
        const input = `<span>{{? $register =             route(      'account.register'          ); ?}}</span>
<span>{{$        route(      'account.register'          )     $}}</span>`,
            expected = `<span>{{? $register = route("account.register"); ?}}</span>
<span>{{$ route("account.register") $}}</span>`;

        assert.strictEqual(await formatAntlersAsync(input), expected);
    });

    test('it formats multiline PHP at nested indentation levels', async () => {
        const input = `<main>
<section>
{{?
$items=[1,2,3];
if(count($items)>0){
echo 'ready';
}
?}}
</section>
</main>`,
            expected = `<main>
    <section>
        {{?
            $items = [1, 2, 3];
            if (count($items) > 0) {
                echo "ready";
            }
        ?}}
    </section>
</main>`,
            once = await formatAntlersAsync(input),
            twice = await formatAntlersAsync(once);

        assert.strictEqual(once, expected);
        assert.strictEqual(twice, expected);
    });

    test('it respects tab indentation inside multiline PHP', async () => {
        const input = `<main>
<section>
{{$ $items=[1,2,3];if(count($items)>0){return 'ready';} $}}
</section>
</main>`,
            expected = `<main>
\t<section>
\t\t{{$
\t\t\t$items = [1, 2, 3];
\t\t\tif (count($items) > 0) {
\t\t\t\treturn "ready";
\t\t\t}
\t\t$}}
\t</section>
</main>`,
            once = await formatAntlersAsync(input, tabOptions),
            twice = await formatAntlersAsync(once, tabOptions);

        assert.strictEqual(once, expected);
        assert.strictEqual(twice, expected);
    });

    test('it preserves invalid PHP exactly', async () => {
        const input = `<span>{{$        route(      'account.register'          ) ++++++     $}}</span>`;

        assert.strictEqual(await formatAntlersAsync(input), input);
    });

    test('it does not change multiline string values while indenting PHP', async () => {
        const input = `<section>
{{?
$message = "hello
world";
$document = <<<TEXT
hello
  world
TEXT;
?}}
</section>`,
            expected = `<section>
    {{?
        $message = "hello
world";
        $document = <<<TEXT
        hello
          world
        TEXT;
    ?}}
</section>`,
            once = await formatAntlersAsync(input),
            twice = await formatAntlersAsync(once);

        assert.strictEqual(once, expected);
        assert.strictEqual(twice, expected);
    });
});
