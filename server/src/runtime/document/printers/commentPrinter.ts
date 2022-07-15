import { AntlersNode } from '../../nodes/abstractNode';
import { StringUtilities } from '../../utilities/stringUtilities';

export class CommentPrinter {
    static printComment(comment: AntlersNode, tabSize: number, targetIndent: number): string {
        const sourceContent = comment.getContent(),
            content = sourceContent.trim();

        if (content.includes("\n")) {
            const lines = StringUtilities.breakByNewLine(sourceContent.trim()),
                reflowedLines: string[] = [];

            lines.forEach((line) => {
                reflowedLines.push(' '.repeat(tabSize + targetIndent) + line.trim());
            });

            const content = reflowedLines.join("\n");
            let newComment = "{{#\n";
            newComment += content;
            newComment += "\n" + ' '.repeat(targetIndent) + '#}}';

            return newComment;
        }

        return '{{# ' + content + ' #}}';
    }
}