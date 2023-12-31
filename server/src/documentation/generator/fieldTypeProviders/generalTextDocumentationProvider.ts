import { IFieldDetails, IProjectFields } from '../../../projects/structuredFieldTypes/types.js';
import { TextSnippetProvider } from '../snippets/textSnippetProvider.js';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet, IFieldtypeDocumentationOverview, stringDocumentationResult } from '../types.js';

export interface ITextField extends IFieldDetails {
    characterLimit?: number | null,
}

export class GeneralTextDocumentationProvider implements IDocumentationProvider {
    resolve(context: ITextField, currentProject: IProjectFields): IDocumentationResult {
        const overviewProperties: IDocumentationProperty[] = [],
            snippets: IDocumentationSnippet[] = TextSnippetProvider.getSnippets(context),
            result = { ...stringDocumentationResult(context) };

        if (typeof context.characterLimit !== 'undefined') {
            overviewProperties.push({
                mono: false,
                name: 'Character Limit',
                value: context.characterLimit?.toString() ?? 'None'
            });
        }

        if (result.documentation != null) {
            result.documentation.overviewProperties = overviewProperties;
            result.documentation.overviewSnippets = snippets;
        }

        return result;
    }
}