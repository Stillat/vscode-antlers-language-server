import { CompletionItem, CompletionItemKind } from 'vscode-languageserver-types';
import { makeTagDoc } from '../../../../documentation/utils.js';
import SectionManager from '../../../../references/sectionManager.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { EmptyCompletionResult, IAntlersTag, nonExclusiveResult } from '../../../tagManager.js';

const Section: IAntlersTag = {
    tagName: 'section',
    hideFromCompletions: false,
    injectParentScope: false,
    requiresClose: true,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    introducedIn: null,
    parameters: [],
    resolveCompletionItems: (params: ISuggestionRequest) => {
        if ((params.leftWord == 'section' || params.leftWord == '/section') && params.leftChar == ':') {
            const items: CompletionItem[] = [],
                knownSectionNames = SectionManager.instance?.getKnownSectionNames() ?? [];

            for (let i = 0; i < knownSectionNames.length; i++) {
                items.push({
                    label: knownSectionNames[i],
                    kind: CompletionItemKind.Field
                });
            }

            return nonExclusiveResult(items);
        }

        return EmptyCompletionResult;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'section Tag',
            'The `section` tag is used to push content to a named region defined by the `yield` tag.',
            'https://statamic.dev/tags/section'
        );
    }
};

export default Section;
