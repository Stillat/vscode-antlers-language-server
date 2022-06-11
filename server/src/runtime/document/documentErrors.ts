import { AntlersError } from '../errors/antlersError';
import { AntlersDocument } from './antlersDocument';

export class DocumentErrors {
    private doc: AntlersDocument;

    constructor(doc: AntlersDocument) {
        this.doc = doc;
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