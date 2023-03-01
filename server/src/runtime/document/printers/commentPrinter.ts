import { AntlersNode } from '../../nodes/abstractNode';
import { StringUtilities } from '../../utilities/stringUtilities';

export class CommentPrinter {
    static printComment(comment: AntlersNode, tabSize: number, targetIndent: number): string {
        const sourceContent = comment.getContent(),
            content = sourceContent.trim();

        if (content.includes("\n")) {
            const lines = StringUtilities.breakByNewLine(sourceContent),
                reflowedLines: string[] = [];

            const firstIndent = lines[0].length - lines[0].trim().length;

            lines.forEach((line) => {
                if (line.trim().length == 0) {
                    reflowedLines.push(' '.repeat(tabSize + targetIndent) + line.trim());
                    return;
                }
                // Preserve relative indentation.
                let curRelIndent = line.length - line.trim().length;

                const checkLine = line.trim();

                if (checkLine.startsWith('@desc') || checkLine.startsWith('@set') || checkLine.startsWith('@name')) {
                    curRelIndent = tabSize;
                }

                reflowedLines.push(' '.repeat(tabSize + targetIndent + curRelIndent - tabSize) + line.trim());
            });

            if (reflowedLines.length > 0) {
                if (reflowedLines[reflowedLines.length - 1].trim().length == 0) {
                    reflowedLines.pop();
                }
            }

            const content = reflowedLines.join("\n");
            let newComment = "{{#\n";
            newComment += content;
            newComment += "\n" + ' '.repeat(targetIndent) + '#}}';

            return newComment;
        }

        return '{{# ' + content + ' #}}';
    }
}