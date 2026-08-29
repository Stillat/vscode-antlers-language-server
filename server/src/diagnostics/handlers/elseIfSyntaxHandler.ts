import { AntlersError } from '../../runtime/errors/antlersError.js';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes.js';
import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IDiagnosticsHandler } from '../diagnosticsHandler.js';

const ElseIfSyntaxHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        if (node.runtimeName() != 'else' || !/^else\s+if\b/.test(node.getContent().trim())) {
            return [];
        }

        return [AntlersError.makeSyntaxError(
            AntlersErrorCodes.LINT_ELSE_IF_SYNTAX,
            node,
            'Use `elseif` instead of `else if`.'
        )];
    }
};

export default ElseIfSyntaxHandler;
