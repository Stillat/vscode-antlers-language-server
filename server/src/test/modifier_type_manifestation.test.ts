import assert from 'assert';
import { AntlersDocument } from '../runtime/document/antlersDocument.js';

suite('Modifier Runtime Type Manifestation', () => {
    test('it deduces string types', () => {
        const nodes = AntlersDocument.fromText('{{ array reverse="true" }}').getAllAntlersNodes();

        assert.strictEqual(nodes[0].manifestType, 'string');
    });

    test('it deduces array types', () => {
        const nodes = AntlersDocument.fromText('{{ my_array reverse="true" }}{{ /my_array }}').getAllAntlersNodes();

        assert.strictEqual(nodes[0].manifestType, 'array');
    });
});