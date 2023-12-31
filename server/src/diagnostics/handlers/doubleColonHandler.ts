import { AntlersError, ErrorLevel } from '../../runtime/errors/antlersError.js';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes.js';
import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IDiagnosticsHandler } from '../diagnosticsHandler.js';

const DoubleColonHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        const errors: AntlersError[] = [];

        if (node.runtimeName().includes('::')) {
            errors.push(AntlersError.makeSyntaxError(
                AntlersErrorCodes.LINT_DOUBLE_COLON_IN_TAG_IDENTIFIER,
                node,
                ':: in tag part leads to ErrorException call_user_func() runtime exception.',
                ErrorLevel.Warning
            ));
        }

        return errors;
    }
};

export default DoubleColonHandler;
