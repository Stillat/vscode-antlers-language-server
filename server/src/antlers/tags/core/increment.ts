import { CompletionItem } from 'vscode-languageserver';
import { makeTagDoc } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { tagToCompletionItem } from '../../documentedLabel';
import { EmptyCompletionResult, exclusiveResult, IAntlersTag } from '../../tagManager';
import IncrementReset from './incrementReset';

const IncrementCompletionItems: CompletionItem[] = [
    tagToCompletionItem(IncrementReset)
];

const Increment: IAntlersTag = {
    tagName: 'increment',
    hideFromCompletions: false,
    requiresClose: false,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
	introducedIn: null,
    parameters: [
        {
            isRequired: false,
            name: 'from',
            aliases: [],
            description: 'The number to start incrementing by',
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            expectsTypes: ['number'],
            isDynamic: false
        },
        {
            isRequired: false,
            name: 'by',
            aliases: [],
            description: 'The number to increment by',
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            expectsTypes: ['number'],
            isDynamic: false
        }
    ],
    resolveCompletionItems: (params: ISuggestionRequest) => {
        if (params.leftWord == 'increment' || params.leftWord == '/increment' && params.leftChar == ':') {
            return exclusiveResult(IncrementCompletionItems);
        }

        return EmptyCompletionResult;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'increment Tag',
            'The `increment` tag can be used to increment a value each time the tag is encountered.',
            'https://statamic.dev/tags/increment'
        );
    }
};

export default Increment;
