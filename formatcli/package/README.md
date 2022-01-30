# Antlers Formatter CLI

The Antlers formatter can be used to format Antlers template files from a command line environment. Currently, this utility only offers a single `format` command.

The `format` command accepts the following options:

| Option | Description |
|---|---|
| `file` `--f` | The path to the template to format. |
| `output` `--o` | An optional file path where the formatted results will be saved. When specified, the `file` is not overwritten. |
| `dump` `--dd` | When specified, no results are saved to disk. Formatted results are displayed within the terminal. |
| `options` `--o` | An optional file path to a JSON file containing Antlers formatting settings. |

General usage:

```
antlersformat format --f="/path/to/file/to/format.antlers.html"
```

## Antlers Formatting Settings

The default Antlers formatter settings look like this when saved as JSON:

```json
{
    "htmlOptions": {},
    "formatFrontMatter": true,
    "insertSpaces": true,
    "maxStatementsPerLine": 3,
    "tabSize": 4
}
```

* `formatFrontMatter` - Controls whether document Front Matter is formatted.
* `insertSpaces` - Controls whether the Antlers formatter should insert spaces
* `maxStatementsPerLine` - Suggests a maximum number of Antlers statements that should appear on a single line (i.e., `{{ test; test += 3; test += 5; }}`)
* `tabSize` - The number of spaces to use for indentation

The `htmlOptions` object may be used to set the HTML formatting options used by the Antlers formatter. These settings follow the same rules as the default [Visual Studio Code HTML Formatter](https://code.visualstudio.com/docs/languages/html#_formatting). The formatter will do its best to respect these settings, but may be unable to under certain circumstances.

* `htmlOptions.indentEmptyLines`
* `htmlOptions.wrapLineLength`
* `htmlOptions.unformatted`
* `htmlOptions.indentInnerHtml`
* `htmlOptions.wrapAttributes`
* `htmlOptions.wrapAttributesIndentSize`
* `htmlOptions.preserveNewLines`
* `htmlOptions.indentHandlebars`
* `htmlOptions.endWithNewline`
* `htmlOptions.extraLiners`
* `htmlOptions.indentScripts`
* `htmlOptions.unformattedContentDelimiter`

## License

This formatter utility is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
