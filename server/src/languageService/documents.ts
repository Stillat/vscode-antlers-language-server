import { TextDocument } from 'vscode-languageserver-textdocument';
import DocumentManager from '../runtime/document/documentManager.js';

const documentMap: Map<string, TextDocument> = new Map();
const sessionDocuments = new DocumentManager();


export {
    documentMap,
    sessionDocuments
};