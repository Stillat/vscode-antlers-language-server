import { IProjectFields, IYamlFieldType } from '../../../projects/structuredFieldTypes/types';
import { IDocumentationProvider, IDocumentationResult } from '../types';

export class YamlDocumentationProvider implements IDocumentationProvider {
    resolve(context: IYamlFieldType, currentProject: IProjectFields): IDocumentationResult {
        throw new Error('Method not implemented.');
    }
}