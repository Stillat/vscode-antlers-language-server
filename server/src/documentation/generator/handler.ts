import { GenerateHelpParams } from '../../server.js';
import { DocumentationProvider } from './documentationProvider.js';
import { IDocumentationResult } from './types.js';

export class DocumentationHandler {
    static handle(params: GenerateHelpParams): IDocumentationResult {
        const provider = new DocumentationProvider();
        
        return provider.getDocumentation(params.context);
    }
}