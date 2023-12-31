import { AntlersNode } from '../../nodes/abstractNode.js';
import { StringUtilities } from '../../utilities/stringUtilities.js';
import { InlineFormatter } from '../inlineFormatter.js';

export class CommentPrinter {

    static printCommentLines(comment: AntlersNode, tabSize: number, targetIndent: number): string {
        const sourceContent = comment.getContent(),
            content = sourceContent.trim();

        if (content.includes("\n")) {
            const lines = StringUtilities.breakByNewLine(sourceContent),
                reflowedLines: string[] = [];

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

    static printComment(comment: AntlersNode, tabSize: number, targetIndent: number, stringFormatter: InlineFormatter | null): string {
        const sourceContent = comment.getContent(),
            content = sourceContent.trim();

        if (content.includes("\n") && !(content.includes('@desc') || content.includes('@set') || content.includes('@name'))) {
            try {
                let formattedCommentContent = content;

                if (stringFormatter != null) {
                    formattedCommentContent = stringFormatter(formattedCommentContent);
                }

                const lines = StringUtilities.breakByNewLine(formattedCommentContent),
                    reflowedLines: string[] = [];

                lines.forEach((line) => {
                    if (line.trim().length == 0) {
                        reflowedLines.push(' '.repeat(tabSize + targetIndent) + line.trim());
                        return;
                    }
                    // Preserve relative indentation.
                    let curRelIndent = line.length - line.trim().length;

                    reflowedLines.push(' '.repeat(tabSize + targetIndent + curRelIndent) + line.trim());
                });

                if (reflowedLines.length > 0) {
                    if (reflowedLines[reflowedLines.length - 1].trim().length == 0) {
                        reflowedLines.pop();
                    }
                }

                return "{{#\n" + reflowedLines.join("\n") + "\n" + ' '.repeat(targetIndent) + '#}}';;
            } catch (err) {
            }
        }

        return this.printCommentLines(comment, tabSize, targetIndent);
    }
}