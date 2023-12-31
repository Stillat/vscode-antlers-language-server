import { AntlersError } from '../errors/antlersError.js';
import { AntlersDocument } from './antlersDocument.js';

export class DocumentErrors {
    private doc: AntlersDocument;

    constructor(doc: AntlersDocument) {
        this.doc = doc;
    }

    hasStructureErrors() {
        return this.doc.getDocumentParser().getStructureErrors().length > 0;
    }

    getFirstStructureError(): AntlersError {
        return this.doc.getDocumentParser().getStructureErrors()[0];
    }

    hasAny() {
        return this.all().length > 0;
    }

    all() {
        const errorHashes: string[] = [],
            errors: AntlersError[] = [];

        this.doc.getAllAntlersNodes().forEach((node) => {
            node.getErrors().forEach((error) => {
                if (errorHashes.includes(error.hash()) == false) {
                    errorHashes.push(error.hash());
                    errors.push(error);
                }

            });
        });

        this.doc.getDocumentParser().getAntlersErrors().forEach((error) => {
            if (errorHashes.includes(error.hash()) == false) {
                errorHashes.push(error.hash());
                errors.push(error);
            }
        });

        return errors;
    }
}