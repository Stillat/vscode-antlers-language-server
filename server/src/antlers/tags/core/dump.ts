import { makeTagDocWithCodeSample } from '../../../documentation/utils';
import { convertImmediateScopeToCompletionList } from '../../../suggestions/suggestionManager';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { EmptyCompletionResult, exclusiveResult, IAntlersTag, ICompletionResult } from '../../tagManager';

const Dump: IAntlersTag = {
    tagName: 'dump',
    hideFromCompletions: false,
    requiresClose: false,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    introducedIn: null,
    parameters: [],
    resolveCompletionItems: (params: ISuggestionRequest): ICompletionResult => {
        if (params.leftWord == 'dump' && params.leftChar == ':') {
            return exclusiveResult(convertImmediateScopeToCompletionList(params));
        }

        return EmptyCompletionResult;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample(
            'dump Tag',
            'The `dump` tag is a useful tag for debugging, and will display the raw data available at the point the tag is rendered.',
            `{{ collection:articles }}
	{{# View all data available, for each entry. #}}
    {{ dump }}
{{ /collection:articles }}`,
            'https://statamic.dev/tags/dump'
        );
    }
};

export default Dump;
