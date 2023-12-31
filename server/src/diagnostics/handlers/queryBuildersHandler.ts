import { QueryBuilderInspection } from '../../antlers/variables/queryBuilderInspection.js';
import { AntlersError, ErrorLevel } from '../../runtime/errors/antlersError.js';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes.js';
import { AntlersNode, PathNode, VariableNode } from '../../runtime/nodes/abstractNode.js';
import { IDiagnosticsHandler } from '../diagnosticsHandler.js';

const queryBuilderMessage = `Query builder fields must use an alias in order to use modifiers`;

const QueryBuildersHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        const errors: AntlersError[] = [];

        if (node.scopeVariable != null && node.isTagNode == false) {
            if (node.runtimeNodes.length == 0) { return errors; }

            let firstRtNode = node.runtimeNodes[0];

            if (firstRtNode instanceof VariableNode && node.scopeVariable.sourceField != null) {
                if (node.hasParameter('as')) {
                    return errors;
                }

                if (QueryBuilderInspection.isQueryBuilderType(node.scopeVariable.sourceField.type)) {
                    if (node.modifierChain != null && node.modifierChain.modifierChain.length > 0) {
                        errors.push(AntlersError.makeSyntaxError(
                            AntlersErrorCodes.LINT_MODIFIERS_ON_QUERY_BUILDERS_REQUIRE_AS,
                            node,
                            queryBuilderMessage,
                            ErrorLevel.Warning
                        ));

                        return errors;
                    }

                    if (node.hasParameters) {
                        for (let i = 0; i < node.parameters.length; i++) {
                            const nParam = node.parameters[i];

                            if (nParam.modifier != null) {
                                if (!QueryBuilderInspection.isIgnoredParameterName(nParam.modifier.name)) {
                                    errors.push(AntlersError.makeSyntaxError(
                                        AntlersErrorCodes.LINT_MODIFIERS_ON_QUERY_BUILDERS_REQUIRE_AS,
                                        node,
                                        queryBuilderMessage,
                                        ErrorLevel.Warning
                                    ));

                                    return errors;
                                }
                            }
                        }
                    }
                }
            }
        }

        return errors;
    }
};

export default QueryBuildersHandler;
