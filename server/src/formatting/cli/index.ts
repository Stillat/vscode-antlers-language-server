#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/no-var-requires
const yargs = require('yargs'), path = require('path');

import * as fs from 'fs';
import { AntlersSettings } from '../../antlersSettings';
import { AntlersDocument } from '../../runtime/document/antlersDocument';
import { AntlersFormattingOptions } from '../antlersFormattingOptions';
import { BeautifyDocumentFormatter } from '../beautifyDocumentFormatter';

const defaultAntlersSettings: AntlersSettings = {
    formatFrontMatter: false,
    showGeneralSnippetCompletions: true,
    diagnostics: {
        warnOnDynamicCssClassNames: true,
        validateTagParameters: true,
    },
    trace: { server: 'off' },
    formatterIgnoreExtensions: ['xml'],
    languageVersion: 'runtime'
};

const EXIT_SUCCESS = 0,
    EXIT_FILE_NOT_FOUND = 3,
    EXIT_GENERAL_FAILURE = 1,
    EXIT_PATH_PERMISSIONS_ISSUE = 4,
    AUTO_FORMAT_CONFIG_PATH = '.antlers.format.json';

const argv = yargs.command('format', 'Formats a file and writes the changes to disk', {
    path: {
        description: 'The file to format',
        alias: 'f',
        type: 'string'
    },
    dir: {
        description: 'The directory to format',
        alias: 'd',
        type: 'string'
    },
    stdin: {
        description: 'Indicates that the formatter should use stdin input',
        alias: 's',
        type: 'boolean',
        default: false
    },
    output: {
        description: 'An optional output path',
        alias: 'out',
        type: 'string',
        default: null
    },
    dump: {
        description: 'Optionally writes the formatted results to the output instead of saving',
        alias: 'dd',
        type: 'boolean',
        default: false
    },
    options: {
        description: 'An optional path to an Antlers format configuration file',
        alias: 'o',
        type: 'string'
    }
}).help().alias('help', 'h').argv;

const additionalArgs = argv._;

const defaultSettings: AntlersFormattingOptions = {
    htmlOptions: {},
    formatFrontMatter: true,
    insertSpaces: true,
    maxStatementsPerLine: 3,
    tabSize: 4,
    formatExtensions: ['.antlers.html']
};

function resolveSettings(path: string): AntlersFormattingOptions | null {
    if (fs.existsSync(path)) {
        const optionContents = fs.readFileSync(path, { encoding: 'utf8' });

        try {
            return JSON.parse(optionContents) as AntlersFormattingOptions;
        } catch (err) {
            console.error(err);
        }
    }
    return null;
}

interface fileCallback { (fileName: string): void }

function getFiles(directory: string, extension: string, callback: fileCallback) {
    const files = fs.readdirSync(directory);

    for (let i = 0; i < files.length; i++) {
        const fileName = path.join(directory, files[i]),
            stat = fs.lstatSync(fileName);

        if (stat.isDirectory()) {
            getFiles(fileName, extension, callback);
        } else if (fileName.endsWith(extension)) {
            callback(fileName);
        }
    }
}

function formatString(contents: string, savePath: string|null, dumpContents: boolean, options: AntlersFormattingOptions) {
    const doc = AntlersDocument.fromText(contents),
        formatter = new BeautifyDocumentFormatter(options),
        formatResults = formatter.formatDocument(doc, defaultAntlersSettings);
    if (dumpContents === true) {
        console.log(formatResults);
    } else if (savePath != null) {
        fs.writeFileSync(savePath, formatResults, { encoding: 'utf8' });
    }
}

function formatFile(path: string, savePath: string, dumpContents: boolean, options: AntlersFormattingOptions) {
    if (fs.existsSync(path)) {
        try { fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK); } catch (err) { console.error(err); process.exit(EXIT_PATH_PERMISSIONS_ISSUE); }

        try {
            const contents = fs.readFileSync(path, { encoding: 'utf8' }),
                doc = AntlersDocument.fromText(contents),
                formatter = new BeautifyDocumentFormatter(options),
                formatResults = formatter.formatDocument(doc, defaultAntlersSettings);

            if (dumpContents === true) {
                console.log(formatResults);
            } else {
                fs.writeFileSync(savePath, formatResults, { encoding: 'utf8' });
            }
        } catch (err) {
            console.error(err);
            process.exit(EXIT_GENERAL_FAILURE);
        }
    } else {
        process.exit(EXIT_FILE_NOT_FOUND);
    }
}

