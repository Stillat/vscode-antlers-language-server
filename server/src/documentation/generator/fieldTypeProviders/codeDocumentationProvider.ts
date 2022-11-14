import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver';
import { ICodeFieldType, IProjectFields } from '../../../projects/structuredFieldTypes/types';
import { AugmentationTypes } from '../augmentationTypes';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet } from '../types';

export class CodeDocumentationProvider implements IDocumentationProvider {
    resolve(codeField: ICodeFieldType, currentProject: IProjectFields): IDocumentationResult {
        const keys = ['code', 'mode', 'value'],
            docLink = OfficialDocumentationLinkProvider.getDocLink(codeField.type),
            injectedFields = KeysResolver.keysToInjectedField(keys),
            overviewProperties: IDocumentationProperty[] = [],
            overviewSnippets: IDocumentationSnippet[] = NestedFieldsProvider.generate(codeField.handle, injectedFields);

        overviewProperties.push({ mono: true, name: 'Mode', value: codeField.mode });
        overviewProperties.push({ mono: false, name: 'Indent Type', value: (codeField.indentType ?? 'tabs') + '(' + (codeField.indentSize ?? 4) + ')' });

        overviewSnippets.unshift({
            overview: `Rendering a <code /> element using the details of the ${codeField.handle} field`,
            snippet: `{{ ${codeField.handle} }}
    <pre><code class="language-{{ mode }}">{{ code }}</code></pre>
{{ /${codeField.handle} }}`
        });

        return {
            resolved: true,
            documentation: {
                handle: codeField.type,
                field: codeField,
                injects: injectedFields,
                stringable: false,
                rawReturns: AugmentationTypes.String,
                augmentsTo: AugmentationTypes.ArrayableString,
                canBeTagPair: true,
                exampleSnippets: [],
                overviewSnippets: overviewSnippets,
                officialDocumentation: docLink,
                overviewProperties: overviewProperties,
                stringableReturns: "The code field's value",
                modifiers: []
            }
        };
    }
}