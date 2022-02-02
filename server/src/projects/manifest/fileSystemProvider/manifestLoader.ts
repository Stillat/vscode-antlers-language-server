import { exec } from 'child_process';
import * as fs from 'fs';
import { serverDirectory } from '../../../languageService/serverDirectory';
import { normalizePath } from '../../../utils/uris';
import ManifestManager from '../../manifestManager';
import ProjectManager from '../../projectManager';
import { IAntlersManifest } from '../manifestTypes';

const analyzerName = "analyzer.phar";

let hasCheckedForCompatibility = false,
    analyzerAvailable = false,
    phpIsAvailable = false,
    isRunningIndexer = false;

function runProjectIndexing(directory: string) {
    return;
    const tServer = serverDirectory;
    if (hasCheckedForCompatibility && phpIsAvailable) {
        if (fs.existsSync(directory + "/composer.json") && isRunningIndexer == false) {
            isRunningIndexer = true;
            let paramDirectory = normalizePath(directory);

            if (paramDirectory.endsWith("/") == false) {
                paramDirectory = paramDirectory + "/";
            }

            exec("php " + serverDirectory + "/" + analyzerName + " '" + paramDirectory + "'",
                (err, stdOut, stdErr) => {
                    isRunningIndexer = false;
                }
            );
        }
    }
}

export function forceResetIndexState() {
    isRunningIndexer = false;
}

export function safeRunIndexing() {
    if (ProjectManager.instance?.hasStructure()) {
        const workingDirectory = ProjectManager.instance
            .getStructure()
            .getWorkingDirectory();

        runProjectIndexing(workingDirectory);
    }
}

export function checkForIndexProcessAvailability() {
    if (!hasCheckedForCompatibility) {
        if (fs.existsSync(serverDirectory + "/" + analyzerName)) {
            analyzerAvailable = true;

            exec("php -v", (err, stdOut, stdErr) => {
                if (err == null && stdOut.includes("Zend")) {
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
    return;
    /*if (ProjectManager.instance?.hasStructure()) {
        const manifestPath = ProjectManager.instance.getStructure().getWorkingDirectory() +
            "/storage/framework/cache/antlers-language-server/.antlers.json";

        if (fs.existsSync(manifestPath)) {
            const parsedManifest = ManifestLoader.loadFromPath(manifestPath);

            ManifestManager.instance?.load(parsedManifest);
        }
    }*/
}

export class ManifestLoader {
    static loadFromPath(path: string): IAntlersManifest | null {
        return null;
        /*try {
            const contents = fs.readFileSync(path, { encoding: "utf8" }),
                parsedManifest = JSON.parse(contents) as IAntlersManifest;

            return parsedManifest;
        } catch (err) {
            if (err instanceof SyntaxError) {
                const syntaxError = err as SyntaxError;

                if (syntaxError.message.includes("Unexpected end of JSON")) {
                    fs.unlinkSync(path);
                    forceResetIndexState();
                    safeRunIndexing();
                }
            }
        }
        return null;*/
    }
}
