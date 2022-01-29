import { makeTagDoc } from '../../../../documentation/utils';
import { AntlersNode } from '../../../../runtime/nodes/abstractNode';
import { ISuggestionRequest } from '../../../../suggestions/suggestionRequest';
import { Scope } from '../../../scope/scope';
import { IAntlersTag } from '../../../tagManager';
import { GetErrorsParameters } from './getErrorsParameters';

const GetErrors: IAntlersTag = {
    tagName: 'get_errors',
    hideFromCompletions: false,
    requiresClose: true,
    injectParentScope: false,
    allowsArbitraryParameters: false,
    allowsContentClose: false,
    parameters: GetErrorsParameters,
	introducedIn: '3.2.23',
    augmentScope: (node: AntlersNode, scope: Scope) => {
        if (node.isClosingTag) {
            return scope;
        }

        if (node.name?.methodPart == null) {
            const fieldsScope = scope.copy();
            fieldsScope.addVariable({
                dataType: 'string',
                introducedBy: node,
                name: 'field',
                sourceName: '*internal.tag.get_errors',
                sourceField: {
                    blueprintName: '*internal.tag.get_errors',
                    displayName: 'get_errors',
                    import: null,
                    instructionText: null,
                    maxItems: null,
                    name: 'field',
                    refFieldSetField: null,
                    sets: null,
                    type: 'string'
                }
            });
            const messageScope = fieldsScope.copy();
            messageScope.addVariable({
                dataType: 'string',
                introducedBy: node,
                name: 'message',
                sourceName: '*internal.tag.get_errors',
                sourceField: {
                    blueprintName: '*internal.tag.get_errors',
                    displayName: 'get_errors',
                    import: null,
                    instructionText: null,
                    maxItems: null,
                    name: 'message',
                    refFieldSetField: null,
                    sets: null,
                    type: 'string'
                }
            });

            fieldsScope.addScopeList('messages', messageScope);
            scope.addScopeList('fields', fieldsScope);

        } else {
            const errorScope = scope.copy();
            errorScope.addVariable({
                dataType: 'string',
                introducedBy: node,
                name: 'message',
                sourceName: '*internal.tag.get_errors',
                sourceField: {
                    blueprintName: '*internal.tag.get_errors',
                    displayName: 'get_errors',
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
        }

        return scope;
    },
    resolveDocumentation: (params?: ISuggestionRequest) => {
        return makeTagDoc(
            'get_errors Tag',
            'The `get_errors` tag can be used to retrieve form validation errors.',
            'https://statamic.dev/tags/get_errors'
        );
    }
};

export default GetErrors;
