import { IProjectFields } from '../../../projects/structuredFieldTypes/types.js';
import { IDocumentationResult } from '../types.js';
import { GeneralTextDocumentationProvider, ITextField } from './generalTextDocumentationProvider.js';

export class MarkdownDocumentationProvider extends GeneralTextDocumentationProvider {

    resolve(context: ITextField, currentProject: IProjectFields): IDocumentationResult {
        const results = super.resolve(context, currentProject);

        if (results.documentation != null) {
            results.documentation.overviewSnippets.unshift({
                overview: `Using a custom Markdown parser to render the content`,
                snippet: `{{ ${context.handle} | raw | markdown('parser_name') /}}`
            });
        }

        return results;
    }
}