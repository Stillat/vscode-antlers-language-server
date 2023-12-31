import assert from 'assert';
import { AntlersDocument } from '../runtime/document/antlersDocument.js';
import { assertTrue } from './testUtils/assertions.js';

suite('Document Modifiers', () => {
    test('it collects modifiers', () => {
        const doc = AntlersDocument.fromText(`{{ array reverse="true" }}`),
            nodes = doc.getAllAntlersNodes();

        assertTrue(nodes[0].modifiers.hasModifier('reverse'));
    });
});