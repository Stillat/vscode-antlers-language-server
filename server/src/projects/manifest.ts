import * as fs from 'fs';
import { serverDirectory } from '../server';
import { exec } from 'child_process';
import { currentStructure } from './statamicProject';
import { ManifestManager } from './manifestManager';
import { normalizePath } from '../utils/io';

const analyzerName = 'analyzer.phar';

let hasCheckedForCompatibility = false,
	analyzerAvailable = false,
	phpIsAvailable = false,
	isRunningIndexer = false;

function runProjectIndexing(directory: string) {
	if (hasCheckedForCompatibility && phpIsAvailable) {
		if (fs.existsSync(directory + '/composer.json') && isRunningIndexer == false) {
			isRunningIndexer = true;
			let paramDirectory = normalizePath(directory);

			if (paramDirectory.endsWith('/') == false) {
				paramDirectory = paramDirectory + '/';
			}

			exec('php ' + serverDirectory + '/' + analyzerName + " '" + paramDirectory + "'", (err, stdOut, stdErr) => {
				isRunningIndexer = false;
			});
		}
	}
}

export function forceResetIndexState() {
	isRunningIndexer = false;
}

export function safeRunIndexing() {
	if (currentStructure != null) {
		const workingDirectory = currentStructure.getWorkingDirectory();

		runProjectIndexing(workingDirectory);
	}
}

export function checkForIndexProcessAvailability() {
	if (!hasCheckedForCompatibility) {
		if (fs.existsSync(serverDirectory + '/' + analyzerName)) {
			analyzerAvailable = true;

			exec('php -v', (err, stdOut, stdErr) => {
				if (err == null && stdOut.includes('Zend')) {
					phpIsAvailable = true;
					hasCheckedForCompatibility = true;
					safeRunIndexing();
				}
			});
		}

		hasCheckedForCompatibility = true;
	}
}

export function reloadProjectManifest() {
	if (currentStructure != null) {
		const manifestPath = currentStructure.getWorkingDirectory() + '/.antlers.json';

		if (fs.existsSync(manifestPath)) {
			ManifestManager.load(manifestPath);
		}
	}
}
