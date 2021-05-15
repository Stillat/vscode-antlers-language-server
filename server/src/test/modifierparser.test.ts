import * as assert from 'assert';
import { parseString } from './testUtils/mockProject';

suite('Antlers Modifier Parser', () => {

	test('modifier details are found', () => {
		const parser = parseString('    {{ title | explode |lower |test }}'),
			firstSymb = parser.getSymbol(0);

		assert.strictEqual(parser.getSymbolCount(), 1);
		assert.notStrictEqual(firstSymb.modifiers, null);
		assert.strictEqual(firstSymb.hasModifierSeparator, true);
		assert.notStrictEqual(firstSymb.modifierOffset, null);

		if (firstSymb.modifierOffset != null) {
			assert.strictEqual(firstSymb.modifierOffset, 14);
		}

		if (firstSymb.modifiers != null) {
			const modifiers = firstSymb.modifiers;

			assert.strictEqual(modifiers.hasModifiers, true);
			assert.strictEqual(modifiers.modifiers.length, 3);

			const firstModifier = modifiers.modifiers[0],
				secondModifier = modifiers.modifiers[1],
				thirdModifier = modifiers.modifiers[2];

			assert.strictEqual(firstModifier.startOffset, 16, 'explode start offset');
			assert.strictEqual(firstModifier.endOffset, 23, 'explode end offset');

			assert.strictEqual(secondModifier.startOffset, 25, 'lower start offset');
			assert.strictEqual(secondModifier.endOffset, 30, 'lower end offset');

			assert.strictEqual(thirdModifier.startOffset, 32, 'test start offset');
			assert.strictEqual(thirdModifier.endOffset, 36, 'test end offset');
		}
	});

	test('it detects mixed modifiers', () => {
		const parser = parseString('{{ title | explode |lower }} {{ title modifier="test" | explode |lower }}'),
			firstSymb = parser.getSymbol(0),
			secondSymb = parser.getSymbol(1);

		assert.notStrictEqual(firstSymb.modifiers, null);
		assert.notStrictEqual(secondSymb.modifiers, null);

		if (firstSymb.modifiers != null) {
			assert.strictEqual(firstSymb.modifiers.hasMixedStyles, false);
		}

		if (secondSymb.modifiers != null) {
			assert.strictEqual(secondSymb.modifiers.hasMixedStyles, true);
		}
	});

	test('it parses arguments', () => {
		const parser = parseString('{{ title | partial:footer }}'),
			firstSymb = parser.getSymbol(0);

		assert.notStrictEqual(firstSymb.modifiers, null);

		if (firstSymb.modifiers != null) {
			const modifierCount = firstSymb.modifiers.modifiers.length;

			assert.strictEqual(modifierCount, 1);

			const firstModifier = firstSymb.modifiers.modifiers[0];

			assert.strictEqual(firstModifier.name, 'partial');
			assert.strictEqual(firstModifier.args.length, 1);

			const firstArg = firstModifier.args[0];

			assert.strictEqual('footer', firstArg.content.trim());
			assert.strictEqual(firstArg.line, firstSymb.startLine);

			assert.strictEqual(firstArg.startOffset, 20, 'footer modifier start offset');
			assert.strictEqual(firstArg.endOffset, 26, 'footer modifier end offset');

		}
	});

});