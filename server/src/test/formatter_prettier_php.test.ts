import assert from 'assert';
import { formatStringWithPrettier } from '../formatting/prettier/utils.js';

suite('Formatter Prettier PHP', () => {
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