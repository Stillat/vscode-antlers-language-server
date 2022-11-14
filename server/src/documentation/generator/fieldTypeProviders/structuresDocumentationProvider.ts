import { KeysResolver } from '../../../projects/structuredFieldTypes/keysResolver';
import { IProjectFields, IStructuresFieldType } from '../../../projects/structuredFieldTypes/types';
import { AugmentationTypes } from '../augmentationTypes';
import { NestedFieldsProvider } from '../providers/nestedFieldsProvider';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider';
import StructuresSnippetProvider from '../snippets/structuresSnippetProvider';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet } from '../types';

export class StructuresDocumentationProvider implements IDocumentationProvider {
    private injectsKeys: string[] = ['title', 'handle'];

    resolve(structure: IStructuresFieldType, currentProject: IProjectFields): IDocumentationResult {
        const docLink = OfficialDocumentationLinkProvider.getDocLink(structure.type),
            injectedFields = KeysResolver.keysToInjectedField(this.injectsKeys),
            overviewProperties: IDocumentationProperty[] = [];


        let rawReturns: AugmentationTypes = AugmentationTypes.StructureArray,
            augmentsTo: AugmentationTypes = AugmentationTypes.StructureArray,
            overviewSnippets: IDocumentationSnippet[] = StructuresSnippetProvider.getSnippets(structure),
            stringable = false;

        if (structure.maxItems === 1) {
            rawReturns = AugmentationTypes.Structure;
            augmentsTo = AugmentationTypes.Structure;
            stringable = true;
            NestedFieldsProvider.generate(structure.handle, injectedFields).forEach((snippet) => {
                overviewSnippets.push(snippet);
            });
        } else {
            NestedFieldsProvider.generateArrayFields(structure.handle, injectedFields).forEach((snippet) => {
                overviewSnippets.push(snippet);
            });
        }

        return {
            resolved: true,
            documentation: {
                handle: structure.type,
                field: structure,
                injects: injectedFields,
                stringable: true,
                rawReturns: rawReturns,
                augmentsTo: augmentsTo,
                canBeTagPair: true,
                exampleSnippets: [],
                overviewSnippets: overviewSnippets,
                officialDocumentation: docLink,
                overviewProperties: overviewProperties,
                stringableReturns: "The structure's handle",
                modifiers: []
            }
        };
    }
}