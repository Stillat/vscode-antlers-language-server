import { makeTagDocWithCodeSample } from '../../../documentation/utils.js';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest.js';
import { IAntlersTag } from '../../tagManager.js';

const NotFound: IAntlersTag = {
    tagName: 'not_found',
    hideFromCompletions: false,
    requiresClose: false,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    parameters: [],
    introducedIn: null,
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample(
            '404 (Not Found) Tag',
            'The `not_found` tag will trigger a 404 status code, and display the 404 template to the site visitor.',
            `{{ unless logged_in }}
	{{# Display the 404 Not Found page. #}}
	{{ not_found }}
{{ /unless }}`, 'https://statamic.dev/tags/404');
    }
};

export default NotFound;