function formatDirectory(dir: string, options: AntlersFormattingOptions, extensionsToUse: string[], dump: boolean) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        try { fs.accessSync(dir, fs.constants.R_OK | fs.constants.W_OK); } catch (err) { console.error(err); process.exit(EXIT_PATH_PERMISSIONS_ISSUE); }

        extensionsToUse.forEach((extension) => {
            getFiles(dir, extension, (file) => {
                formatFile(file, file, dump, options);
            });
        });
        process.exit(EXIT_SUCCESS);
    } else {
        process.exit(EXIT_FILE_NOT_FOUND);
    }
}

function findSettings(root:string): string | null {
    let searchPath = path.dirname(root);

    if (searchPath == '.') {
        searchPath = process.cwd();
    }

    const parts  = searchPath.split(path.sep);

    while (parts.length > 0) {
        const newPath = parts.join(path.sep),
            formatFileCandidate = path.join(newPath, AUTO_FORMAT_CONFIG_PATH);
        
            if (fs.existsSync(formatFileCandidate)) {
            return formatFileCandidate;
        }

        parts.pop();
    }

    return null;
}

if (argv._.includes('format')) {
    let settingsToUse: AntlersFormattingOptions = defaultSettings;

    if (typeof argv.options !== 'undefined' && argv.options !== null) {
        const fileSettings = resolveSettings(argv.options);

        if (fileSettings != null) {
            settingsToUse = fileSettings;
        }
    } else {
        let pathToUse = '';

        if (additionalArgs.length == 1) {
            if (typeof argv.dir !== 'undefined' && argv.dir !== null) {
                pathToUse = argv.dir;
            } else if (typeof argv.path !== 'undefined' && argv.path !== null) {
                pathToUse = argv.path;
            }
        } else {
            pathToUse = additionalArgs[1] as string;
        }

        const foundSettings = findSettings(pathToUse);

        if (foundSettings != null) {
            const resolvedSettings = resolveSettings(foundSettings);

            if (resolvedSettings != null) {
                settingsToUse = resolvedSettings;
            }
        }
    }

    if (additionalArgs.length == 1) {
        if (argv.stdin === true) {
            const contents = fs.readFileSync(0, 'utf-8');
            
            formatString(contents, argv.output, argv.dump === true, settingsToUse);
            process.exit(EXIT_SUCCESS);
        }

        if (typeof argv.dir !== 'undefined' && argv.dir !== null) {
            let extensionsToUse: string[] = ['.antlers.html'];

            if (settingsToUse.formatExtensions.length > 0) {
                extensionsToUse = settingsToUse.formatExtensions;
            }

            formatDirectory(argv.dir, settingsToUse, extensionsToUse, argv.dump === true);
            process.exit(EXIT_SUCCESS);
        }

        if (typeof argv.path !== 'undefined' && argv.path !== null) {
            let writePath = argv.path;

            if (argv.output !== null) {
                writePath = argv.output;
            }

            formatFile(argv.path, writePath, argv.dump === true, settingsToUse);
            process.exit(EXIT_SUCCESS);
        }
    } else {
        const path = additionalArgs[1] as string;

        if (fs.existsSync(path)) {
            try { fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK); } catch (err) { console.error(err); process.exit(EXIT_PATH_PERMISSIONS_ISSUE); }

            const stat = fs.lstatSync(path);

            if (stat.isDirectory()) {
                let extensionsToUse: string[] = ['.antlers.html'];

                if (settingsToUse.formatExtensions.length > 0) {
                    extensionsToUse = settingsToUse.formatExtensions;
                }

                formatDirectory(path, settingsToUse, extensionsToUse, argv.dump === true);
            } else {
                let writePath = path;

                if (argv.output !== null) {
                    writePath = argv.output;
                }

                formatFile(path, writePath, argv.dump === true, settingsToUse);
            }
        }
    }
}
