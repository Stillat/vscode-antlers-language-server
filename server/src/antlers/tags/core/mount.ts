import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { makeTagDoc } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { exclusiveResult, IAntlersParameter, IAntlersTag, ICompletionResult } from '../../tagManager';
import { makeCollectionNameSuggestions } from './collection/utils';

const MountTag: IAntlersTag = {
    tagName: 'mount',
    hideFromCompletions: false,
    allowsArbitraryParameters: true,
    allowsContentClose: false,
    requiresClose: false,
    injectParentScope: false,
    introducedIn: '3.3.14',
    parameters: [
        {
            isRequired: false,
            acceptsVariableInterpolation: true,
            aliases: [],
            allowsVariableReference: true,
            description: 'The collection handle',
            name: 'handle',
            isDynamic: false,
            expectsTypes: ['string']
        }
    ],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'mount Tag',
            'The `mount` tag can be used to retrieve the mount URL for a given collection.',
            null
        );
    },
    resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest): ICompletionResult | null => {
        if (parameter.name == 'handle') {
            if (params.context?.parameterContext != null) {
                return exclusiveResult(makeCollectionNameSuggestions(params.context?.parameterContext.parameter?.getArrayValue() ?? [], params.project));
            }
        }

        return null;
    },
    resolveCompletionItems: (params: ISuggestionRequest): ICompletionResult => {
        const items: CompletionItem[] = [];

        if (params.isPastTagPart == false && (params.leftWord == 'mount' || params.leftWord == '/mount') && params.leftChar == ':') {
            const collectionNames = params.project.getCollectionNames();

            for (let i = 0; i < collectionNames.length; i++) {
                items.push({
                    label: collectionNames[i],
                    kind: CompletionItemKind.Field,
                    sortText: '0'
                });
            }
        }

        return {
            items: items,
            analyzeDefaults: false,
            isExclusiveResult: false
        };
    }
};

export default MountTag;
