import assert = require('assert');
import { formatStringWithPrettier } from '../formatting/prettier/utils';

suite('Formatter Prettier PHP', () => {
    test('it can format PHP nodes', () => {
        assert.strictEqual(
            formatStringWithPrettier(`
            <span>{{? $register =             route(      'account.register'          ); ?}}</span>
            <span>     {{$        route(      'account.register'          )     $}}</span>
            <span>       {{$        route(      'account.register'          ) ++++++     $}}</span> `).trim(),
            `<span>{{? $register = route("account.register") ?}}</span>
<span>{{$ route("account.register") $}}</span>
<span>{{$        route(      'account.register'          ) ++++++     $}}</span>`
        );
    });
});