import assert from 'assert';
import * as prettier from 'prettier';
import plugin from '../formatting/prettier/plugin.js';

async function format(template: string, tabWidth = 4): Promise<string> {
    return (await prettier.format(template, {
        parser: 'antlers',
        plugins: [plugin],
        tabWidth: tabWidth
    })).trim();
}

async function assertStable(template: string, expected: string, tabWidth = 4) {
    const formatted = await format(template, tabWidth);

    assert.strictEqual(formatted, expected);
    assert.strictEqual(await format(formatted, tabWidth), expected);
}

suite('Prettier Switch Formatting', () => {
    test('it formats nested switch modifier arguments', async () => {
        const input = `<div>
    <div>
        <div
            class="{{ '' | tw_merge(
                'flex-initial flex flex-col items-start justify-center',
                switch
                (
                    (content_width === '75') => 'md:basis-3/4',
                    (content_width === '25') => 'md:basis-full max-w-5xl items-center',
                ),
                switch(
                    (background_color === 'white' || background_color === 'gray') => 'text-black',
                    (background_color === 'charcoal') => 'text-white antialiased',
                ),
                switch(
                    (padding === 'left' && image_position === 'right') => 'content:ml-breakout pl-5',
                    (padding === 'right' && image_position === 'left') => 'content:mr-breakout pr-5',
                ),
            ) }}"
        ></div>
    </div>
</div>`;
        const expected = `<div>
    <div>
        <div
            class="{{ '' | tw_merge(
                      'flex-initial flex flex-col items-start justify-center',
                      switch(
                          (content_width === '75') => 'md:basis-3/4',
                          (content_width === '25') => 'md:basis-full max-w-5xl items-center',
                      ),
                      switch(
                          (background_color === 'white' || background_color === 'gray') => 'text-black',
                          (background_color === 'charcoal') => 'text-white antialiased',
                      ),
                      switch(
                          (padding === 'left' && image_position === 'right') => 'content:ml-breakout pl-5',
                          (padding === 'right' && image_position === 'left') => 'content:mr-breakout pr-5',
                      ),
                   ) }}"
        ></div>
    </div>
</div>`;

        await assertStable(input, expected);
    });

    test('it keeps long attribute switches structurally indented', async () => {
        const input = `<html>
    <body>
        <main
            data-transition-namespace="{{ switch(
    (current_template == 'projekte/index') => 'projectIndex',
    () => 'default') }}">
        </main>
    </body>
</html>`;
        const expected = `<html>
    <body>
        <main
            data-transition-namespace="{{ switch(
                   (current_template == 'projekte/index') => 'projectIndex',
                   () => 'default'
                ) }}"
        ></main>
    </body>
</html>`;

        await assertStable(input, expected);
    });

    test('it respects two-space HTML and expression nesting', async () => {
        const input = `<section><div><span data-value="{{ '' | tw_merge('base', switch((a == b) => foo(a, b), () => 'no')) }}"></span></div></section>`;
        const expected = `<section>
  <div>
    <span
      data-value="{{ '' | tw_merge(
                     'base',
                     switch(
                       (a == b) => foo(a, b),
                       () => 'no'
                     )
                  ) }}"
    ></span>
  </div>
</section>`;

        await assertStable(input, expected, 2);
    });

    test('it leaves inner function arguments inline', async () => {
        const input = `{{ value = switch((enabled) => choose(first, second), () => fallback(third, fourth)) }}`;
        const expected = `{{ value = switch(
   (enabled) => choose(first, second),
   () => fallback(third, fourth)
) }}`;

        await assertStable(input, expected);
    });

    test('it wraps ancestor argument groups around nested switches', async () => {
        const input = `{{ result = choose('before', wrapper(switch((a) => foo(a, b), () => bar(c, d))), 'after') }}`;
        const expected = `{{ result = choose(
   'before',
   wrapper(
       switch(
           (a) => foo(a, b),
           () => bar(c, d)
       )
   ),
   'after'
) }}`;

        await assertStable(input, expected);
    });
});
