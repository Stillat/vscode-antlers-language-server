// eslint-disable-next-line @typescript-eslint/no-var-requires
const uri2path = require('file-uri-to-path');

export function normalizePath(path: string): string {
    return path.split('\\').join('/');
}

export function convertUriToPath(documentUri: string): string {
    const localPath = uri2path(decodeURIComponent(documentUri));

    return normalizePath(localPath);
}