import { normalizePath } from './io';

export function getRootProjectPath(path: string): string {
    const parts = normalizePath(path).split('/');
    const newParts = [];
    let lastPart = null;

    for (let i = 0; i < parts.length; i++) {
        if (i == 0) {
            lastPart = parts[i];
            newParts.push(parts[i]);
            continue;
        }

        if (parts[i] == 'views' && lastPart == 'resources') {
            break;
        }

        newParts.push(parts[i]);
        lastPart = parts[i];
    }

    return newParts.join('/');
}