import { AntlersNode } from '../../nodes/abstractNode.js';
import { StringUtilities } from '../../utilities/stringUtilities.js';
import { AsyncInlineFormatter, InlineFormatter } from '../inlineFormatter.js';

export class CommentPrinter {

    private static isDocumentationDirective(line: string): boolean {
        return /^@(name|description|desc|entry|collection|blueprint|var|set|param\*?|format)\b/.test(line.trim());
    }

    private static isDocumentationComment(content: string): boolean {
        return StringUtilities.breakByNewLine(content).some((line) => this.isDocumentationDirective(line));
    }

    private static indentWidth(line: string, tabSize: number): number {
        let width = 0;

        for (const char of line) {
            if (char == ' ') {
                width++;
            } else if (char == '\t') {
                width += tabSize - (width % tabSize);
            } else {
                break;
            }
        }

        return width;
    }

    private static makeIndent(width: number, tabSize: number, insertSpaces: boolean): string {
        if (insertSpaces) {
            return ' '.repeat(width);
        }

        const tabs = Math.floor(width / tabSize),
            spaces = width % tabSize;

        return '\t'.repeat(tabs) + ' '.repeat(spaces);
    }

    private static printContent(sourceContent: string, tabSize: number, targetIndent: string, insertSpaces: boolean): string {
        const content = sourceContent.trim();

        if (content.includes("\n")) {
            const lines = StringUtilities.breakByNewLine(sourceContent);

            while (lines.length > 0 && lines[0].trim().length == 0) {
                lines.shift();
            }

            while (lines.length > 0 && lines[lines.length - 1].trim().length == 0) {
                lines.pop();
            }

            const contentIndents = lines
                .filter((line) => line.trim().length > 0)
                .map((line) => this.indentWidth(line, tabSize)),
                baseIndent = contentIndents.length > 0 ? Math.min(...contentIndents) : 0,
                childIndent = targetIndent + this.makeIndent(tabSize, tabSize, insertSpaces),
                reflowedLines: string[] = [];

            lines.forEach((line) => {
                if (line.trim().length == 0) {
                    reflowedLines.push('');
                    return;
                }

                const relativeIndent = this.isDocumentationDirective(line)
                    ? 0
                    : Math.max(0, this.indentWidth(line, tabSize) - baseIndent);
                reflowedLines.push(childIndent + this.makeIndent(relativeIndent, tabSize, insertSpaces) + line.trim());
            });

            let newComment = "{{#\n";
            newComment += reflowedLines.join("\n");
            newComment += "\n" + targetIndent + '#}}';

            return newComment;
        }

        return '{{# ' + content + ' #}}';
    }

    static printCommentLines(comment: AntlersNode, tabSize: number, targetIndent: string, insertSpaces: boolean): string {
        return this.printContent(comment.getContent(), tabSize, targetIndent, insertSpaces);
    }

    static async printCommentAsync(comment: AntlersNode, tabSize: number, targetIndent: string, insertSpaces: boolean, stringFormatter: AsyncInlineFormatter | null): Promise<string> {
        const sourceContent = comment.getContent(),
            content = sourceContent;

        if (content.includes("\n") && !this.isDocumentationComment(content)) {
            try {
                let formattedCommentContent = content;

                if (stringFormatter != null) {
                    formattedCommentContent = await stringFormatter(formattedCommentContent);
                }

                return this.printContent(formattedCommentContent, tabSize, targetIndent, insertSpaces);
            } catch (err) {
            }
        }

        return this.printCommentLines(comment, tabSize, targetIndent, insertSpaces);
    }

    static printComment(comment: AntlersNode, tabSize: number, targetIndent: string, insertSpaces: boolean, stringFormatter: InlineFormatter | null): string {
        const sourceContent = comment.getContent(),
            content = sourceContent.trim();

        if (content.includes("\n") && !this.isDocumentationComment(content)) {
            try {
                let formattedCommentContent = content;

                if (stringFormatter != null) {
                    formattedCommentContent = stringFormatter(formattedCommentContent);
                }

                return this.printContent(formattedCommentContent, tabSize, targetIndent, insertSpaces);
            } catch (err) {
            }
        }

        return this.printCommentLines(comment, tabSize, targetIndent, insertSpaces);
    }
}
