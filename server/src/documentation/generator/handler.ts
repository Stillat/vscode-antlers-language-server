import { GenerateHelpParams } from '../../server';
import { DocumentationProvider } from './documentationProvider';
import { IDocumentationResult } from './types';

export class DocumentationHandler {
    static handle(params: GenerateHelpParams): IDocumentationResult {
        const provider = new DocumentationProvider();
        
        return provider.getDocumentation(params.context);
    }
}