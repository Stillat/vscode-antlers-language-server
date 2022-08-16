import { replaceAllInString } from '../../../utils/strings';
import { AntlersNode, ParameterNode } from '../../nodes/abstractNode';

export class NodeBuffer {
    private baseIndent: number;
    private buffer = '';
    private closeString = '';
    private relativeIndentSize = 0;
    private indentSeed = 0;

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

        if (prepend != null && prepend.trim().length > 0) {
            this.buffer += prepend + ' ';
        }
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
        if (this.buffer.endsWith(' ')) {
            this.buffer = this.buffer.trimEnd();
        }

        this.buffer += text;

        return this;
    }

    appendTS(text: string, preserveSpace = false) {
        if (this.buffer.endsWith(' ')) {
            this.buffer = this.buffer.trimEnd();
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
        if (this.buffer.endsWith(' ') == false
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

        if (this.relativeIndentSize > 0) {
            repeatCount += this.relativeIndentSize;
        }

        this.buffer += ' '.repeat(repeatCount);

        return this;
    }

    addIndent(number: number) {
        if (number <= 0) { return this; }

        this.buffer += ' '.repeat(number);

        return this;
    }

    paramS(param: ParameterNode) {
        let bParam = ' ';

        if (param.isVariableReference) {
            bParam += ':';
        }

        bParam += param.name + '=' + param.nameDelimiter + param.value + param.nameDelimiter;

        this.append(bParam);

        return this;
    }

    replace(find: string, replace: string) {
        this.buffer = replaceAllInString(this.buffer, find, replace);

        return this;
    }

    relativeIndent(relativeTo: string) {
        const bufferLines = this.buffer.split("\n");

        if (bufferLines.length == 0) {
            return this;
        }

        let lastLine = bufferLines[bufferLines.length - 1].trimEnd();

        if (lastLine.endsWith('(')) {
            lastLine = lastLine.slice(0, -1);
        }

        if (lastLine.endsWith(relativeTo) == false) {
            return this;
        }

        this.relativeIndentSize = lastLine.lastIndexOf(relativeTo);

        //  this.relativeIndentSize += Math.ceil(relativeTo.length / 2);

        // this.relativeIndentSize += 4;

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

    endsWith(value: string): boolean {
        return this.buffer.endsWith(value);
    }
}
