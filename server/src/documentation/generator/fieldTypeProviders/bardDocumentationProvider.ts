import { IBardFieldType, IProjectFields } from '../../../projects/structuredFieldTypes/types';
import { AugmentationTypes } from '../augmentationTypes';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider';
import { SetsSnippetProvider } from '../snippets/setsSnippetProvider';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet, IInjectedField } from '../types';
import { TextDocumentationProvider } from './textDocumentationProvider';

export class BardDocumentationProvider implements IDocumentationProvider {
    resolve(context: IBardFieldType, currentProject: IProjectFields): IDocumentationResult {
        if (context.sets.length == 0) {
            return (new TextDocumentationProvider()).resolve(context, currentProject);
        }

        const docLink = OfficialDocumentationLinkProvider.getDocLink(context.type),
            injectedFields: IInjectedField[] = [],
            overviewProperties: IDocumentationProperty[] = [],
            overviewSnippets: IDocumentationSnippet[] = SetsSnippetProvider.generate(context.handle, context.sets);

        return {
            resolved: true,
            documentation: {
                handle: context.type,
                field: context,
                injects: injectedFields,
                stringable: false,
                rawReturns: AugmentationTypes.Array,
                augmentsTo: AugmentationTypes.Array,
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