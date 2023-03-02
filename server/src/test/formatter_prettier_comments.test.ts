import assert = require('assert');
import { formatStringWithPrettier } from '../formatting/prettier/utils';

suite('Formatter Prettier Comments', () => {
    test('it does not continue to indent comments', () => {
        const initial = `<div>
        {{#  comment 1 #}}
        {{# comment 2 #}}
        {{ variable }}
        </div>`;
        const output = `<div>
    {{# comment 1 #}}
    {{# comment 2 #}}
    {{ variable }}
</div>`;
        assert.strictEqual(formatStringWithPrettier(initial).trim(), output);
        for (let i = 0; i <= 10; i++) {
            assert.strictEqual(formatStringWithPrettier(output).trim(), output);
        }
    });

    test('it preserves relative indents when formatting comments', () => {
        const template = `
<div>
    {{# 
    {{ collection:articles limit="5" as="articles" }}
        {{ if no_results }}
            <h2 class="text-3xl italic tracking-tight">
                Feel the rhythm! Feel the rhyme! Get on up, it's writing time! Cool writings!
            </h2>
        {{ /if }}
    {{ /collection:articles }}
    #}}
</div>
`;
        const formatted = `<div>
    {{#
        {{ collection:articles limit="5" as="articles" }}
            {{ if no_results }}
                <h2 class="text-3xl italic tracking-tight">
                    Feel the rhythm! Feel the rhyme! Get on up, it's writing time! Cool
                    writings!
                </h2>
            {{ /if }}
        {{ /collection:articles }}
    #}}
</div>`;
        assert.strictEqual(formatStringWithPrettier(template).trim(), formatted);
    });

    test('it doesnt duplicate whitespace when continuously formatting comments', () => {
        const template = `
<div>
<div>
{{#
    <div class="mt-10 flex flex-wrap items-center justify-center gap-2 lg:mt-14">
    <a
    href="/register"
    class="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-pink-600 px-4 py-2 text-lg font-medium text-white transition hover:bg-pink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 focus-visible:ring-offset-1 md:text-xl lg:px-6 lg:py-4 lg:text-2xl"
    >
    <span>Get started for free</span>
    <img
    src="/assets/icons/arrow-right.svg"
    aria-hidden="true"
    class="w-4 lg:w-5"
    />
    </a>
    <button
    x-data
    @click.prevent="dispatchEvent(new CustomEvent('toggle-dialog', { detail: 'cta-video' }));"
    class="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-transparent px-4 py-2 text-lg font-medium text-pink-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pink-600 md:text-xl lg:px-6 lg:py-4 lg:text-2xl"
    >
    <img
    src="/assets/icons/play.svg"
    aria-hidden="true"
    class="w-5 lg:w-auto"
    />
    <span>Watch Clarityflow video</span>
    </button>
    {{ partial:dialog name='cta-video' }}
    <iframe
    class="aspect-video w-full"
    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    loading="lazy"
    ></iframe>
    {{ /partial:dialog }}
    </div>
#}}
</div>
</div>
`;

        const expected = `<div>
    <div>
        {{#
            <div class="mt-10 flex flex-wrap items-center justify-center gap-2 lg:mt-14">
                <a
                    href="/register"
                    class="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-pink-600 px-4 py-2 text-lg font-medium text-white transition hover:bg-pink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 focus-visible:ring-offset-1 md:text-xl lg:px-6 lg:py-4 lg:text-2xl"
                >
                    <span>Get started for free</span>
                    <img
                        src="/assets/icons/arrow-right.svg"
                        aria-hidden="true"
                        class="w-4 lg:w-5"
                    />
                </a>
                <button
                    x-data
                    @click.prevent="dispatchEvent(new CustomEvent('toggle-dialog', { detail: 'cta-video' }));"
                    class="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-transparent px-4 py-2 text-lg font-medium text-pink-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pink-600 md:text-xl lg:px-6 lg:py-4 lg:text-2xl"
                >
                    <img
                        src="/assets/icons/play.svg"
                        aria-hidden="true"
                        class="w-5 lg:w-auto"
                    />
                    <span>Watch Clarityflow video</span>
                </button>
                {{ partial:dialog name='cta-video' }}
                    <iframe
                        class="aspect-video w-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="YouTube video player"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowfullscreen
                        loading="lazy"
                    ></iframe>
                {{ /partial:dialog }}
            </div>
        #}}
    </div>
</div>`;
            let res = formatStringWithPrettier(template).trim();
            assert.strictEqual(res, expected);

            // Lets keep formatting the already formatted output.
            for (let i = 0; i < 5; i++) {
                res = formatStringWithPrettier(res).trim();
                assert.strictEqual(res, expected);
            }
    });
});
