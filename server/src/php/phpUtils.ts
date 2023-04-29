export function extractCommentDescription(node: any): string {
    if (typeof node.leadingComments === 'undefined') {
        return '';
    }

    if (node.leadingComments.length === 0) { return ''; }
    if (node.leadingComments[0].kind !== 'commentblock') { return ''; }

    return extractCommentText(node.leadingComments[0].value);
}

function extractCommentText(comment: string): string {
    const lines = comment.split('\n');
    let text = '';
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('*')) {
            const lineText = line.slice(1).trim();
            if (lineText === '' || lineText.startsWith('@class')) {
                break;
            } else {
                text += lineText + ' ';
            }
        } else {
            break;
        }
    }
    return text.trim();
}