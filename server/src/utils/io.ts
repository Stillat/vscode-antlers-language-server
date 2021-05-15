import * as path from 'path';
import * as fs from 'fs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const uri2path = require('file-uri-to-path');

export function getFiles(startPath: string, filter: string, foundFiles: string[]): string[] {
    if (!fs.existsSync(startPath)) {
        return [];
    }

    let returnFiles = foundFiles || [];
    const files = fs.readdirSync(startPath);

    for (let i = 0; i < files.length; i++) {
        const filename = path.join(startPath, files[i]);
        const stat = fs.lstatSync(filename);

        if (stat.isDirectory()) {
            returnFiles = returnFiles.concat(getFiles(filename, filter, foundFiles));
        } else if (filename.indexOf(filter) >= 0) {
            returnFiles.push(filename);
        }
    }

    return [...new Set(returnFiles)];
}

export function normalizePath(path: string): string {
    return path.split('\\').join('/');
}

export function convertUriToPath(documentUri: string): string {
    const localPath = uri2path(decodeURIComponent(documentUri));

    return normalizePath(localPath);
}

export function convertPathToUri(filePath: string): string {
    let pathName = path.resolve(filePath).replace(/\\/g, '/');

    if (pathName[0] !== '/') {
        pathName = '/' + pathName;
    }

    return encodeURI('file://' + pathName);
}

export function shouldProcessPath(filePath: string): boolean {
    const checkPath = filePath.toLowerCase();

    if (checkPath.endsWith('.gitkeep')) {
        return false;
    }

    return true;
}
