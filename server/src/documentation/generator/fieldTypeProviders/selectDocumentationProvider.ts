import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver';
import { IProjectFields, ISelectFieldType } from '../../../projects/structuredFieldTypes/types';
import { AugmentationTypes } from '../augmentationTypes';
import { ForeachProvider } from '../providers/foreachProvider';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet } from '../types';

export class SelectDocumentationProvider implements IDocumentationProvider {
    resolve(context: ISelectFieldType, currentProject: IProjectFields): IDocumentationResult {
        const docLink = OfficialDocumentationLinkProvider.getDocLink(context.type),
            keys = ['value', 'label', 'key'],
            injectedFields = KeysResolver.keysToInjectedField(keys),
            overviewProperties: IDocumentationProperty[] = [];


        let rawReturns: AugmentationTypes = AugmentationTypes.String,
            augmentsTo: AugmentationTypes = AugmentationTypes.LabeledValueArray,
            overviewSnippets: IDocumentationSnippet[] = [];;

        if (context.multiple !== true) {
            rawReturns = AugmentationTypes.String;
            augmentsTo = AugmentationTypes.LabeledValue;
            overviewSnippets = NestedFieldsProvider.generate(context.handle, injectedFields);
            overviewSnippets.push(ForeachProvider.generate(context.handle));
        } else {
            overviewSnippets = NestedFieldsProvider.generateArrayFields(context.handle, injectedFields);
        }

        return {
            resolved: true,
            documentation: {
                handle: context.type,
                field: context,
                injects: injectedFields,
                stringable: true,
                rawReturns: rawReturns,
                augmentsTo: augmentsTo,
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