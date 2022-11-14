import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver';
import { IParsedBlueprint, IProjectFields, IUsersFieldType } from '../../../projects/structuredFieldTypes/types';
import { AugmentationTypes } from '../augmentationTypes';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet, IInjectedField } from '../types';
import { GeneralQueryBuilderDocumentationProvider } from './generalQueryBuilderDocumentationProvider';

export class UsersDocumentationProvider implements IDocumentationProvider {
    resolve(context: IUsersFieldType, currentProject: IProjectFields): IDocumentationResult {
        if (context.maxItems !== 1) {
            return (new GeneralQueryBuilderDocumentationProvider()).resolve(context, currentProject);
        }

        let userBlueprint: IParsedBlueprint | null = null;

        for (let i = 0; i < currentProject.general.length; i++) {
            if (currentProject.general[i].handle == 'user') {
                userBlueprint = currentProject.general[i];
                break;
            }
        }

        const docLink = OfficialDocumentationLinkProvider.getDocLink(context.type),
            injectedFields: IInjectedField[] = KeysResolver.fieldsToInjectedFields(userBlueprint?.allFields ?? []),
            overviewProperties: IDocumentationProperty[] = [],
            overviewSnippets: IDocumentationSnippet[] = NestedFieldsProvider.generate(context.handle, injectedFields);

        return {
            resolved: true,
            documentation: {
                handle: context.type,
                field: context,
                injects: injectedFields,
                stringable: false,
                rawReturns: AugmentationTypes.User,
                augmentsTo: AugmentationTypes.User,
                canBeTagPair: true,
                exampleSnippets: [],
                overviewSnippets: overviewSnippets,
                officialDocumentation: docLink,
                overviewProperties: overviewProperties,
                stringableReturns: null,
                modifiers: []
            }
        };
    }
}