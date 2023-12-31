import { AntlersError, ErrorLevel } from '../../runtime/errors/antlersError.js';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes.js';
import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IDiagnosticsHandler } from '../diagnosticsHandler.js';

const InvalidParameterHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        const errors: AntlersError[] = [];

        if (node.hasParameters == false) {
            return errors;
        }

        node.parameters.forEach((param) => {
            if (param.hasValidValueDelimiter == false) {
                errors.push(AntlersError.makeSyntaxError(
                    AntlersErrorCodes.LINT_INVALID_PARAMETER_VALUE_DELIMITER,
                    param,
                    'Parameter values must be enclosed in single or double quotes.',
                    ErrorLevel.Warning
                ));
            }
        });      

        return errors;
    }
};

export default InvalidParameterHandler;
