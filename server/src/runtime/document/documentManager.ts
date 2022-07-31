import { IProjectDetailsProvider } from '../../projects/projectDetailsProvider';
import ProjectManager from '../../projects/projectManager';
import { AntlersError } from '../errors/antlersError';
import { AntlersDocument } from './antlersDocument';

class DocumentManager {
    private loadedDocuments: Map<string, AntlersDocument> = new Map();
    private activeProject: IProjectDetailsProvider | null = null;
    public static instance: DocumentManager | null = null;

    getDocuments(): AntlersDocument[] {
        const docs: AntlersDocument[] = [];

        this.loadedDocuments.forEach((doc) => {
            docs.push(doc);
        });

        return docs;
    }

    setProject(project: IProjectDetailsProvider) {
        this.activeProject = project;

        this.loadedDocuments.forEach((document) => {
            if (this.activeProject != null) {
                document.updateProject(this.activeProject);
            }
        });
    }

    refreshDocumentState() {
        if (this.activeProject != null) {
            this.setProject(this.activeProject);
        }
    }

    hasDocument(uri: string) {
        return this.loadedDocuments.has(uri);
    }

    createDocument(uri: string) {
        if (!this.loadedDocuments.has(uri)) {
            const doc = new AntlersDocument();
            doc.documentUri = uri;

            this.loadedDocuments.set(uri, doc);
        }
    }

    loadDocument(uri: string, text: string) {
        this.loadedDocuments.set(uri, AntlersDocument.fromText(text));
    }

    getDocument(uri: string) {
        return this.loadedDocuments.get(uri) as AntlersDocument;
    }

    updateDocument(uri: string, text: string) {
        if (this.loadedDocuments.has(uri)) {
            const document = this.loadedDocuments.get(uri) as AntlersDocument;

            document.loadString(text);

            const viewRef = ProjectManager.instance?.getStructure()?.findView(uri);

            if (viewRef != null) {
                viewRef.document = document;
            }
        }
    }

    createOrUpdate(uri: string, text: string) {
        this.createDocument(uri);
        this.updateDocument(uri, text);
    }

    getDocumentErrors(uri: string): AntlersError[] {
        if (!this.loadedDocuments.has(uri)) {
            return [];
        }

        const doc = this.loadedDocuments.get(uri) as AntlersDocument;

        return doc.errors.all();
    }
}

if (typeof DocumentManager.instance == 'undefined' || DocumentManager.instance == null) {
    DocumentManager.instance = new DocumentManager();
}

export default DocumentManager;
