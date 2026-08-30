import { replaceAllInString } from '../../../utils/strings.js';
import { AntlersNode, ParameterNode } from '../../nodes/abstractNode.js';

export class NodeBuffer {
    private baseIndent: number;
    private buffer = '';
    private closeString = '';
    private indentSeed = 0;
    private contentIndent = 0;

    constructor(node: AntlersNode, indent: number, prepend: string | null) {
        this.baseIndent = indent;

        if (node.isInterpolationNode) {
            this.buffer = '{';
            this.closeString = '}';
        } else {
            this.buffer = '{{ ';

            if (node.isSelfClosing) {
                this.closeString = ' /}}';
            } else {
                this.closeString = ' }}';
            }
        }

        if (node.pathReference?.isStrictTagReference) {
            this.buffer += '%';
        }

        if (prepend != null && prepend.trim().length > 0) {
            this.buffer += prepend + ' ';
        }

        this.contentIndent = this.buffer.length + (node.isInterpolationNode ? 1 : 0);
    }

    setIndentSeed(indent: number) {
        this.indentSeed = indent;

        return this;
    }

    close() {
        if (this.closeString == ' }}') {
            if (this.buffer.endsWith(' ')) {
                this.buffer += '}}';
            } else {
                this.buffer += this.closeString;
            }
        } else {
            this.buffer += this.closeString;
        }

        return this;
    }

    appendT(text: string) {
        const currentLine = this.buffer.substring(this.buffer.lastIndexOf("\n") + 1);

        if (currentLine.trim().length == 0) {
            text = text.trimStart();
        } else if (this.buffer.endsWith(' ')) {
            this.buffer = this.buffer.replace(/[ \t]+$/, '');
        }

        this.buffer += text;

        return this;
    }

    appendTS(text: string, preserveSpace = false) {
        const currentLine = this.buffer.substring(this.buffer.lastIndexOf("\n") + 1);

        if (currentLine.trim().length == 0) {
            text = text.trimStart();
        } else if (this.buffer.endsWith(' ')) {
            this.buffer = this.buffer.replace(/[ \t]+$/, '');
        }

        if (this.buffer.endsWith('{') && !preserveSpace) {
            text = text.trimStart();
        }

        this.buffer += text;

        return this;
    }

    append(text: string) {
        this.buffer += text;

        return this;
    }

    appendOS(text: string) {
        if (/\s$/.test(this.buffer) == false
            && this.buffer.endsWith('(') == false
            && this.buffer.endsWith('{') == false
            && this.buffer.endsWith('[') == false
            && this.buffer.endsWith(':') == false) {
            this.buffer += ' ';
        }

        return this.append(text);
    }

    appendS(text: string) {
        let appendBuffer = '';

        if (this.buffer.endsWith(' ') == false) {
            appendBuffer += ' ';
        }

        appendBuffer += text + ' ';

        this.buffer += appendBuffer;

        return this;
    }

    indent() {
        let repeatCount = this.baseIndent;

        if (repeatCount == 0) { repeatCount = 1; } else { repeatCount += 2; }

        this.buffer += ' '.repeat(repeatCount);

        return this;
    }

    addIndent(number: number) {
        if (number <= 0) { return this; }

        this.buffer += ' '.repeat(number);

        return this;
    }

    newlineAt(indent: number) {
        this.buffer = this.buffer.trimEnd() + "\n";

        if (indent > 0) {
            this.buffer += ' '.repeat(indent);
        }

        return this;
    }

    getContentIndent() {
        return this.contentIndent;
    }

    paramS(param: ParameterNode) {
        if (param.isShorthand) {
            this.append(` :$${param.name}`);

            return this;
        }

        let bParam = ' ';

        if (param.originalName.length > 0) {
            bParam += param.originalName;
        } else {
            if (param.isVariableReference) {
                bParam += ':';
            }

            bParam += param.name;
        }

        bParam += '=' + param.nameDelimiter + param.value + param.nameDelimiter;

        this.append(bParam);

        return this;
    }

    replace(find: string, replace: string) {
        this.buffer = replaceAllInString(this.buffer, find, replace);

        return this;
    }

    newlineIndent() {
        this.newLine();
        this.indent();

        return this;
    }

    newlineNDIndent() {
        this.buffer = this.buffer.trimEnd();
        this.newLine();

        this.indent();

        return this;
    }

    newLine() {
        this.buffer += "\n";

        return this;
    }

    getContent() {
        return this.buffer;
    }

    getCurrentLineIndent(): string {
        const lineStart = this.buffer.lastIndexOf("\n") + 1,
            currentLine = this.buffer.substring(lineStart);

        return (/^[\t ]*/.exec(currentLine) ?? [''])[0];
    }

    endsWith(value: string): boolean {
        return this.buffer.endsWith(value);
    }
}
