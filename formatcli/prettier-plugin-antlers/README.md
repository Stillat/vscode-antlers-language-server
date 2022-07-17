# Antlers Prettier Plugin

The Antlers Prettier plugin offers a Prettier plugin based on the same engine that powers all other Antlers Toolbox formatting offerings.

## Installation

The Antlers Prettier Plugin can be installed with `npm` using the following command:

```bash
npm install prettier-plugin-antlers
```

> Note: Make sure you have at least version 1.1.7.

## Configuration

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
