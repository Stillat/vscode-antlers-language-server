import { CompletionItem } from 'vscode-languageserver';;
import { makeTagDocWithCodeSample } from '../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { EmptyCompletionResult, IAntlersTag, exclusiveResult } from '../../tagManager.js';
import { tagToCompletionItem } from '../../documentedLabel.js';
import ViteAsset from './vite/viteAsset.js';

const ViteTagCompletionItems: CompletionItem[] = [
    tagToCompletionItem(ViteAsset)
];

const Vite: IAntlersTag = {
    tagName: 'vite',
    hideFromCompletions: false,
    requiresClose: true,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    introducedIn: null,
    parameters: [
        {
            isRequired: true,
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: false,
            name: 'src',
            description: 'The entry point',
            expectsTypes: ['string'],
            isDynamic: false
        }
    ],
    resolveCompletionItems: (params: ISuggestionRequest) => {
        if (
            (params.leftWord == "vite" ||
                params.leftWord == "/vite") &&
            params.leftChar == ":"
        ) {
            return exclusiveResult(ViteTagCompletionItems);
        }

        return EmptyCompletionResult;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample(
            'vite Tag',
            'Generates Vite tags for an entrypoint.',
            `{{ vite src="entry/point" }}`,
            null
        );
    }
};

export default Vite;
