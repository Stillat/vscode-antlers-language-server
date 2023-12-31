import assert from 'assert';
import { AntlersDocument } from "../runtime/document/antlersDocument.js";
import {
    assertCount,
    assertNodePosition,
    assertTrue,
} from "./testUtils/assertions.js";

suite("Front Matter Parsing", () => {
    const template = `---
hello: world
another: entry
---

{{ view:hello }}

end`;

    test("it extracts front matter", () => {
        const doc = AntlersDocument.fromText(template),
            nodes = doc.getAllNodes();

        assertTrue(doc.hasFrontMatter());
        assert.strictEqual(
            doc.getFrontMatter(),
            `hello: world
another: entry`
        );
        assertCount(3, nodes);
        assertNodePosition(nodes[1], 6, 1, 6, 16);
    });
});
