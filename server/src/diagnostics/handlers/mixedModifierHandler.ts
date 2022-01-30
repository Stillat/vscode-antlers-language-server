import { AntlersError, ErrrorLevel } from '../../runtime/errors/antlersError';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes';
import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { IDiagnosticsHandler } from '../diagnosticsHandler';

const MixedModifierHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        const errors: AntlersError[] = [];

        if (node.modifiers != null) {
            if (node.modifiers.hasMixedModifierStyles) {
                errors.push(AntlersError.makeSyntaxError(
                    AntlersErrorCodes.LINT_MIXED_MODIFIERS,
                    node,
                    'Mixed modifier styles is not supported',
                    ErrrorLevel.Error
                ));
            }
        }

        return errors;
    }
};

export default MixedModifierHandler;
