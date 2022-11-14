import { IProjectFields } from '../../../projects/structuredFieldTypes/types';
import { booleanDocumentationResult, IDocumentationProvider, IDocumentationResult } from '../types';

export class GeneralBooleanDocumentationProvider implements IDocumentationProvider {
    resolve(context: any, currentProject: IProjectFields): IDocumentationResult {
        return booleanDocumentationResult(context);
    }
}