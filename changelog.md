# Change Log

Bugs fixed, what's new, and more! :)

## v2.5.0

- Adds the ability to disable formatting template sections

To disable formatting, we can use the special `{{# format-ignore-start #}}` and `{{# format-ignore-end #}}` Antlers comments:

```antlers
<div>
<div>
{{# format-ignore-start #}}
<div class="class1 class2">
            This section
                will not be formatted.
        </div>
{{# format-ignore-end #}}
</div>
</div>
```

The special formatting comments must appear on separate lines by themselves.

## v2.4.9

- Improves formatting of strings inside `unless` Tags

## v2.4.6

- Improves server stability when analyzing dynamic classes

## v2.4.5

- Improves tag parameter suggestions
- Corrects an issue that could lead to incomplete tags adding extra newlines after formatting
- Corrects an issue with formatting Antlers tags within HTML attributes

## v2.4.5

- Improves error reporting of tags containing `::` to align with latest Antlers version
- Improves error reporting of Antlers tags starting with array literals

## v2.4.4

- Improves partial tag completions inside nested scopes

## v2.4.2

- Improves formatting of dynamic HTML elements

## v2.4.1

- Adds support for the `user:password_form` tag
- Adds support for the `user:profile_form` tag

## v2.4.0

- Improves descriptions for the `first` and `last` modifiers
- Improves the consistency of modifier and modifier parameter descriptions
- Corrects a handful of typos in modifier descriptions
- Improves the internal support for `assets` variables
- Improves the consistency of tag and tag parameter descriptions
- Corrects a handful of tag/parameter description typos
- Improves internal management of collections without any user blueprint customizations
- Adds collections without any user blueprint modifications to suggestions
- Adds field injections to completion results for collections without any user blueprint modifications
- Adds blueprint overview and automated documentation generation (beta)

## v2.3.9

- Improves parser support for Antlers `list` keyword
- Improves internal support for `assets` fieldtypes
- Adds internal support for detecting Query Builder augmented fields
- Internally resolves blueprint and field-type field references where there has not been enough context to do so historically
- Provides linting feedback when tag parameter values are not surrounded in single or double quotes
- Adds the ability to disable *all* diagnostics warnings using the `antlersLanguageServer.diagnostics.reportDiagnostics` configuration option
- Adds warnings when using the `join` or `joinplode` modifiers directly on `select` fieldtypes
- The formatters no longer format `<script>` tags when they contain Antlers tag pairs
- Adds warnings when using modifiers directly on fields that augment to query builders
- Antlers Toolbox no longer requires editing files/restarting Visual Studio Code in order for error reporting to update after changing the current language version
- Improvements to internal modifier suggestion management and parsing
- Adds support for the `bool_string` modifier
- Adds common date/time format variables to the `format` modifier's hover tooltip
- Adds support for the `when` and `unless` partial tag parameters
- Improves tag-specific contextual completion suggestions

## v2.3.8

- Improves line wrapping when formatting method-style modifiers
- Adds support for the `key_by` modifier
- Adds support for the `mark` modifier
- Adds support for the `regex_mark` modifier
- Adds support for the `page_name` Collection parameter
- Adds support for the `cookie` tags
- Adds support for the `glide:data_url` tag

## v2.3.7

