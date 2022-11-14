import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver';
import { IFormFieldType, IProjectFields } from '../../../projects/structuredFieldTypes/types';
import { AugmentationTypes } from '../augmentationTypes';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet } from '../types';

export class FormDocumentationProvider implements IDocumentationProvider {
    private injectsKeys: string[] = ['handle', 'title', 'api_url', 'honeypot'];

    resolve(form: IFormFieldType, currentProject: IProjectFields): IDocumentationResult {
        const docLink = OfficialDocumentationLinkProvider.getDocLink(form.type),
            injectedFields = KeysResolver.keysToInjectedField(this.injectsKeys),
            overviewProperties: IDocumentationProperty[] = [];


        let rawReturns: AugmentationTypes = AugmentationTypes.FormArray,
            augmentsTo: AugmentationTypes = AugmentationTypes.FormArray,
            overviewSnippets: IDocumentationSnippet[] = [],
            stringable = false;

        if (form.maxItems === 1) {
            rawReturns = AugmentationTypes.Form;
            augmentsTo = AugmentationTypes.Form;
            stringable = true;
            overviewSnippets = NestedFieldsProvider.generate(form.handle, injectedFields);

            overviewSnippets.unshift({
                overview: `Using the value of the ${form.handle} field to create a form`,
                snippet: `{{ form:create :in="${form.handle}.handle" }}
    {{ fields }}
        {{# Render the fields. #}}
    {{ /fields }}

    <button type="submit">The Submit Button</button>
{{ /form:create }}`
            });
        } else {
            overviewSnippets = NestedFieldsProvider.generateArrayFields(form.handle, injectedFields);
        }

        return {
            resolved: true,
            documentation: {
                handle: form.type,
                field: form,
                injects: injectedFields,
                stringable: true,
                rawReturns: rawReturns,
                augmentsTo: augmentsTo,
                canBeTagPair: true,
                exampleSnippets: [],
                overviewSnippets: overviewSnippets,
                officialDocumentation: docLink,
                overviewProperties: overviewProperties,
                stringableReturns: "The form's handle",
                modifiers: []
            }
        };
    }
}