import { IDateFieldType, IProjectFields } from '../../../projects/structuredFieldTypes/types';
import { StringUtilities } from '../../../runtime/utilities/stringUtilities';
import { AugmentationTypes } from '../augmentationTypes';
import { IDocumentationProvider, IDocumentationResult } from '../types';
import { GeneralTextDocumentationProvider } from './generalTextDocumentationProvider';

export class DateDocumentationProvider implements IDocumentationProvider {
    resolve(context: IDateFieldType, currentProject: IProjectFields): IDocumentationResult {
        const results = (new GeneralTextDocumentationProvider()).resolve(context, currentProject);

        if (results.documentation != null) {
            results.documentation.overviewProperties.unshift({
                name: 'Time Enabled',
                mono: false,
                value: StringUtilities.boolLabel(context.timeEnabled ?? false)
            });

            results.documentation.overviewProperties.unshift({
                name: 'Format',
                mono: true,
                value: context.format ?? 'None'
            });

            results.documentation.augmentsTo = AugmentationTypes.Date;
            results.documentation.stringableReturns = 'The formatted date';
        }

        return results;
    }
}