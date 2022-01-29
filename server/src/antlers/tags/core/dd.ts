import { makeTagDocWithCodeSample } from '../../../documentation/utils';
import { ISuggestionRequest } from '../../../suggestions/suggestionRequest';
import { IAntlersTag } from '../../tagManager';

const DdTag: IAntlersTag = {
    tagName: 'dd',
    hideFromCompletions: false,
    requiresClose: false,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    introducedIn: null,
    parameters: [],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample(
            'dd Tag',
            'The `dd` tag is a useful tag for debugging, and will display the raw data available at the point the tag is rendered. This tag will stop the template from rendering after it is encountered.  If Ignition is available, this tag will use the [ddd](https://flareapp.io/blog/1-introducing-ddd-a-new-global-helper-for-laravel) method.',
            `{{ collection:articles }}
	{{#
		View all data available, for the first
		entry that renders the dd tag.
	#}}
    {{ dd }}
{{ /collection:articles }}`,
            null
        );
    }
};

const DddTag: IAntlersTag = {
    tagName: 'ddd',
    hideFromCompletions: false,
    requiresClose: false,
    injectParentScope: false,
    allowsContentClose: false,
    allowsArbitraryParameters: false,
    introducedIn: null,
    parameters: [],
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDocWithCodeSample(
            'ddd Tag',
            'The `ddd` tag is a useful tag for debugging, and will display the raw data available at the point the tag is rendered. This tag will stop the template from rendering after it is encountered.  If Ignition is available, this tag will use the [ddd](https://flareapp.io/blog/1-introducing-ddd-a-new-global-helper-for-laravel) method.',
            `{{ collection:articles }}
	{{#
		View all data available, for the first
		entry that renders the ddd tag.
	#}}
    {{ ddd }}
{{ /collection:articles }}`,
            null
        );
    }
};

export { DdTag, DddTag };
