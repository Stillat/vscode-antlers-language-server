export function normalizePath(path: string): string {
    return path.split('\\').join('/');
}

export function getLaravelRoot(root: string): string {
    if (root.endsWith('/') == false) {
        root = root + '/';
    }
    return root + '../';
}