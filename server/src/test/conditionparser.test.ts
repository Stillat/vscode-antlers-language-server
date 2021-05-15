import * as assert from 'assert';
import { ConditionalTokenType, IConditionalToken } from '../antlers/conditionParser';
import { parseCondition } from './testUtils/mockProject';

function assertTokenOffsets(token: IConditionalToken, startOffset: number, endOffset: number) {
	assert.strictEqual(token.start, startOffset);
	assert.strictEqual(token.end, endOffset);
}

suite('Antlers Conditions Parser', () => {

	test('general tokens are found', () => {
		const parser = parseCondition("{{ if title == 'hello' }}"),
			tokens = parser.getTokens();

		assert.strictEqual(tokens.length, 3);
	});

	test('general token information is collected', () => {
		const parser = parseCondition('    {{ if {session:some_var} == "Statamic is rad!" }}'),
			tokens = parser.getTokens();

		assert.strictEqual(tokens.length, 3);

		const first = parser.getToken(0),
			second = parser.getToken(1),
			third = parser.getToken(2);

		assertTokenOffsets(first, 11, 28);
		assertTokenOffsets(second, 30, 31);
		assertTokenOffsets(third, 33, 50);

		assert.strictEqual(first.type, ConditionalTokenType.TagExpression);
		assert.strictEqual(first.content, '{session:some_var}');
		assert.strictEqual(second.type, ConditionalTokenType.EqualityComparison);
		assert.strictEqual(second.content, '==');
		assert.strictEqual(third.type, ConditionalTokenType.String);
		assert.strictEqual(third.content, 'Statamic is rad!');

	});

});
