import assert = require('assert');
import { formatAntlers } from './testUtils/formatAntlers';

suite('Formatter Front Matter', () => {

    test('it can format front matter', () => {
        const template = `---
hello: 			wilderness
hello2: 			wilderness2
hello3: wilderness3
---
{{#
    @name Header
    @desc The sites header rendered on each page.
#}}

<!-- /layout/_header.antlers.html -->
<header class="w-full py-4">
    <div class="fluid-container flex justify-between items-center">
        {{# Make partials you want to use for the header or use and edit premade examples like the following ones. #}}
        {{ partial:components/logo width="120" }}
        {{ partial:navigation/main }}
    </div>
</header>
<!-- End: /layout/_header.antlers.html -->`;
        const expected = `---
hello: 'wilderness'
hello2: 'wilderness2'
hello3: 'wilderness3'
---

{{#
    @name Header
    @desc The sites header rendered on each page.
#}}

<!-- /layout/_header.antlers.html -->
<header class="w-full py-4">
    <div class="fluid-container flex justify-between items-center">
        {{# Make partials you want to use for the header or use and edit premade examples like the following ones. #}}
        {{ partial:components/logo width="120" }}
        {{ partial:navigation/main }}
    </div>
</header>
<!-- End: /layout/_header.antlers.html -->`;
        assert.strictEqual(formatAntlers(template), expected);
    });

});