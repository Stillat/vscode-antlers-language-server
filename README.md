![](graphic.png)

# An Antlers Extension for Visual Studio Code

This Visual Studio Code extension provides rich language support for the Antlers templating language, used for building Statamic websites.

This extension provides the following awesome capabilities:

* Basic syntax highlighting, *and* parser-driving semantic highlighting
* Modifier signature suggestions
* Intelligent suggestions based on your unique project's blueprints, collections, and more!
* Support for core Statamic 3 tags, modifiers, and more!

## Installation

To install the extension on your local machine, simply open Visual Studio Code and search for "Antlers Language for Statamic" in the Extensions panel. Once you find it, click "Install".

The extension will automatically activate the next time you open an Antlers HTML file.

Want to take your install even further? Consider checking out the documentation at [https://antlers.dev/](https://antlers.dev/).

## Reloading Project Details {#reloading-project-details}

If you have made significant changes to your project's blueprints, globals, etc. and have Visual Studio Code open to just the `resources/` directory, you may want to force the extension to reload your project's details. This can be done from Visual Studio Code's [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) and searching for "Antlers: Reload Statamic Project Details".

## Migrating from Version 1 {#migrating-from-version-1}

Antlers Toolbox versions 1.x shipped with a bundled PHP analyzer. This has been removed with version 2, and may be replaced with a standalone Composer package at a later date. This bundled PHP analyzer would create an `.antlers.json` file at the root of your project, and may have created a `/storage/antlers-language-server/` directory.

The file(s) and directorie(s) created by the PHP analyzer from version 1 can be safely removed without any issues.

Some features like auto-detecting your project's custom tags, modifiers, etc. (as well as those from your Composer dependencies) will no longer work starting with version 2 because of the analyzer's removal.

This analyzer was removed to reduce the complexity (slightly) and bundle size of the extension.

## Reporting Issues

If you come across an issue, or have a suggestion to improve Antlers Toolbox, feel free to create an issue on the project's GitHub repository here:

[https://github.com/Stillat/vscode-antlers-language-server/issues](https://github.com/Stillat/vscode-antlers-language-server/issues)

If you are looking to report a security vulnerability, please **do not** create an issue on the GitHub repository.

To report sensitive issues or a security vulnerability please email [security@stillat.com](mailto:security@stillat.com) with the relevant details.

Emails requesting information on bounties, etc. will not be responded to.

## License

Antlers Toolbox is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
