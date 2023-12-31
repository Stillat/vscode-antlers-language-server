import { makeTagDoc } from '../../../../documentation/utils.js';
import { AntlersNode } from '../../../../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest.js';
import { Scope } from '../../../scope/scope.js';
import { IAntlersTag } from '../../../tagManager.js';
import { GetErrorsParameters } from './getErrorsParameters.js';

const GetError: IAntlersTag = {
    tagName: 'get_error',
    hideFromCompletions: false,
    requiresClose: true,
    injectParentScope: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    parameters: GetErrorsParameters,
    introducedIn: null,
    augmentScope: (node: AntlersNode, scope: Scope) => {
        if (node.isClosingTag) {
            return scope;
        }

        scope.addVariable({
            dataType: 'string',
            introducedBy: node,
            name: 'message',
            sourceName: '*internal.tag.get_error',
            sourceField: {
                blueprintName: '*internal.tag.get_error',
                displayName: 'get_error',
                import: null,
                instructionText: null,
                maxItems: null,
                name: 'message',
                refFieldSetField: null,
                sets: null,
                type: 'string'
            }
        });

        return scope;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'get_error Tag',
            'The `get_error` tag can be used to retrieve the first error message for a specific field.',
            'https://statamic.dev/tags/get_errors#get-the-first-error-for-a-specific-field'
        );
    }
};

export default GetError;
