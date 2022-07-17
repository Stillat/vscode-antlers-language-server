import assert = require('assert');
import { formatAntlers } from './testUtils/formatAntlers';

suite('Formatter Operators', () => {
    test('it wraps multiple language operators', () => {
        const template = `
        {{ test = one merge two 
                        where (name == 'name' && type == 'test')
                                     take (1) skip(		5) orderby(name 'desc')
                                     
                            groupby(test) as	 'groupName' groupby(title'name') as 'another')  }}`;
        const output = `{{ test = one merge two
        where (name == 'name' && type == 'test')
        take (1)
        skip (5)
        orderby (name 'desc')
        groupby (test) as 'groupName'
        groupby (title 'name') as 'another') }}`;

        assert.strictEqual(formatAntlers(template), output);
    });
    
    test('template test 19', () => {
        const template = `{{ string
            ? "Pass"
                :			 "Fail" }}`;
        const output = `{{ string ? "Pass" : "Fail" }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('template test 20', () => {
        const template = `{{ if (date
             | modify_date:+3 years | format:Y) ==
              "2015" 
            }}yes{{ endif }}`;
        const output = `{{ if (date | modify_date:+3 years | format:Y) == "2015" }}
    yes
{{ endif }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('inline ternary', () => {
        assert.strictEqual(formatAntlers(`{{ response_code == 404 || hide_sidebar ? 'lg:w-3/4 xl:w-4/5' : 'xl:w-3/5' }}`), `{{ response_code == 404 || hide_sidebar ? 'lg:w-3/4 xl:w-4/5' : 'xl:w-3/5' }}`);
    });

    test('modifier equivalency', () => {
        assert.strictEqual(formatAntlers(`{{ value | subtract:{2 + 3} }}`), `{{ value | subtract:{2 + 3} }}`);
        assert.strictEqual(formatAntlers(`{{ value | subtract: {value} }}`), `{{ value | subtract:{value} }}`);
        assert.strictEqual(formatAntlers(`{{ value | subtract: 5 }}`), `{{ value | subtract:5 }}`);
        assert.strictEqual(formatAntlers(`{{ {value - 5} }}`), `{{ {value - 5} }}`);
    });

    test('add op', () => {
        assert.strictEqual(formatAntlers('{{ 5 + "5" }}'), '{{ 5 + "5" }}');
    });

    test('it emits method style modifiers', () => {
        assert.strictEqual(formatAntlers(`<{{ value_one | test_modifier:value_two }} />
        <{{ value_one | test_modifier(value_two) }}/>`), `<{{ value_one | test_modifier:value_two }} />
<{{ value_one | test_modifier(value_two) }} />`);
    });
    
    test('it handles mixed automatic and explicit statement separators', () => {
        const template = `{{ test = 1 + 
    3; test += 3;                  confusing += (							1 + 3 -
                     2 / (3 % 2)) third = 3232 + 342; tail = 		(3 + 2) }}				 
`;
        const expected = `{{ test = 1 + 3; test += 3; confusing += (1 + 3 - 2 / (3 % 2))
 third = 3232 + 342;
 tail = (3 + 2) }}`;
        assert.strictEqual(formatAntlers(template), expected);
    });

    test('it does not remove whitespace inside string interpolations', () => {
        const template = `{{ test variable='{ true ? 'Hello wilderness - {{default_key}}' : 'fail' }' }}`;
        const output = `{{ test variable='{ true ? 'Hello wilderness - {{default_key}}' : 'fail'}' }}`;
        assert.strictEqual(formatAntlers(template), output);
    });

    test('it emits variable fallback operator', () => {
        assert.strictEqual(formatAntlers(`{{ test 
            ?= 			'test' }}				 
        `), "{{ test ?= 'test' }}");
    });

    test('it emits logical and keyword', () => {
        assert.strictEqual(formatAntlers('{{ left   and     right }}'), '{{ left and right }}');
    });

    test('it emits symbolic and full', () => {
        assert.strictEqual(formatAntlers('{{ left   &&     right }}'), '{{ left && right }}');
    });

    test('it emits symbolic and short', () => {
        assert.strictEqual(formatAntlers('{{ left   &     right }}'), '{{ left & right }}');
    });

    test('it emits logical or keyword', () => {
        assert.strictEqual(formatAntlers('{{ left   or     right }}'), '{{ left or right }}');
    });

    test('it emits symbolic or', () => {
        assert.strictEqual(formatAntlers('{{ left   ||     right }}'), '{{ left || right }}');
    });

    test('it emits logical xor keyword', () => {
        assert.strictEqual(formatAntlers('{{ left   xor     right }}'), '{{ left xor right }}');
    });

    test('it emits ==', () => {
        assert.strictEqual(formatAntlers('{{ left   ==     right }}'), '{{ left == right }}');
    });

    test('it emits !=', () => {
        assert.strictEqual(formatAntlers('{{ left   !=     right }}'), '{{ left != right }}');
    });

    test('it emits ??', () => {
        assert.strictEqual(formatAntlers('{{ left   ??     right }}'), '{{ left ?? right }}');
    });

    test('it emits ?:', () => {
        assert.strictEqual(formatAntlers('{{ left   ?:     right }}'), '{{ left ?: right }}');
    });

    test('it emits ?', () => {
        assert.strictEqual(formatAntlers('{{ left   ?     right }}'), '{{ left ? right }}');
    });

    test('it emits <=>', () => {
        assert.strictEqual(formatAntlers('{{ left   <=>     right }}'), '{{ left <=> right }}');
    });

    test('it emits <', () => {
        assert.strictEqual(formatAntlers('{{ left   <     right }}'), '{{ left < right }}');
    });

    test('it emits <=', () => {
        assert.strictEqual(formatAntlers('{{ left   <=     right }}'), '{{ left <= right }}');
    });

    test('it emits >', () => {
        assert.strictEqual(formatAntlers('{{ left   >     right }}'), '{{ left > right }}');
    });

    test('it emits >=', () => {
        assert.strictEqual(formatAntlers('{{ left   >=     right }}'), '{{ left >= right }}');
    });

    test('it emits null', () => {
        assert.strictEqual(formatAntlers('{{ test =    null; }}'), '{{ test = null; }}');
    });

    test('it emits true', () => {
        assert.strictEqual(formatAntlers('{{ test =    true; }}'), '{{ test = true; }}');
    });

    test('it emits false', () => {
        assert.strictEqual(formatAntlers('{{ test =    false; }}'), '{{ test = false; }}');
    });

    test('it emits not keyword', () => {
        assert.strictEqual(formatAntlers('{{ 		left not     right; }}'), '{{ left not right; }}');
    });

    test('it emits array keyword', () => {
        assert.strictEqual(formatAntlers(`{{ test =    arr(
            'one' => 1,
            'two' => 2	
        ) }}`), `{{ test = arr('one' => 1, 'two' => 2) }}`);
    });

    test('it emits array brackets', () => {
        assert.strictEqual(formatAntlers(`{{ test =    [
            'one' => 1,
            'two' => 2	
        ] }}`), `{{ test = ['one' => 1, 'two' => 2] }}`);
    });

    test('it emits strings', () => {
        assert.strictEqual(formatAntlers(`{{ test = 'Escape \\'' }}`), `{{ test = 'Escape \\'' }}`);
        assert.strictEqual(formatAntlers(`{{ test = 'Escape \\'Test\\\\' }}`), `{{ test = 'Escape \\'Test\\\\' }}`);
    });

    test('it emits numbers', () => {
        assert.strictEqual(formatAntlers(`{{ test = -132 }}`), `{{ test = -132 }}`);
        assert.strictEqual(formatAntlers(`{{ test = 132.01 }}`), `{{ test = 132.01 }}`);
    });

    test('it emits bindings', () => {
        assert.strictEqual(formatAntlers('{{ test :variable="name|upper" }}'), '{{ test :variable="name|upper" }}');
    });

    test('it emits language operators', () => {
        assert.strictEqual(formatAntlers('{{ left pluck       right }}'), '{{ left pluck right }}');
        assert.strictEqual(formatAntlers('{{ left take       right }}'), '{{ left take right }}');
        assert.strictEqual(formatAntlers('{{ left skip       right }}'), '{{ left skip right }}');
        assert.strictEqual(formatAntlers('{{ left orderby       right }}'), '{{ left orderby right }}');
        assert.strictEqual(formatAntlers('{{ left groupby       right }}'), '{{ left groupby right }}');
        assert.strictEqual(formatAntlers('{{ left merge       right }}'), '{{ left merge right }}');
        assert.strictEqual(formatAntlers('{{ left where       right }}'), '{{ left where right }}');
    });

    test('it emits switch groups', () => {
        const input = `{{ test variable="{switch(
(size == 'sm') => '(min-width: 768px) 35vw, 90vw',
(size == 'md') => '(min-width: 768px) 55vw, 90vw',
(size == 'lg') => '(min-width: 768px) 75vw, 90vw',
(size == 'xl') => '90vw'
)}" }}`;
        const expected = `{{ test variable="{switch(
  (size == 'sm') => '(min-width: 768px) 35vw, 90vw',
  (size == 'md') => '(min-width: 768px) 55vw, 90vw',
  (size == 'lg') => '(min-width: 768px) 75vw, 90vw',
  (size == 'xl') => '90vw')}" }}`;

        assert.strictEqual(formatAntlers(input), expected);
    });

    test('it emits list groups', () => {
        const input = `{{

    items = list(
        name,  
        
                color,
                
                
                type;
        'Apple',
                 'red', 		'fruit';
'Hammer', 'brown', 'tool';
                'Orange', 'orange', 
                        'fruit';
        'Lettuce',
'green', 'vegetable';
    )
    }}<p>Inner</p>
    {{

        items = list(
            name,    color, type;
            'Apple', 'red', 'fruit';
            'Hammer', 'brown', 'tool';
            'Orange', 'orange', 'fruit';
            'Lettuce', 'green', 'vegetable'
        )
    }}`;
        const expected = `{{ items = list(name, color, type;
          'Apple', 'red', 'fruit';
          'Hammer', 'brown', 'tool';
          'Orange', 'orange', 'fruit';
          'Lettuce', 'green', 'vegetable';
         ) }}<p>Inner</p>
{{ items = list(name, color, type;
          'Apple', 'red', 'fruit';
          'Hammer', 'brown', 'tool';
          'Orange', 'orange', 'fruit';
          'Lettuce', 'green', 'vegetable') }}`;
        assert.strictEqual(formatAntlers(input), expected);
    });

    test('switch groups do not have crazy spacing', () => {
        const input = `<div class="container w-full py-32 space-y-24">
{{ entries = {collection:possibilities sort="order"} }}
{{ test }}
{{ one }}
{{ two }}
{{ three }}
{{ four }}
{{ five }}
{{ six }}
{{ parity = switch(
((index | mod:2) == 0) => 'even',
((index | mod:2) == 1) => 'odd',
) }}
{{ /six }}
{{ /five }}
{{ /four }}
{{ /three }}
{{ /two }}
{{ /one }}
{{ /test }}
{{ partial:possibilities/preview :side="parity" }}
{{ /entries }}
</div>`;
        const expected = `<div class="container w-full py-32 space-y-24">
    {{ entries = {collection:possibilities sort="order"} }}
        {{ test }}
            {{ one }}
                {{ two }}
                    {{ three }}
                        {{ four }}
                            {{ five }}
                                {{ six }}
                                    {{ parity = switch(
                                             ((index | mod:2) == 0) => 'even',
                                             ((index | mod:2) == 1) => 'odd',
                                         ) }}
                                {{ /six }}
                            {{ /five }}
                        {{ /four }}
                    {{ /three }}
                {{ /two }}
            {{ /one }}
        {{ /test }}
        {{ partial:possibilities/preview :side="parity" }}
    {{ /entries }}
</div>`;
        assert.strictEqual(formatAntlers(input), expected);
    });
});