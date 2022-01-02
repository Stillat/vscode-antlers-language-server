import assert = require("assert");
import { AntlersDocument } from "../runtime/document/antlersDocument";

suite("Document Word Test", () => {
    const template = `{{ collection:articles from="" }}
	<p>Hello, wilderness.</p>
{{ /collection:articles }}`;

    test("relative words are resolved", () => {
        const document = AntlersDocument.fromText(template);

        const word1 = document.cursor.wordAt(3, 21),
            word2 = document.cursor.wordAt(3, 23),
            word3 = document.cursor.wordAt(3, 24);

        assert.strictEqual(word1, "articles");
        assert.strictEqual(word2, "articles");
        assert.strictEqual(word3, "");

        assert.strictEqual(document.cursor.wordAt(3, 9), "collection");
        assert.strictEqual(document.cursor.wordAt(1, 12), "collection");
        assert.strictEqual(document.cursor.wordAt(1, 26), "from");

        assert.strictEqual(document.cursor.wordAt(2, 12), "Hello");
        assert.strictEqual(document.cursor.wordAt(2, 18), "wilderness");

        assert.strictEqual(document.cursor.wordRightAt(1, 16), "from");
        assert.strictEqual(document.cursor.wordLeftAt(1, 16), "collection");

        assert.strictEqual(document.cursor.wordLeftAt(2, 12), "p");
        assert.strictEqual(document.cursor.wordRightAt(2, 12), "wilderness");
    });

    test("relative punctuation is resolved", () => {
        const document = AntlersDocument.fromText(template);

        assert.strictEqual(document.cursor.punctuationLeftAt(1, 21), ":");
        assert.strictEqual(document.cursor.punctuationLeftAt(1, 6), "{");
        assert.strictEqual(document.cursor.punctuationLeftAt(2, 5), null);
        assert.strictEqual(document.cursor.punctuationLeftAt(3, 11), "/");
        assert.strictEqual(document.cursor.punctuationLeftAt(3, 12), "/");
        assert.strictEqual(document.cursor.punctuationLeftAt(3, 13), "/");
        assert.strictEqual(document.cursor.punctuationLeftAt(3, 14), "/");
        assert.strictEqual(document.cursor.punctuationLeftAt(3, 17), ":");
        assert.strictEqual(document.cursor.punctuationLeftAt(3, 18), ":");
        assert.strictEqual(document.cursor.punctuationLeftAt(3, 19), ":");
        assert.strictEqual(document.cursor.punctuationLeftAt(3, 20), ":");

        assert.strictEqual(document.cursor.punctuationRightAt(3, 17), "}");
        assert.strictEqual(document.cursor.punctuationRightAt(3, 18), "}");
        assert.strictEqual(document.cursor.punctuationRightAt(3, 19), "}");
        assert.strictEqual(document.cursor.punctuationRightAt(3, 20), "}");
    });
});
