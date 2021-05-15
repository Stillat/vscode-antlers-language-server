import * as assert from 'assert';
import { parseTemplate } from './testUtils/mockProject';

suite('Antlers Tag Manager', () => {

	test('it resolves tags', () => {
		const parser = parseTemplate('collection'),
			open = parser.getSymbol(0);

		assert.strictEqual(open.isTag, true);
	});

});
