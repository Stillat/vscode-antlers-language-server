import { IProjectFields } from '../../../projects/structuredFieldTypes/types.js';
import { booleanDocumentationResult, IDocumentationProvider, IDocumentationResult } from '../types.js';

export class GeneralBooleanDocumentationProvider implements IDocumentationProvider {
    resolve(context: any, currentProject: IProjectFields): IDocumentationResult {
        return booleanDocumentationResult(context);
    }
}