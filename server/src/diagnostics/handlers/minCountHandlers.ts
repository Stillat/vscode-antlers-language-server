import { QueryBuilderInspection } from '../../antlers/variables/queryBuilderInspection.js';
import { AntlersError, ErrorLevel } from '../../runtime/errors/antlersError.js';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes.js';
import { AntlersNode, PathNode, VariableNode } from '../../runtime/nodes/abstractNode.js';
import { IDiagnosticsHandler } from '../diagnosticsHandler.js';

const MinCountHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        const errors: AntlersError[] = [];

        if (node.scopeVariable != null && node.isTagNode == false) {
            if (node.runtimeNodes.length == 0) { return errors; }

            let firstRtNode = node.runtimeNodes[0];

            if (firstRtNode instanceof VariableNode && node.scopeVariable.sourceField != null &&
                firstRtNode.variableReference != null && firstRtNode.variableReference.pathParts.length > 1) {
                if (firstRtNode.variableReference.pathParts[1] instanceof PathNode) {
                    const tmpValue = parseInt(firstRtNode.variableReference.pathParts[1].name);

                    if (! isNaN(tmpValue)) {
                        return errors;
                    }

                    if (firstRtNode.variableReference.pathParts[1].name.startsWith('int_')) {
                        return errors;
                    }

                    if (QueryBuilderInspection.isQueryBuilderType(node.scopeVariable.sourceField.type) &&
                        node.scopeVariable.sourceField.maxItems != 1) {
                        errors.push(AntlersError.makeSyntaxError(
                            AntlersErrorCodes.LINT_INVALID_VARIABLE_ACCESS,
                            node,
                            'Incorrect variable access for field not configured with max_items: 1',
                            ErrorLevel.Warning
                        ));
                    }
                }
            }
        }

        return errors;
    }
};

export default MinCountHandler;
