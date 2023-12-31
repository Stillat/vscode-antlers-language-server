import { IDateFieldType, IProjectFields } from '../../../projects/structuredFieldTypes/types.js';
import { StringUtilities } from '../../../runtime/utilities/stringUtilities.js';
import { AugmentationTypes } from '../augmentationTypes.js';
import { DateTimeSnippetProvider } from '../snippets/dateTimeSnippetProvider.js';
import { IDocumentationProvider, IDocumentationResult } from '../types.js';
import { GeneralTextDocumentationProvider } from './generalTextDocumentationProvider.js';

export class DateDocumentationProvider implements IDocumentationProvider {
    resolve(context: IDateFieldType, currentProject: IProjectFields): IDocumentationResult {
        const results = (new GeneralTextDocumentationProvider()).resolve(context, currentProject);

        if (results.documentation != null) {
            DateTimeSnippetProvider.generate(context).forEach((snippet) => {
                results.documentation?.overviewSnippets.unshift(snippet);
            });

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