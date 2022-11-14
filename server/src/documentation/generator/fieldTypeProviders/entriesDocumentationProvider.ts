import { IEntriesFieldType, IProjectFields } from '../../../projects/structuredFieldTypes/types';
import { IDocumentationProvider, IDocumentationResult } from '../types';
import { GeneralQueryBuilderDocumentationProvider } from './generalQueryBuilderDocumentationProvider';

export class EntriesDocumentationProvider implements IDocumentationProvider {
    resolve(context: IEntriesFieldType, currentProject: IProjectFields): IDocumentationResult {
        if (context.maxItems !== 1) {
            return (new GeneralQueryBuilderDocumentationProvider()).resolve(context, currentProject);
        }

        throw new Error('Method not implemented.');
    }
}