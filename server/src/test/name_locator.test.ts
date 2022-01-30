import assert = require("assert");
import { AntlersDocument } from "../runtime/document/antlersDocument";
import { assertNotNull } from "./testUtils/assertions";

suite("Name Locator", () => {
    test("it resolves names at positions", () => {
        const template = `
start
    {{ collection:articles paginate="true" limit="10" }}


{{ collection:pages }}
end
`;
        const doc = AntlersDocument.fromText(template),
            name = doc.cursor.getNameAt(3, 45);

        assertNotNull(name);
        assert.strictEqual(name?.name, "collection");
        assert.strictEqual(name?.methodPart, "articles");
    });
});
