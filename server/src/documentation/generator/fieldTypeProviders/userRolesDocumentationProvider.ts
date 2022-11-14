import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver';
import { IProjectFields, IUserRolesFieldType } from '../../../projects/structuredFieldTypes/types';
import { AugmentationTypes } from '../augmentationTypes';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider';
import { PipedTagSnippetProvider } from '../snippets/pipedTagSnippetProvider';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet } from '../types';

export class UserRolesDocumentationProvider implements IDocumentationProvider {
    private injectsKeys: string[] = ['title', 'handle'];

    resolve(role: IUserRolesFieldType, currentProject: IProjectFields): IDocumentationResult {
        const docLink = OfficialDocumentationLinkProvider.getDocLink(role.type),
            injectedFields = KeysResolver.keysToInjectedField(this.injectsKeys),
            overviewProperties: IDocumentationProperty[] = [];


        let rawReturns: AugmentationTypes = AugmentationTypes.UserRoleArray,
            augmentsTo: AugmentationTypes = AugmentationTypes.UserRoleArray,
            overviewSnippets: IDocumentationSnippet[] = [],
            stringable = false;

        if (role.maxItems === 1) {
            rawReturns = AugmentationTypes.UserRole;
            augmentsTo = AugmentationTypes.UserRole;
            stringable = true;
            overviewSnippets.push(PipedTagSnippetProvider.generateSingle('user:is', 'role', role.handle));
            overviewSnippets.push(PipedTagSnippetProvider.generateSingleCondition('user:is', 'role', role.handle));
            overviewSnippets = overviewSnippets.concat(NestedFieldsProvider.generate(role.handle, injectedFields));
        } else {
            overviewSnippets.push(PipedTagSnippetProvider.generate('user:is', 'role', role.handle));
            overviewSnippets.push(PipedTagSnippetProvider.generateCondition('user:is', 'role', role.handle));
            overviewSnippets = overviewSnippets.concat(NestedFieldsProvider.generateArrayFields(role.handle, injectedFields));
        }

        return {
            resolved: true,
            documentation: {
                handle: role.type,
                field: role,
                injects: injectedFields,
                stringable: true,
                rawReturns: rawReturns,
                augmentsTo: augmentsTo,
                canBeTagPair: true,
                exampleSnippets: [],
                overviewSnippets: overviewSnippets,
                officialDocumentation: docLink,
                overviewProperties: overviewProperties,
                stringableReturns: "The user role's handle",
                modifiers: []
            }
        };
    }
}