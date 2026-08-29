import assert from 'assert';
import { formatStringWithPrettier } from '../formatting/prettier/utils.js';

suite('Formatter Prettier PHP', () => {
    test('multiline PHP formatting is idempotent', async () => {
        const template = `{{# Extract Youtube Video ID #}}
{{?
preg_match('/(?:youtube\\.com\\/.*v=|youtu\\.be\\/|youtube\\.com\\/embed\\/)([^&\\/\\?\\#]+)/', $video_link, $matches);
$videoId = $matches[1] ?? null;
?}}`;

        const once = await formatStringWithPrettier(template),
            twice = await formatStringWithPrettier(once);

        assert.strictEqual(twice, once);
        assert.ok(once.endsWith('?}}\n'));
    });

    test('it can format PHP nodes', async () => {
        assert.strictEqual(
            (await formatStringWithPrettier(`
            <span>{{? $register =             route(      'account.register'          ); ?}}</span>
            <span>     {{$        route(      'account.register'          )     $}}</span>
            <span>       {{$        route(      'account.register'          ) ++++++     $}}</span> `)).trim(),
            `<span>{{? $register = route("account.register") ?}}</span>
<span>{{$ route("account.register") $}}</span>
<span>{{$        route(      'account.register'          ) ++++++     $}}</span>`
        );
    });
});
