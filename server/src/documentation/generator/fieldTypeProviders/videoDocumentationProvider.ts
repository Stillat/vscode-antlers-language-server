import { IProjectFields, IVideoFieldType } from '../../../projects/structuredFieldTypes/types.js';
import { TextSnippetProvider } from '../snippets/textSnippetProvider.js';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet, stringDocumentationResult } from '../types.js';

export class VideoDocumentationProvider implements IDocumentationProvider {
    resolve(context: IVideoFieldType, currentProject: IProjectFields): IDocumentationResult {
        const overviewProperties: IDocumentationProperty[] = [],
            snippets: IDocumentationSnippet[] = TextSnippetProvider.getSnippets(context);

        const result = {
            ...stringDocumentationResult(context),
        };

        snippets.unshift({
            overview: 'Condtionally output the appropriate video player element',
            snippet: `{{ if ${context.handle} | is_embeddable }}
    <!-- Youtube and Vimeo -->
    <iframe src="{{ ${context.handle} | embed_url }}" ...></iframe>
{{ else }}
    <!-- Other HTML5 video types -->
    <video src="{{ ${context.handle} | embed_url }}" ...></video>
{{ /if }}`
        });

        if (result.documentation != null) {
            result.documentation.overviewProperties = overviewProperties;
            result.documentation.overviewSnippets = snippets;
        }

        return result;
    }

}