/**
 * Controls how array literals are printed.
 *
 * collapse: Array literals are always printed on a single line.
 * preserve: Array literals that span multiple lines in the source document
 *           continue to span multiple lines, one item per line.
 */
export type ArrayWrapStyle = 'preserve' | 'collapse' | 'expand';

/**
 * Resolves an untrusted array wrapping value, falling back to preserve.
 */
export function resolveArrayWrapStyle(value: string | undefined): ArrayWrapStyle {
    if (value == 'collapse' || value == 'expand') {
        return value;
    }

    return 'preserve';
}

export interface TransformOptions {
    tabSize: number,
    insertSpaces: boolean,
    newlinesAfterFrontMatter: number,
    maxAntlersStatementsPerLine: number,
    endNewline: boolean,
    arrayWrap: ArrayWrapStyle
}
