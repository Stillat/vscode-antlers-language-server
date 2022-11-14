import { IFieldDetails, IProjectFields } from '../../../projects/structuredFieldTypes/types';
import { IDocumentationProvider, IDocumentationResult, numericDocumentationResult } from '../types';

export class GeneralNumberDocumentationProvider implements IDocumentationProvider {
    resolve(context: IFieldDetails, currentProject: IProjectFields): IDocumentationResult {
        return numericDocumentationResult(context);
    }
}