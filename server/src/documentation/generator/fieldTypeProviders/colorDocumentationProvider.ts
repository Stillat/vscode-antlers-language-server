import { IColorFieldType, IProjectFields } from '../../../projects/structuredFieldTypes/types';
import { IDocumentationProvider, IDocumentationResult } from '../types';
import { GeneralTextDocumentationProvider } from './generalTextDocumentationProvider';

export class ColorDocumentationProvider implements IDocumentationProvider {
    resolve(context: IColorFieldType, currentProject: IProjectFields): IDocumentationResult {
        const results = (new GeneralTextDocumentationProvider()).resolve(context, currentProject);

        if (results.documentation != null) {
            results.documentation.overviewProperties.unshift({
                mono: true,
                name: 'Color Mode',
                value: context.defaultColorMode ?? 'hex'
            });
        }

        return results;
    }
}