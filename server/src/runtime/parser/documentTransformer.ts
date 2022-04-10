import { AbstractNode, AntlersNode } from '../nodes/abstractNode';
import { DocumentParser } from './documentParser';

class DocumentTransformer {

    private _parser:DocumentParser = new DocumentParser();
    private _nodes:AbstractNode[] = [];
    private _extractedAntlers:Map<string, string> = new Map();
    private _buffer = '';

    load(text: string)
    {
        this._parser.parse(text);
        this._nodes = this._parser.getNodes();
        this._buffer = this._parser.getParsedContent();

        this._nodes.forEach((node) => {
            if (node instanceof AntlersNode) {
                const originalContent = node.getNodeDocumentText(),
                    replaceId = 'ANTLERS:' + node.refId;
                this._buffer = this._buffer.replace(originalContent, replaceId);
                this._extractedAntlers.set(replaceId, originalContent);
            }
        });

        return this;
    }

    transform(callable:(document:string) => string) {
        this._buffer = callable(this._buffer);

        return this;
    }

    getTemplate() {
        let newTemplate = this._buffer;

        this._extractedAntlers.forEach((originalContent, antlersId) => {
            newTemplate = newTemplate.replace(antlersId, originalContent);
        });

        return newTemplate;
    }
}

export default DocumentTransformer;
