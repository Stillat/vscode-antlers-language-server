import assert from 'assert';
import { formatStringWithPrettier } from '../formatting/prettier/utils.js';

suite('Formatter Prettier PHP', () => {
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
</main>\n`,
            once = await formatStringWithPrettier(input),
            twice = await formatStringWithPrettier(once);

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
</main>\n`,
            options = { useTabs: true, tabWidth: 4 },
            once = await formatStringWithPrettier(input, options),
            twice = await formatStringWithPrettier(once, options);

        assert.strictEqual(once, expected);
        assert.strictEqual(twice, expected);
    });

    test('it respects the configured PHP quote style', async () => {
        const input = `<span>{{? route("account.register"); ?}}</span>`,
            expected = `<span>{{? route('account.register'); ?}}</span>\n`;

        assert.strictEqual(await formatStringWithPrettier(input, { singleQuote: true }), expected);
    });

    test('it can format PHP nodes', async () => {
        assert.strictEqual(
            (await formatStringWithPrettier(`
            <span>{{? $register =             route(      'account.register'          ); ?}}</span>
            <span>     {{$        route(      'account.register'          )     $}}</span>
            <span>       {{$        route(      'account.register'          ) ++++++     $}}</span> `)).trim(),
            `<span>{{? $register = route("account.register"); ?}}</span>
<span>{{$ route("account.register") $}}</span>
<span>{{$        route(      'account.register'          ) ++++++     $}}</span>`
        );
    });
});
