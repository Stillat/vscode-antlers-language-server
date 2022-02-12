# Antlers Formatter CLI

The Antlers formatter CLI is an opinionated formatting tool built on top of [js-beautify](https://github.com/beautify-web/js-beautify), and is provided as a standalone version of the formatter that ships with the Visual Studio Code extension.

## Installation

The command line Antlers formatter can be installed with `npm` using the following command:

```
npm install antlers-formatter -g
```

The `format` command accepts the following options:

| Option | Flag | Description |
|---|---|--|
| `file` | `--f` | The path to the template to format. |
| `dir` | `--d` | A directory path to format all Antlers files, recursively. |
| `output` | `--out` | An optional file path where the formatted results will be saved. When specified, the `file` (or files in a directory) is not overwritten. |
| `dump` | `--dd` | When specified, no results are saved to disk. Formatted results are displayed within the terminal. |
| `options` | `--o` | An optional file path to a JSON file containing Antlers formatting settings. |

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
    "tabSize": 4,
    "formatExtensions": [
        ".antlers.html"
    ]
}
```

* `formatFrontMatter` - Controls whether document Front Matter is formatted.
* `insertSpaces` - Controls whether the Antlers formatter should insert spaces
* `maxStatementsPerLine` - Suggests a maximum number of Antlers statements that should appear on a single line (i.e., `{{ test; test += 3; test += 5; }}`)
* `tabSize` - The number of spaces to use for indentation
* `formatExtensions` - A list of file extensions that will be formatted when formatting a directory.

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

## Reporting Issues

If you come across an issue, or have a suggestion to improve Antlers Toolbox, feel free to create an issue on the project's GitHub repository here:

[https://github.com/Stillat/vscode-antlers-language-server/issues](https://github.com/Stillat/vscode-antlers-language-server/issues)

If you are looking to report a security vulnerability, please **do not** create an issue on the GitHub repository.

To report sensitive issues or a security vulnerability please email [security@stillat.com](mailto:security@stillat.com) with the relevant details.

Emails requesting information on bounties, etc. will not be responded to.

## License

This formatter utility is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
