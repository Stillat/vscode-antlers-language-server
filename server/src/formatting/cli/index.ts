// eslint-disable-next-line @typescript-eslint/no-var-requires
const yargs = require('yargs');

import * as fs from 'fs';
import { AntlersDocument } from '../../runtime/document/antlersDocument';
import { AntlersFormatter, AntlersFormattingOptions } from '../antlersFormatter';

const EXIT_SUCCESS = 0,
	EXIT_FILE_NOT_FOUND = 3,
	EXIT_GENERAL_FAILURE = 1;

const argv = yargs.command('format', 'Formats a file and writes the changes to disk', {
	path: {
		description: 'The file to format',
		alias: 'f',
		type: 'string'
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

const defaultSettings: AntlersFormattingOptions = {
	htmlOptions: {},
	formatFrontMatter: true,
	insertSpaces: true,
	maxStatementsPerLine: 3,
	tabSize: 4
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

if (argv._.includes('format')) {
	let settingsToUse: AntlersFormattingOptions = defaultSettings;

	if (argv.options !== null) {
		const fileSettings = resolveSettings(argv.options);

		if (fileSettings != null) {
			settingsToUse = fileSettings;
		}
	}

	if (fs.existsSync(argv.path)) {
		try {
			const contents = fs.readFileSync(argv.path, { encoding: 'utf8' }),
				doc = AntlersDocument.fromText(contents),
				formatter = new AntlersFormatter(settingsToUse),
				formatResults = formatter.formatDocument(doc);

			if (argv.dump === true) {
				console.log(formatResults);
			} else {
				let writePath = argv.path;

				if (argv.output !== null) {
					writePath = argv.output;
				}

				fs.writeFileSync(writePath, formatResults, { encoding: 'utf8' });
			}

			process.exit(EXIT_SUCCESS);
		} catch (err) {
			console.error(err);
			process.exit(EXIT_GENERAL_FAILURE);
		}
	} else {
		process.exit(EXIT_FILE_NOT_FOUND);
	}
}
