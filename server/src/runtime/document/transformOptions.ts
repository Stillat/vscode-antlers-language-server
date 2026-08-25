/**
 * Controls how array literals are printed.
 *
 * collapse: Array literals are always printed on a single line.
 * preserve: Array literals that span multiple lines in the source document
 *           continue to span multiple lines, one item per line.
 */
export type ArrayWrapStyle = 'preserve' | 'collapse';

export interface TransformOptions {
    tabSize: number,
    newlinesAfterFrontMatter: number,
    maxAntlersStatementsPerLine: number,
    endNewline: boolean,
    arrayWrap: ArrayWrapStyle
}
