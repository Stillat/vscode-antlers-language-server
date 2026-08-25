import * as fs from 'fs';
import * as path from 'path';

function getEntryStats(fileName: string): fs.Stats | null {
    try {
        const linkStats = fs.lstatSync(fileName);

        if (linkStats.isSymbolicLink()) {
            const targetStats = fs.statSync(fileName);

            if (targetStats.isDirectory()) {
                return null;
            }

            return targetStats;
        }

        return linkStats;
    } catch (_error) {
        return null;
    }
}

function getDirectoryEntries(startPath: string): string[] {
    try {
        if (!fs.statSync(startPath).isDirectory()) {
            return [];
        }

        return fs.readdirSync(startPath);
    } catch (_error) {
        return [];
    }
}

export function getFiles(startPath: string, filter: string, foundFiles: string[] = []): string[] {
    const files = getDirectoryEntries(startPath);

    for (let i = 0; i < files.length; i++) {
        const filename = path.join(startPath, files[i]),
            stat = getEntryStats(filename);

        if (stat == null) {
            continue;
        }

        if (stat.isDirectory()) {
            getFiles(filename, filter, foundFiles);
        } else if (stat.isFile() && filename.includes(filter)) {
            foundFiles.push(filename);
        }
    }

    return [...new Set(foundFiles)];
}

export function getDirectFiles(startPath: string, filter: string): string[] {
    const returnFiles: string[] = [],
        files = getDirectoryEntries(startPath);

    for (let i = 0; i < files.length; i++) {
        const filename = path.join(startPath, files[i]),
            stat = getEntryStats(filename);

        if (stat?.isFile() && filename.includes(filter)) {
            returnFiles.push(filename);
        }
    }

    return [...new Set(returnFiles)];
}
