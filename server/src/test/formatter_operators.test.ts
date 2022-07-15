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
});