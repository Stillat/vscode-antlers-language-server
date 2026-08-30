import assert from "assert";
import { reindentFormattedRange } from "../formatting/rangeFormatting.js";

suite("Range Formatter", () => {
    test("it restores the selection's surrounding indentation", () => {
        const source = "    <div>\n        {{ title }}\n    </div>\n";
        const formatted = "<div>\n    {{ title }}\n</div>";

        assert.strictEqual(
            reindentFormattedRange(source, formatted),
            "    <div>\n        {{ title }}\n    </div>\n"
        );
    });

    test("it does not add a trailing newline to an inline selection", () => {
        assert.strictEqual(
            reindentFormattedRange("  {{ title }}", "{{ title }}\n"),
            "  {{ title }}"
        );
    });
});
