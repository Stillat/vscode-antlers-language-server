import { makeTagDocWithCodeSample } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { exclusiveResultList, IAntlersParameter, IAntlersTag } from '../../tagManager';

const GetContent: IAntlersTag = {
    tagName: 'get_content',
    hideFromCompletions: false,
    requiresClose: true,
    injectParentScope: false,
    allowsContentClose: false,
	introducedIn: null,
    allowsArbitraryParameters: false,
    parameters: [
        {
            isRequired: false,
            name: 'from',
            acceptsVariableInterpolation: false,
            aliases: [],
            allowsVariableReference: true,
            description: 'The ID to retrieve data for',
            expectsTypes: ['string', 'array'],
            isDynamic: false,
        },
        {
            isRequired: false,
            name: 'locale',
            aliases: ['site'],
            acceptsVariableInterpolation: false,
            allowsVariableReference: false,
            description: 'The locale to show the content in',
            expectsTypes: ['string'],
            isDynamic: false
        }
    ],
    resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
        if (parameter.name == 'locale' || parameter.name == 'site') {
            return exclusiveResultList(params.project.getSiteNames());
        }

        return null;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample(
            'get_content Tag',
            'The `get_content` tag can be used to retrieve content from other entries. This tag accepts the ID of another entry, and will return access to all data for that entry.',
            `{{ get_content from="the-entry-id" }}
{{ /get_content }}`,
            'https://statamic.dev/tags/get_content'
        );
    }
};

export default GetContent;
