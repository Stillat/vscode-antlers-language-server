import { makeTagDocWithCodeSample } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';

const Error404: IAntlersTag = {
    tagName: '404',
    hideFromCompletions: false,
    requiresClose: false,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    parameters: [],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample(
            '404 (Not Found) Tag',
            'The `404` (Not Found) tag will trigger a 404 status code, and display the 404 template to the site visitor.',
            `{{ unless logged_in }}
	{{# Display the 404 Not Found page. #}}
	{{ 404 }}
{{ /unless }}`, 'https://statamic.dev/tags/404');
    }
};

export default Error404;
