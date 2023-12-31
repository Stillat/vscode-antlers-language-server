import assert from 'assert';
import { formatAntlers } from './testUtils/formatAntlers.js';

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

    test('it formats front matter documents without errors', () => {
        const template = `---
tips:
    do:
        - Lorem ipsum 1
        - Lorem ipsum 2
    dont:
        - Lorem ipsum 1
        - Lorem ipsum 2
---

<section class="theme-container mx-auto py-20">
<h2 class="text-center text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">Tips</h2>
<div class="text-center max-w-lg mx-auto text-lg text-gray-500 mt-6">
<p>
Lorem ipsum
</p>
</div>
<div class="grid gap-8 lg:grid-cols-2 mt-16 text-gray-500">
<div class="max-w-lg mx-auto">
<h3 class="text-center text-3xl font-extrabold tracking-tight text-gray-900">Things to consider</h3>
<ul class="space-y-6 mt-6">
{{ foreach:view.tips.do }}
<li class="flex items-start space-x-2">
    <p>{{ value }}</p>
</li>
{{ /foreach:view.tips.do }}
</ul>
</div>
<div class="max-w-lg mx-auto">
<h3 class="text-center text-3xl font-extrabold tracking-tight text-gray-900">Things to avoid</h3>
<ul class="space-y-6 mt-6">
{{ foreach:view.tips.dont }}
<li class="flex items-start space-x-2">
    <p>{{ value }}</p>
</li>
{{ /foreach:view.tips.dont }}
</ul>
</div>
</div>
</section>`;
        const expected = `---
tips:
  do:
    - 'Lorem ipsum 1'
    - 'Lorem ipsum 2'
  dont:
    - 'Lorem ipsum 1'
    - 'Lorem ipsum 2'
---

<section class="theme-container mx-auto py-20">
    <h2 class="text-center text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">Tips</h2>
    <div class="text-center max-w-lg mx-auto text-lg text-gray-500 mt-6">
        <p>
            Lorem ipsum
        </p>
    </div>
    <div class="grid gap-8 lg:grid-cols-2 mt-16 text-gray-500">
        <div class="max-w-lg mx-auto">
            <h3 class="text-center text-3xl font-extrabold tracking-tight text-gray-900">Things to consider</h3>
            <ul class="space-y-6 mt-6">
                {{ foreach:view.tips.do }}
                    <li class="flex items-start space-x-2">
                        <p>{{ value }}</p>
                    </li>
                {{ /foreach:view.tips.do }}
            </ul>
        </div>
        <div class="max-w-lg mx-auto">
            <h3 class="text-center text-3xl font-extrabold tracking-tight text-gray-900">Things to avoid</h3>
            <ul class="space-y-6 mt-6">
                {{ foreach:view.tips.dont }}
                    <li class="flex items-start space-x-2">
                        <p>{{ value }}</p>
                    </li>
                {{ /foreach:view.tips.dont }}
            </ul>
        </div>
    </div>
</section>`;
            assert.strictEqual(formatAntlers(template), expected);
    });
});