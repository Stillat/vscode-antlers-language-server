import { AntlersDocument } from '../document/antlersDocument';
import { AbstractNode, AntlersNode } from '../nodes/abstractNode';

class DocumentTransformer {

    private _nodes:AbstractNode[] = [];
    private _extractedAntlers:Map<string, string> = new Map();
    private _buffer = '';
    private _shouldFormat = true;

    load(text: string)
    {
        const tempDoc = new AntlersDocument();
        tempDoc.getDocumentParser().withChildDocuments(true);
        tempDoc.loadString(text);
        this._nodes = tempDoc.getAllNodes();
        this._buffer = tempDoc.getParsedContent();

        if (! tempDoc.isValid() || ! tempDoc.isFormattingEnabled()) {
            this._shouldFormat = false;
        }

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

    getShouldFormat() {
        return this._shouldFormat;
    }

    getBuffer() {
        return this._buffer;
    }

    getMapping() {
        return this._extractedAntlers;
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
