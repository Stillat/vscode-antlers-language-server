import * as assert from 'assert';
import { ISymbol } from '../antlers/types';
import { parseString, parseTemplate } from './testUtils/mockProject';

function assertLineEquals(symbol: ISymbol, startLine: number, endLine: number) {
	assert.strictEqual(symbol.startLine, startLine);
	assert.strictEqual(symbol.endLine, endLine);
}

suite('Antlers Parser', () => {

	test('should return correct symbol count', () => {
		let parser = parseString('{{}}');

		assert.strictEqual(parser.getSymbolCount(), 1);

		parser = parseString(` {{ test }} 
		{{ `);

		assert.strictEqual(parser.getSymbolCount(), 2);
	});

	test('should get comment', () => {
		const parser = parseString('{{# Comment #}}');
		assert.strictEqual(parser.getSymbol(0).isComment, true);
	});

	test('should ignore html', () => {
		const parser = parseString(`<div class="max-w-5xl mx-auto relative py-16 lg:pt-40 lg:pb-32">
		<article class="content">
			<p class="font-medium text-lg text-teal">{{ subtitle }}</p>
			<h1>{{ title }}</h1>
		</article>
	</div>`);

		const subtitle = parser.getSymbol(0),
			title = parser.getSymbol(1);

		assertLineEquals(subtitle, 2, 2);
		assertLineEquals(title, 3, 3);
	});

	test('should get correct line numbers', () => {
		let parser = parseString(`
		{{ form:set in="contact" }}
	
		{{ form:submissions }}
			{{  }}
	{{ /form:set}}`);

		const formSet = parser.getSymbol(0),
			submission = parser.getSymbol(1),
			empty = parser.getSymbol(2),
			closingFormSet = parser.getSymbol(3);

		assertLineEquals(formSet, 1, 1);
		assertLineEquals(submission, 3, 3);
		assertLineEquals(empty, 4, 4);
		assertLineEquals(closingFormSet, 5, 5);

		parser = parseString(`    {{

            collection:articles

    }}

`);
		const collection = parser.getSymbol(0);

		assertLineEquals(collection, 0, 4);
	});

	test('associates tag pairs', () => {
		const parser = parseTemplate('collection');

		assert.strictEqual(parser.getSymbolCount(), 2);

		const open = parser.getSymbol(0),
			close = parser.getSymbol(1);

		assert.strictEqual(open.isClosedBy, close);
		assert.strictEqual(close.belongsTo, open);
	});

});
