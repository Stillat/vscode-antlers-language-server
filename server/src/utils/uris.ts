import uri2path from 'file-uri-to-path';

export function normalizePath(path: string): string {
    return path.split('\\').join('/');
}

export function convertUriToPath(documentUri: string): string {
    const localPath = uri2path(decodeURIComponent(documentUri));

    return normalizePath(localPath);
}