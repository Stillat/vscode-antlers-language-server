import { HtmlFragments } from '../runtime/parser/htmlFragments.js';
import { assertFalse, assertTrue } from './testUtils/assertions.js';

suite("HTML Fragments Suite", () => {
    test('it detects HTML end fragments', () => {
        assertTrue(HtmlFragments.endsWithFragment('</div><h1 '));
        assertFalse(HtmlFragments.endsWithFragment('><div>'));
        assertTrue(HtmlFragments.endsWithFragment('</div><h1 class="<'));
        assertTrue(HtmlFragments.endsWithFragment('<div v-if="3 > 4" class="<>'));
        assertFalse(HtmlFragments.endsWithFragment('<div v-if="3 > 4" class="<>">'));
        assertFalse(HtmlFragments.endsWithFragment('<div v-if="3 > 4" class="<>">content'));
    });
});