import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { IComposerPackage } from '../../../composer/composerPackage';
import { makeTagDocWithCodeSample } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { EmptyCompletionResult, exclusiveResult, IAntlersTag, ICompletionResult } from '../../tagManager';

const InstalledTag: IAntlersTag = {
    tagName: 'installed',
    hideFromCompletions: false,
    requiresClose: true,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: true,
    introducedIn: '3.1.19',
    parameters: [],
    resolveCompletionItems: (params: ISuggestionRequest): ICompletionResult => {
        if (params.project != null) {
            const projectPackages = params.project.getComposerPackages(),
                packageCompletions: CompletionItem[] = [];

            projectPackages.forEach((composerPackage: IComposerPackage, packageName: string) => {
                packageCompletions.push({
                    label: composerPackage.name,
                    kind: CompletionItemKind.Text
                });
            });

            return exclusiveResult(packageCompletions);
        }

        return EmptyCompletionResult;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample(
            'installed Tag',
            'The `installed` tag is used to check if the site has a specific Composer package available.',
            `{{ if {installed:composer/package-name} }}
    {{# Package is availabl.e #}}
{{ else }}
    {{# Something else. #}}
{{ /if }}`,
            'https://statamic.dev/tags/installed'
        );
    }
};

export { InstalledTag };
