export function suggestAlternativeCollectionParams(unknown: string): string[] {
    const results: string[] = [];

    if (unknown == 'order') {
        results.push('sort');
    }

    return results;
}
