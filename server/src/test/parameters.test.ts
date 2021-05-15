import * as assert from 'assert';
import { IParameterAttribute } from '../antlers/tagManager';
import { parseTemplate } from './testUtils/mockProject';

function assertParameterOffsets(parameter: IParameterAttribute, startOffset: number, contentStart: number, endOffset: number) {
	assert.strictEqual(parameter.startOffset, startOffset, 'param:: ' + parameter.name + ' start char');
	assert.strictEqual(parameter.endOffset, endOffset, 'param:: ' + parameter.name + ' end char');
	assert.strictEqual(parameter.contentStartsAt, contentStart, 'param:: ' + parameter.name + ' content start char');
}

suite('Antlers Parameter Parser', () => {

	test('should find parameters', () => {
		const parser = parseTemplate('collection');

		const open = parser.getSymbol(0);

		assert.strictEqual(open.parameterContentStartLine, 2); // 0-indexed line
		assert.strictEqual(open.parameterContentStart, 28); // Character

		const params = open.parameterCache;

		assert.notStrictEqual(params, null);

		if (params != null) {
			assert.strictEqual(params.length, 1);

			const firstParam = params[0];

			assert.strictEqual(firstParam.value, 'posts');
			assert.strictEqual(firstParam.name, 'as');
			assert.strictEqual(firstParam.contentStartsAt, 32);
			assert.strictEqual(firstParam.endOffset, 37);
			assert.strictEqual(firstParam.containsInterpolation, false);
			assert.strictEqual(firstParam.isCompound, false);
			assert.strictEqual(firstParam.isDynamicBinding, false);
		}
	});

	test('should resolve complex parameters', () => {
		const parser = parseTemplate('parameters'),
			open = parser.getSymbol(0);

		const params = open.parameterCache;

		assert.notStrictEqual(params, null);

		if (params != null) {
			assert.strictEqual(params.length, 3);
			const asPosts = params[0],
				dynamicBinding = params[1],
				variableInterpolation = params[2];

			assert.strictEqual(asPosts.name, 'as');
			assert.strictEqual(asPosts.value, 'posts');
			assert.strictEqual(asPosts.isCompound, false);
			assert.strictEqual(asPosts.isDynamicBinding, false);
			assert.strictEqual(asPosts.containsInterpolation, false);
			assertParameterOffsets(asPosts, 28, 32, 37);

			assert.strictEqual(dynamicBinding.name, ':dynamic');
			assert.strictEqual(dynamicBinding.value, 'binding');
			assert.strictEqual(dynamicBinding.isCompound, false);
			assert.strictEqual(dynamicBinding.isDynamicBinding, true);
			assert.strictEqual(dynamicBinding.containsInterpolation, false);
			assertParameterOffsets(dynamicBinding, 39, 49, 56);

			assert.strictEqual(variableInterpolation.name, 'interpolation');
			assert.strictEqual(variableInterpolation.value, '{title}');
			assert.strictEqual(variableInterpolation.isCompound, false);
			assert.strictEqual(variableInterpolation.isDynamicBinding, false);
			assert.strictEqual(variableInterpolation.containsInterpolation, true);
			assertParameterOffsets(variableInterpolation, 58, 73, 80);

			assert.strictEqual(variableInterpolation.interpolations.length, 1);

			const firstInterpolation = variableInterpolation.interpolations[0];

			assert.strictEqual(firstInterpolation.value, 'title');
			assert.strictEqual(firstInterpolation.startOffset, 73);
			assert.strictEqual(firstInterpolation.endOffset, 80);
			assert.strictEqual(firstInterpolation.symbols.length, 1);

			const firstInterpSymb = firstInterpolation.symbols[0];

			assert.strictEqual(firstInterpSymb.startLine, 2, 'interpolation start line');
			assert.strictEqual(firstInterpSymb.endLine, 2, 'interpolation end line');

			assert.strictEqual(firstInterpSymb.startOffset, 73, 'interpolation start char');
			assert.strictEqual(firstInterpSymb.endOffset, 80, 'interpolation end char');
		}
	});

});
