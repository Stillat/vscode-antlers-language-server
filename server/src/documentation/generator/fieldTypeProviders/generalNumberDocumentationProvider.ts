import { IFieldDetails, IProjectFields } from '../../../projects/structuredFieldTypes/types.js';
import { IDocumentationProvider, IDocumentationResult, numericDocumentationResult } from '../types.js';

export class GeneralNumberDocumentationProvider implements IDocumentationProvider {
    resolve(context: IFieldDetails, currentProject: IProjectFields): IDocumentationResult {
        return numericDocumentationResult(context);
    }
}