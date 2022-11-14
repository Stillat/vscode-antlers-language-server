import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver';
import { IFieldDetails, IProjectFields } from '../../../projects/structuredFieldTypes/types';
import { AugmentationTypes } from '../augmentationTypes';
import { ForeachProvider } from '../providers/foreachProvider';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet } from '../types';

export class LabeledValueDocumentationProvider implements IDocumentationProvider {
    resolve(context: IFieldDetails, currentProject: IProjectFields): IDocumentationResult {
        const docLink = OfficialDocumentationLinkProvider.getDocLink(context.type),
            keys = ['value', 'label', 'key'],
            injectedFields = KeysResolver.keysToInjectedField(keys),
            overviewProperties: IDocumentationProperty[] = [],
            overviewSnippets: IDocumentationSnippet[] = NestedFieldsProvider.generate(context.handle, injectedFields);

        overviewSnippets.push(ForeachProvider.generate(context.handle));

        return {
            resolved: true,
            documentation: {
                handle: context.type,
                field: context,
                injects: injectedFields,
                stringable: true,
                rawReturns: AugmentationTypes.String,
                augmentsTo: AugmentationTypes.LabeledValue,
                canBeTagPair: true,
                exampleSnippets: [],
                overviewSnippets: overviewSnippets,
                officialDocumentation: docLink,
                overviewProperties: overviewProperties,
                stringableReturns: "The field's value",
                modifiers: []
            }
        };
    }
}