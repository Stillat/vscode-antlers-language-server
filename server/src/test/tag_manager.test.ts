import { AntlersDocument } from '../runtime/document/antlersDocument.js';
import { assertCount, assertFalse, assertTrue } from './testUtils/assertions.js';

suite("Tag Manager Tests", () => {
    test("it categorizes nodes", () => {
        const nodes = (AntlersDocument.fromText('{{ collection:articles }}{{ title }}{{ /collection:articles }}')).getAllAntlersNodes();

        assertCount(3, nodes);
        assertTrue(nodes[0].isTagNode);
        assertFalse(nodes[1].isTagNode);
        assertTrue(nodes[2].isTagNode);
    });
});