import { makeTagDocWithCodeSample } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';

const ScopeTag: IAntlersTag = {
    tagName: 'scope',
    hideFromCompletions: false,
    requiresClose: true,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    injectParentScope: false,
	introducedIn: null,
    parameters: [

    ],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample(
            'scope Tag',
            'The `scope` tag creates a copy of all available variables, and saves them to a new  *array* variable defined by the tag\'s method part.',
            `{{ scope:scope_name }}
    {{ scope_name:title }}
{{ /scope:scope_name }}
`,
            null
        );
    }
};

export default ScopeTag;
