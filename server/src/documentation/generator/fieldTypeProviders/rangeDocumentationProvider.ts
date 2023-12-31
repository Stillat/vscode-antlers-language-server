import { IProjectFields, IRangeFieldType } from '../../../projects/structuredFieldTypes/types.js';
import { IDocumentationResult } from '../types.js';
import { GeneralNumberDocumentationProvider } from './generalNumberDocumentationProvider.js';

export class RangeDocumentationProvider extends GeneralNumberDocumentationProvider {
    resolve(context: IRangeFieldType, currentProject: IProjectFields): IDocumentationResult {
        const results = super.resolve(context, currentProject);

        if (results.documentation != null) {
            results.documentation.overviewProperties.unshift({
                name: 'Max',
                value: context.max?.toString() ?? 'None',
                mono: false
            });

            results.documentation.overviewProperties.unshift({
                name: 'Min',
                value: context.min?.toString() ?? 'None',
                mono: false
            });
        }

        return results;
    }
}