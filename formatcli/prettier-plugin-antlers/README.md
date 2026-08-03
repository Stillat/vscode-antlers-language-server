# Antlers Prettier Plugin

The Antlers Prettier plugin offers a Prettier plugin based on the same engine that powers all other Antlers Toolbox formatting offerings.

## Installation

The Antlers Prettier Plugin can be installed with `npm` using the following command:

```bash
npm install prettier-plugin-antlers
```

> Note: Make sure you have at least version 1.1.7.

## Prettier 3 Configuration

To install the Prettier 3 plugin, use the following command:

```bash
npm install prettier-plugin-antlers@^2 --save-dev
```

After installing the plugin, you will need to update your `.prettierrc` file and make sure it contains the following values:

```json
{
    "plugins": [
        "prettier-plugin-antlers"
    ],
    "overrides": [
        {
            "files": [
                "*.antlers.html"
            ],
            "options": {
                "parser": "antlers"
            }
        }
    ]
}
```

## Options

### antlersArrayWrap

Controls how array literals inside Antlers regions are printed. Defaults to `collapse`.

| Value | Behavior |
|---|---|
| `collapse` | Array literals are always printed on a single line. |
| `preserve` | Array literals that span multiple lines in the source document keep spanning multiple lines, one item per line. Arrays written on a single line stay on a single line. |
| `expand` | Array literals containing at least one item are always printed across multiple lines, one item per line, regardless of how they were written. |

```json
{
    "antlersArrayWrap": "preserve",
    "plugins": [
        "prettier-plugin-antlers"
    ]
}
```

With `collapse`, long class lists built with the `classes` modifier are printed on one line:

```html
<span class="{{ ['block', 'font-semibold', 'text-green', 'underline' => is_current] | classes }}">
```

With `preserve`, the same region keeps the line breaks it was written with, and with `expand` it is always broken up:

```html
<span
    class="{{ [
        'block',
        'font-semibold',
        'text-green',
        'underline' => is_current
    ] | classes }}"
>
```

Empty arrays are always printed as `[]`.

> Note: `expand` can require a second formatting pass to settle. Introducing line breaks makes the surrounding element longer, which Prettier may then reflow onto multiple lines; the second pass is stable.

## Prettier 2 Installation and Configuration

To install the Prettier 2 plugin, use the following command:

```bash
npm install prettier-plugin-antlers@^1 --save-dev
```

If you continuously receive errors like "could not resolve module prettier-plugin-antlers", the following updates to a project's `.prettierrc` have proved successful:

```json
{
    "plugins": [
        "./node_modules/prettier-plugin-antlers/"
    ],
    "overrides": [
        {
        "files": "*.antlers.html",
        "vscodeLanguageIds": ["antlers"],
        "options": {
            "parser": "antlers"
        }
        }
    ]
}
```

## Visual Studio Code and Prettier

If you receive errors similar to "No formatter for 'Antlers' found" after installing the Prettier Visual Studio Code extension and the Antlers plugin, you may need to update your Visual Studio Code settings and add Antlers as one of the Prettier extensions. Inside your setting's JSON file, you can apply changes similar to the following:

```json
{
  "[antlers]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "prettier.documentSelectors": [
    "**/*.antlers.html"
  ]
}
```

## Tailwind CSS Prettier Plugin Compatibility

This plugin does not ship with the Tailwind CSS Prettier plugin. If you'd like to have that as well, you will need to install it separately :)

## Reporting Issues

If you come across an issue, or have a suggestion to improve Antlers Toolbox, feel free to create an issue on the project's GitHub repository here:

[https://github.com/Stillat/vscode-antlers-language-server/issues](https://github.com/Stillat/vscode-antlers-language-server/issues)

If you are looking to report a security vulnerability, please **do not** create an issue on the GitHub repository.

To report sensitive issues or a security vulnerability please email [security@stillat.com](mailto:security@stillat.com) with the relevant details.

Emails requesting information on bounties, etc. will not be responded to.

## License

This formatter utility is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
