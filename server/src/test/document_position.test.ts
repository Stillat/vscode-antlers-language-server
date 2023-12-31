import assert from 'assert';
import { AntlersDocument } from "../runtime/document/antlersDocument.js";
import { Position } from "../runtime/nodes/position.js";
import { assertNotNull, assertNull } from "./testUtils/assertions.js";

suite("Document Positions Test", () => {
    const template = `<p>Outer Start</p>
{{ articles }}
<p>start</p>
{{ if title == 'Nectar of the Gods' }}
<p>Inner literal one.</p>
{{ elseif 5 < 10 }}
<p>Inner literal two.</p>
{{ else }}
<p>Else- inner literal three..</p>
{{ /if }}
<p>end</p>
{{ /articles }}
<p>Outer end</p>`;

    test("cursor positions are resolved", () => {
        const document = AntlersDocument.fromText(template);

        const posOne = document.cursor.position(2, 5);
        assertPosition(posOne, 5, 23, 2, 23);
        assert.strictEqual(document.charAt(posOne), "r");

        const posTwo = document.cursor.position(6, 11);
        assertPosition(posTwo, 11, 122, 6, 122);
        assert.strictEqual(document.charAt(posTwo), "5");

        const posThree = document.cursor.position(13, 16);
        assertPosition(posThree, 16, 256, 13, 256);
        assert.strictEqual(document.charAt(posThree), ">");

        const posFour = document.cursor.position(1, 1);
        assertPosition(posFour, 1, 0, 1, 0);
        assert.strictEqual(document.charAt(posFour), "<");
    });

    test("line indexes are resolved", () => {
        const document = AntlersDocument.fromText(template);

        const lineIndex1 = document.getLineIndex(1),
            lineIndex2 = document.getLineIndex(2),
            lineIndex3 = document.getLineIndex(13),
            lineIndex4 = document.getLineIndex(14);

        assertNotNull(lineIndex1);
        assertNotNull(lineIndex2);
        assertNotNull(lineIndex3);
        assertNull(lineIndex4);

        assert.strictEqual(lineIndex1?.start, 0);
        assert.strictEqual(lineIndex1?.end, 18);

        assert.strictEqual(lineIndex2?.start, 19);
        assert.strictEqual(lineIndex2?.end, 33);

        assert.strictEqual(lineIndex3?.start, 241);
        assert.strictEqual(lineIndex3?.end, 256);
    });

    test("relative characters are resolved", () => {
        const document = AntlersDocument.fromText(template);

        let char = document.cursor.charAt(1, 2),
            leftChar = document.cursor.charLeftAt(1, 2),
            rightChar = document.cursor.charRightAt(1, 2);

        assert.strictEqual(char, "p");
        assert.strictEqual(leftChar, "<");
        assert.strictEqual(rightChar, ">");

        char = document.cursor.charAt(6, 11);
        leftChar = document.cursor.charLeftAt(6, 11);
        rightChar = document.cursor.charRightAt(6, 11);

        assert.strictEqual(char, "5");
        assert.strictEqual(leftChar, " ");
        assert.strictEqual(rightChar, " ");

        char = document.cursor.charAt(6, 15);
        leftChar = document.cursor.charLeftAt(6, 15);
        rightChar = document.cursor.charRightAt(6, 15);

        assert.strictEqual(char, "1");
        assert.strictEqual(leftChar, " ");
        assert.strictEqual(rightChar, "0");

        char = document.cursor.charAt(13, 16);
        leftChar = document.cursor.charLeftAt(13, 16);
        rightChar = document.cursor.charRightAt(13, 16);

        assert.strictEqual(char, ">");
        assert.strictEqual(leftChar, "p");
        assert.strictEqual(rightChar, "");

        char = document.cursor.charAt(15, 16);
        leftChar = document.cursor.charLeftAt(15, 16);
        rightChar = document.cursor.charRightAt(15, 16);

        assertNull(char);
        assertNull(leftChar);
        assertNull(rightChar);
    });

    test("line content is resolved", () => {
        const document = AntlersDocument.fromText(template);

        const lt1 = document.getLineText(1),
            lt2 = document.getLineText(2),
            lt3 = document.getLineText(13),
            lt4 = document.getLineText(15);

        assertNotNull(lt1);
        assertNotNull(lt2);
        assertNotNull(lt3);
        assertNull(lt4);

        assert.strictEqual(lt1, "<p>Outer Start</p>");
        assert.strictEqual(lt2, "{{ articles }}");
        assert.strictEqual(lt3, "<p>Outer end</p>");
    });
});

function assertPosition(
    position: Position | null,
    char: number,
    index: number,
    line: number,
    offset: number
) {
    assertNotNull(position);
    assert.strictEqual(position?.char, char);
    assert.strictEqual(position?.index, index);
    assert.strictEqual(position?.line, line);
    assert.strictEqual(position?.offset, offset);
}
