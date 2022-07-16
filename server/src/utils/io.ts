import * as path from 'path';

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
