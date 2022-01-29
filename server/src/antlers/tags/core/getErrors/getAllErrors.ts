import { makeTagDoc } from '../../../../documentation/utils';
import { AntlersNode } from '../../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { Scope } from '../../../scope/scope';
import { IAntlersTag } from '../../../tagManager';
import { GetErrorsParameters } from './getErrorsParameters';

const GetAllErrors: IAntlersTag = {
    tagName: 'get_errors:all',
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

        const errorScope = scope.copy();
        errorScope.addVariable({
            dataType: 'string',
            introducedBy: node,
            name: 'message',
            sourceName: '*internal.tag.get_errors.all',
            sourceField: {
                blueprintName: '*internal.tag.get_errors.all',
                displayName: 'get_errors:all',
                import: null,
                instructionText: null,
                maxItems: null,
                name: 'message',
                refFieldSetField: null,
                sets: null,
                type: 'string'
            }
        });

        scope.addScopeList('messages', errorScope);


        return scope;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'get_errors:all Tag',
            'The `get_errors:all` tag can be used to retrieve all form validation errors.',
            'https://statamic.dev/tags/get_errors#list-all-validation-errors'
        );
    }
};

export default GetAllErrors;
