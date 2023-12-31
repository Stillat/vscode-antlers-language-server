import { IProjectFields, IYamlFieldType } from '../../../projects/structuredFieldTypes/types.js';
import { IDocumentationProvider, IDocumentationResult } from '../types.js';

export class YamlDocumentationProvider implements IDocumentationProvider {
    resolve(context: IYamlFieldType, currentProject: IProjectFields): IDocumentationResult {
        throw new Error('Method not implemented.');
    }
}