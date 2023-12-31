import assert from 'assert';
import { AntlersDocument } from '../runtime/document/antlersDocument.js';
import { WordScanner } from '../runtime/document/scanners/wordScanner.js';
import { assertNotNull } from './testUtils/assertions.js';

suite('Word Scanner', () => {
    test('left neighbor indexes resolve', () => {
        const input = '{{ collection:articles from="" }}';

        assert.strictEqual(WordScanner.findLeftNeighboringNextAlphaNumeric(26, input), 22);
        assert.strictEqual(WordScanner.findLeftNeighboringNextAlphaNumeric(27, input), 22);
        assert.strictEqual(WordScanner.findLeftNeighboringNextAlphaNumeric(18, input), 13);
        assert.strictEqual(WordScanner.findLeftNeighboringNextAlphaNumeric(19, input), 13);
        assert.strictEqual(WordScanner.findLeftNeighboringNextAlphaNumeric(20, input), 13);
    });

    test('right neighbor indexes resolve', () => {
        const input = '{{ collection:articles from="" }}';

        assert.strictEqual(WordScanner.findRightNeighboringNextAlphaNumeric(21, input), 24);
        assert.strictEqual(WordScanner.findRightNeighboringNextAlphaNumeric(18, input), 24);
        assert.strictEqual(WordScanner.findRightNeighboringNextAlphaNumeric(16, input), 24);
    });

    test('underscores are allowed in words', () => {
        const template = `start
{{ collection:articles }}
    {{ test = {collection:articles paginate="true" limit="{'10' | some_modifier}"} }} end

end`;
        const doc = AntlersDocument.fromText(template),
            features = doc.cursor.getFeaturesAt(3, 74);

        assertNotNull(features);
        assert.strictEqual(features?.word, 'some_modifier');
        assert.strictEqual(features.leftWord, "10");
        assert.strictEqual(features.rightWord, 'end');
    });
});