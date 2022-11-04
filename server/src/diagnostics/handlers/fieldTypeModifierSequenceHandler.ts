import { AntlersError, ErrrorLevel } from '../../runtime/errors/antlersError';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes';
import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { IDiagnosticsHandler } from '../diagnosticsHandler';

const FieldTypeModifierSequenceHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        const errors: AntlersError[] = [];

        if (node.scopeVariable == null) {
            return errors;
        }

        if (node.scopeVariable.sourceField == null) {
            return errors;
        }

        if (node.modifierChain == null || node.modifierChain.modifierChain.length == 0) {
            return errors;
        }

        const fieldType = node.scopeVariable.sourceField.type,
            firstModifier = node.modifierChain.modifierChain[0];

        if (firstModifier.modifier == null) {
            return errors;
        }

        if (fieldType == 'select_multiple') {
            if (firstModifier.modifier.name == 'join' || firstModifier.modifier.name == 'joinplode') {
                errors.push(AntlersError.makeSyntaxError(
                    AntlersErrorCodes.LINT_SELECT_FIELD_JOIN_RAW,
                    node,
                    'To join a select field, add the raw modifier: ' + printNodeModifierContent(node, 'join'),
                    ErrrorLevel.Warning
                ));
            }
        }

        return errors;
    }
};

function printNodeModifierContent(node: AntlersNode, addModifier: string): string {
    return '{{ ' + (node.name?.name ?? 'field_name') + ' | raw | ' + addModifier + ' ... }}';
}


export default FieldTypeModifierSequenceHandler;
