import { AntlersError, ErrrorLevel } from '../../runtime/errors/antlersError';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes';
import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { IDiagnosticsHandler } from '../diagnosticsHandler';

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
                    ErrrorLevel.Warning
                ));
            }
        });      

        return errors;
    }
};

export default InvalidParameterHandler;
