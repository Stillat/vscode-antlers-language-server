export type BlockComment = [string, string];

export function resolveHtmlBlockComment(fileName: string | undefined, overrideHtmlComments: boolean): BlockComment | null {
    if (!overrideHtmlComments) {
        return null;
    }

    const normalizedFileName = fileName?.toLowerCase() ?? "";

    if (normalizedFileName.endsWith(".antlers.html") || normalizedFileName.endsWith(".antlers.xml")) {
        return ["{{#", "#}}"];
    }

    return ["<!--", "-->"];
}
