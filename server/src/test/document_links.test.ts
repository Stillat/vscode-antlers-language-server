import assert from "assert";
import { IProjectDetailsProvider } from "../projects/projectDetailsProvider.js";
import { IView } from "../projects/views/view.js";
import { AntlersDocument } from "../runtime/document/antlersDocument.js";
import { makePartialDocumentLink } from "../services/antlersLinks.js";

const partial = {
    displayName: "Introduction",
    documentUri: "file:///project/resources/views/page_builder/projects/introduction.antlers.html",
} as IView;

function makeProject() {
    return {
        findRelativeView(name: string) {
            return name == "page_builder/projects/introduction" ? partial : null;
        },
    } as IProjectDetailsProvider;
}

function makeLink(input: string) {
    const node = AntlersDocument.fromText(input).getAllAntlersNodes()[0];

    return makePartialDocumentLink(node, makeProject());
}

suite("Document Links", () => {
    test("it links method-style partials", () => {
        const link = makeLink("{{ partial:page_builder/projects/introduction }}");

        assert.notStrictEqual(link, null);
        assert.strictEqual(link?.tooltip, "Partial: Introduction");
        assert.strictEqual(link?.target, partial.documentUri);
    });

    test("it links double-quoted src partials", () => {
        const input = '{{ partial src="page_builder/projects/introduction" }}';
        const link = makeLink(input);

        assert.deepStrictEqual(link?.range, {
            start: { line: 0, character: 16 },
            end: { line: 0, character: 50 },
        });
        assert.strictEqual(input.slice(link?.range.start.character, link?.range.end.character), "page_builder/projects/introduction");
    });

    test("it links single-quoted src partials", () => {
        const link = makeLink("{{ partial src='page_builder/projects/introduction' }}");

        assert.notStrictEqual(link, null);
        assert.strictEqual(link?.target, partial.documentUri);
    });

    test("it does not link dynamic src parameters", () => {
        assert.strictEqual(makeLink('{{ partial :src="page_builder/projects/introduction" }}'), null);
    });

    test("it does not link unknown partials", () => {
        assert.strictEqual(makeLink('{{ partial src="unknown" }}'), null);
    });
});
