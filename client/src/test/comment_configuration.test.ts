import * as assert from "assert";
import { resolveHtmlBlockComment } from "../utils/commentConfiguration";

suite("Comment Configuration", () => {
    test("it leaves HTML comment configuration alone by default", () => {
        assert.strictEqual(resolveHtmlBlockComment("page.antlers.html", false), null);
    });

    test("it uses Antlers comments for Antlers HTML files when enabled", () => {
        assert.deepStrictEqual(resolveHtmlBlockComment("page.antlers.html", true), ["{{#", "#}}"]);
    });

    test("it uses Antlers comments for Antlers XML files when enabled", () => {
        assert.deepStrictEqual(resolveHtmlBlockComment("PAGE.ANTLERS.XML", true), ["{{#", "#}}"]);
    });

    test("it restores HTML comments outside Antlers files when enabled", () => {
        assert.deepStrictEqual(resolveHtmlBlockComment("page.html", true), ["<!--", "-->"]);
    });
});
