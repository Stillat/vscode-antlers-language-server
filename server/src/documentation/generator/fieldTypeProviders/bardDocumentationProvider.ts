import { IBardFieldType, IProjectFields } from '../../../projects/structuredFieldTypes/types.js';
import { AugmentationTypes } from '../augmentationTypes.js';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider.js';
import { SetsSnippetProvider } from '../snippets/setsSnippetProvider.js';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet, IInjectedField } from '../types.js';
import { TextDocumentationProvider } from './textDocumentationProvider.js';

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