- Improves parsing of tag names containing "or" in the method part (https://github.com/Stillat/vscode-antlers-language-server/issues/49)

## v2.3.6

- Improves indentation when formatting Antlers structures inside embedded documents

## v2.3.5

- Adds `user` completion item to the `cache` tag's `scope` parameter
- Adds `collection_term_workaround` completion item to the `locales` tag
- Adds `blueprint` entry variable to scope and completion items
- Adds support for the `antlers` modifier
- Adds support for the `bard_text`  modifier
- Adds support for the `bard_html` modifier
- Adds support for the `bard_items` modifier
- Adds support for the `user_roles` tag
- Adds support for the `user_groups` tag

## v2.3.4

- Fixes a bug that would split up tag names if they contained characters that look like operators
- Improves the preservation of line breaks when formatting

## v2.3.3

- Improves formatting of expanded inline `switch` groups
- Preserves space on nested `switch` or `list` operators

## v2.3.2

- Adds additional YAML parsing checks to prevent crashing the language server

## v2.3.1

- Improves parsing and error reporting of array access variables

## v2.3.0

- Warning `ANTLER_521` will now be emitted for deprecated modifiers
- Deprecated modifiers will no longer appear in suggestions
- Warning `ANTLER_520` will now be emitted when dynamic CSS class names are detected 


## v2.2.4

- Corrects an issue when Front Matter documents
- Makes the removal of new lines after formatting less aggressive

## v2.2.3

- Disables the request input diagnostics handler temporarily

## v2.2.2

- Corrects an issue where `}}` could be duplicated following a comment and there are no other Antlers nodes in the document

## v2.2.1

- Corrects an issue where some content may be deleted after a comment and there is no other Antlers in the document

## v2.2.0

> Note: This version removes the `Antlers: Use Prettier First` configuration option. This option has been removed in favor of an Antlers Prettier Plugin. Impacted users should consider installing and configuring this plugin: [https://www.npmjs.com/package/prettier-plugin-antlers](https://www.npmjs.com/package/prettier-plugin-antlers)

- Introduces a new underlying formatting engine
- Removes the `Antlers: Use Prettier First` configuration option
- Adds support for the `nocache` tag
- Emits warnings when request variables (`get` or `post`) do not have the `sanitize` modifier applied to their output

## v2.1.6

- Improves parsing of parameters that begin with numbers

## v2.1.5

- Adds support for the `{{ vite }}` tag
- Improves linting of tag parameters that utilize dynamic binding

## v2.1.4

- Adds "Refactor to partial..." code action
- Adds convert condition to ternary or gatekeeper operator refactors

## v2.1.2

- User created Antlers variables will now appear within completion suggestions
- Tag pairs within interpolations will now report their errors properly
- Adds support for the `[ANTLR_131] Unpaired closing tag` error
- Improves error message reporting (reduces multiple warning variants, removes some duplicates, etc.)
- Fixes inconsistent final newline formatting

## v2.1.1

- Adds support for detecting recursive partials

## v2.1.0

- Renames `mount` tag to `mount_url` tag
- Adds support for the `to_bool` modifier
- Improves parsing of Front Matter variables within partials
- Validates required partial parameters when marked required using `@param*` IDE hints
- Fixes a handful of bugs related to IDE hints and partials
- Fixes partial parameter suggestions not appearing

## v2.0.18

- Adds support for the `mount` tag

## v2.0.17

- Improves formatting of Antlers inside conditions containing `<script>` tags

## v2.0.16

- Improves formatting of Antlers inside `<script>` tags

## v2.0.14

- Updates types supported by the `first` and `last` modifier to improve error reporting

## v2.0.13

- Adds `.antlers.php` and `.antlers.xml` extensions
- Adds `AVIF` option to Glide suggestions

## v2.0.12

- Improves behavior of `noparse` regions
- Improves formatting of `switch` operators
- Removes Antlers before formatting with Prettier (if enabled)

## v2.0.11

- Improves error reporting when using modifiers within the `groupby` operator
- Adds `stack` and `push` to the syntax highlighting tag list

## v2.0.10

- Corrects an issue where the formatter would not emit `:` or `.` when used as variable components [#24](https://github.com/Stillat/vscode-antlers-language-server/issues/24)

## v2.0.9

- Renames the `ANTLER_507` linter error code to `ANTLR_507` for consistency

## v2.0.8

- Adds hyphenated variable support to the Antlers formatter

### Bug Fixes

- Prevents comments from being parsed as Antlers [#23](https://github.com/Stillat/vscode-antlers-language-server/issues/23)

## v2.0.6

## User Experience Updates

* Dramatically improves accuracy of the out-of-box syntax highlighting experience
  * Antlers is now highlighted within HTML attributes
  * Modifier value colors now longer "flow" into the next token type
  * All default Statamic variables are no longer given any special preference over user variables for consistency
  * The default style for tag names has been subtly adjusted, to make them more distinct from method names
* Adds support for Front Matter YAML syntax highlighting
* Adds support for inline PHP syntax highlighting
* The Antlers Outline panel was completely rewritten to provide better accuracy, and provide a more thorough overview of your Antlers template
* Antlers code folding engine has been greatly improved
* Pagination parameter analysis will now apply to numeric values in addition to boolean values
* Document diagnostics analysis for debug tags and modifiers are now more reactive
* Improved detection of partial document links
* Improves partial document link generation such that partial tag parameters are no longer links
* Improves the Antlers formatter

## Technical Updates

* Removed the extensibility API until the new parser is fully implemented
* Removed the bundled PHP analyzer to simplify the extension development and management
* The TextMate grammar was rewritten from the ground up, to provide better interoperability with tools like TorchLight
  * The Semantic Tokens service was also rewritten, and simplified. The Semantic Tokens service now handles the following cases (instead of most things like before):
    * Resolving modifier names in more complicated scenarios
    * Resolving user-provided tag names
    * Resolving numeric values
* A new backend parser and reflection API
* The backend services are now capable of handling more complex fault scenarios such as incomplete Antlers tags, incorrectly paired tags, etc. while continuing to provide document analysis
* The project's `publish:grammar` NPM script has been removed in favor of editing the `antlers.json` syntax file directly

## v1.1.4

* Prevents the formatter from adding `undefined` to templates when conditional line leading whitespace is unknown ([#15](https://github.com/Stillat/vscode-antlers-language-server/issues/15))

## v1.1.3

* Improves the formatting behavior of `unless` conditionals ([#14](https://github.com/Stillat/vscode-antlers-language-server/issues/14))

## v1.1.2

* Adds support for the `all` and `self` locale tag parameters
* Improves default variable support for the `locale` tag

## v1.1.1

* Adds support for the `array` when using the `foreach` and `iterate` tags

## v1.1.0

* Adds a new `antlersOverrideHtmlComments` configuration option that can be used to always use Antlers comments in HTML documents
* Adds support for the `split` array modifier
* Adds support for the `format_translated` date modifier
* Adds support for the `add_slashes` string modifier
* Adds additional scope variables for the `nav` tag
* Adds support for `exists` and `if_exists` methods on the `partial` tag
* Improves completions for manifested array variables when using parameter-style modifiers

## v1.0.32

* Improves internal scope resolution

## v1.0.31

* Improves validation warnings with the `glide` tag

## v1.0.30

* Makes improvements to partial suggestions

## v1.0.29

* Background work to support an eventual Antlers Debugger

## v1.0.28

* Developers can now use VS Code's document links to navigate to detected partial files
* Developers can now see an overview/outline of their Antlers document within the Outline panel

## v1.0.24

* Removes `name` from the list of `statamic-tag-native-variable` to improve out-of-box syntax highlighting consistency [#11](https://github.com/Stillat/vscode-antlers-language-server/issues/11)

## v1.0.23

* The extension will no longer display warnings for unknown parameters (based on user feedback)
* Adds support for the field set prefixes when importing field-sets in auto-completion
* Adds support for the `installed` tag, with composer package autocompletions
* Automatically detects variable names within partials and adds them to the tag's parameter auto complete list.
