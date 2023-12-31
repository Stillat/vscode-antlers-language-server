import { AntlersError, ErrorLevel } from '../../runtime/errors/antlersError.js';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes.js';
import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IDiagnosticsHandler } from '../diagnosticsHandler.js';

const MixedModifierHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        const errors: AntlersError[] = [];

        if (node.modifiers != null) {
            if (node.modifiers.hasMixedModifierStyles) {
                errors.push(AntlersError.makeSyntaxError(
                    AntlersErrorCodes.LINT_MIXED_MODIFIERS,
                    node,
                    'Mixed modifier styles is not supported',
                    ErrorLevel.Error
                ));
            }
        }

        return errors;
    }
};

export default MixedModifierHandler;
