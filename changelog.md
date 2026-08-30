# Change Log

Bugs fixed, what's new, and more! :)

## 2.8.0

This release expands standards-based editor support and improves compatibility for non-VS Code language clients.

### Language server and editor experience

- Replaces the retired Blueprint Explorer project-detail notification and VS Code-specific broad file watcher with scoped, dynamically registered LSP file watchers. Project reloads are debounced, contained when they fail, and remain retryable. (#140)
- Adds standard LSP range formatting while preserving surrounding indentation, LF or CRLF line endings, and existing trailing-newline behavior. (#142)
- Exposes full-document and range semantic tokens through standard LSP requests, including project-aware token classifications and refresh support. (#143)
- Adds project-aware workspace symbol search for Statamic views, partials, blueprints, fieldsets, globals, and fields, with cancellation and bounded results for large projects. (#144)
- Adds optional Statamic field type inlay hints through `antlersLanguageServer.inlayHints.showFieldTypes`. The setting is disabled by default. (#145)
- Defaults the Antlers language target to the current `runtime` implementation while keeping `regex` available for existing configurations. (#149)

### Stability and project health

- Hardens the VS Code debug runtime lifecycle by owning and cleaning up session resources, rejecting invalid Statamic storage paths before startup succeeds, and advertising only supported debugger capabilities. (#141)
- Corrects parser content-offset tracking used by shared editor and formatter flows. (#148)
- Repairs ESLint support for the ESM package, cleans the maintained TypeScript tree, and enforces linting in CI. (#146, #148)
- Normalizes tracked text to LF and enforces consistent line endings across platforms. (#148)

## 2.7.0

This is a large formatter, language support, stability, and project health release.

- Requires Visual Studio Code 1.91 or newer.

### Formatting

- Adds `preserve` and `collapse` array wrapping modes across VS Code, Prettier, and the formatter CLI. Multi-line arrays are preserved by default, while single-line arrays remain inline. (#118, #117, #83)
- Normalizes preserved array indentation across nested arrays, surrounding indentation levels, configured space widths, and tabs without introducing formatting drift. (#129)
- Preserves trailing content after nested interpolation, triple fallback operators, shorthand variable parameters, quoted modifier values, automatic statement boundaries, and relative comment indentation. (#119, #116, #115, #100, #99, #98)
- Improves nested switch formatting, including switches inside long HTML attributes and nested function arguments. (#125, #81)
- Improves formatter parity with current Antlers syntax, including shorthand arrays, array accessors, arrow/dot/colon method chains, escaped braces, and authored escape sequences. (#127)
- Formats embedded PHP consistently through VS Code, Prettier, and the formatter CLI, with stable indentation for spaces and tabs while preserving invalid PHP and multiline string contents. (#128, #86)

### Language support and editor experience

- Adds current Statamic core tags and explicit methods to completions, diagnostics, scopes, and highlighting. (#126)
- Adds completion parity for Antlers components using `s-`, `s:`, `statamic-`, and `statamic:` syntax, including parameter names, project-backed values, and bound scope variables. (#126)
- Adds completion and highlighting support for `@props`, `@aware`, and `@cascade` directives. (#126)
- Improves syntax highlighting between HTML attributes, inside modifier strings, around conditional attributes, for dynamic HTML tags, and within Alpine attributes. (#124, #93, #91, #105)
- Reports invalid `{{ else if ... }}` syntax and suggests the supported `elseif` spelling. (#121, #109)
- Resolves document links for quoted `partial src=...` parameters while preserving method-style partial links. (#122, #103)
- Applies the HTML comment override setting reliably when the extension activates and when active editors or resource-scoped settings change. (#123, #107)

### Stability

- Hardens project scanning against directory symlinks, broken entries, inaccessible paths, and incorrectly unfiltered direct scans. (#120, #110)
- Publishes project details as an LSP notification so non-VS Code clients no longer need to implement a private request to avoid a server crash. (#130, #59)

### Project health

- Adds the full server and client test suite to GitHub Actions across Windows and Ubuntu on Node.js 22 and 24. (#131)
- Removes the legacy documentation webview and its separate frontend build. (#132)
- Updates vulnerable runtime dependencies and refreshes the dependency tree. (#133)
- Updates esbuild, adopts the official scoped VS Code debug packages, and removes unused deprecated VS Code test infrastructure. (#134, #135)
- Updates the project to TypeScript 6 and Node16 module resolution. (#136)
- Updates the language client and server to 10.1.1, the Language Server Protocol packages to 3.18.3, and the minimum supported VS Code version to 1.91. (#137)

## 2.6.22

- Rebuild (correct issue with reloading project details) (#106)
- Filter falsey names from suggestions
- Removes global snippets from completions list

## 2.6.21

- Corrects incorrect diagnostics for some operators (#97)

## 2.6.20

- Corrects an issue where "and" would cause incorrect diagnostic reports (#95)

## 2.6.19

- Corrects an issue when formatting escape sequences in nested strings (#90)

## 2.6.18

- Improves type checking of event arguments to prevent console errors (#88)

## 2.6.17

- Adds support for the `select` modifier
- Adds support for `flatten`'s `depth` parameter
- Adds support for the `keys` modifier
- Adds support for the `values` modifier
- Adds support for the `attribute` modifier

## 2.6.16

- Corrects an issue when using `{{# format-ignore-start #}}` (#87)

## 2.6.15

- Corrects an issue when formatting interpolated content in conditions (#85)

## 2.6.14

- Corrects an issue causing required partial parameter errors from appearing on closing tags (#84)

## 2.6.13

- Provides partial parameter descriptions in suggestions.

## 2.6.12

- Corrects a few formatting bugs (#80)

## 2.6.11

- Corrects an issue where extra whitespace is added around `->` method invocation syntax

## 2.6.10

- Corrects an issue with string array indexes duplicating leading variable names when formatting (#79)

## 2.6.9

- Improves formatting of `<script>` and `<style>` tags when multiple appear in a document, and at least one contains Antlers tag pairs
- Improves highlighting of HTML tags inside HTML comments (#78)
- Renames internal `template_contents` variable to `template_content`
- Improves error reporting surrounding array syntax
- Adds language server support for experimental escaped Antlers parameter syntax
- Adds support for the `classes` modifier
- Adds support for the `svg` tag's `sanitize` parameter
- Adds support for the `svg` tag's `allow_attrs` parameter
- Adds support for the `svg` tag's `allow_tags` parameter
- Adds support for the `is_svg` augmented assets variable
- Improves support for partial linking when omitting the "partials/" directory prefix

## 2.6.8

- Corrects an issue where the formatter may duplicate content within `<script>` tags (#76)

## 2.6.6

- Improves directory scanning logic (#74)

## 2.6.5

- Improves error reporting with arrays as modifier values

## 2.6.4

- Improves modifier type diagnostics reporting

## 2.6.3

- Refactors how Antlers comment styles are applied (watches for file changes to apply only on `.antlers.html` and `.antlers.xml`)

## 2.6.2

- Removes block comments from the Antlers configuration file, relying entirely on the setting when the extension is activated

## 2.6.1

- Improves formatting of comments when they begin a line and are followed by a literal node (#71)

## 2.6.0

- Adds completion support for custom Tags and modifiers,
- Improves general formatting,
- Improves modifier completions and parameter suggestions, particularly with method-style syntax,
- Adds initial support for select Statamic Marketplace addon tags and modifiers,
  - `aerni/social-links`
  - `aerni/advanced-seo`
  - `aerni/livewire-forms`
  - `anakadote/statamic-recaptcha`
  - `aryehraber/statamic-captcha`
  - `cnj/seotamic`
  - `ddm-studio/cookie-byte`
  - `doublethreedigital/simple-commerce`
  - `jonassiewertsen/statamic-livewire`
  - `kolaente/statamic-snippet`
  - `octoper/statamic-inline-assets`
  - `parfaitementweb/statamic-fast-seo`
  - `statamic/seo-pro`
  - `stillat/antlers-layouts`
  - `visuellverstehen/statamic-classify`
  - `withcandour/aardvark-seo`
- Adds support custom Collection Tag filter autocomplete

## 2.5.3

- Improves static analysis of Query Builder modifier detection
- Improves formatting of tags using strict-tag syntax

## 2.5.2

- Corrects an issue when formatting ignored regions containing tag pairs

## 2.5.1

- Improves formatting of interpolated variables

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
