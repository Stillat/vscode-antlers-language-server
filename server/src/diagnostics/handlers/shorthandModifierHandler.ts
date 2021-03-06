import { AntlersError, ErrrorLevel } from '../../runtime/errors/antlersError';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes';
import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { globalSettings } from '../../server';
import { IDiagnosticsHandler } from '../diagnosticsHandler';

const ShorthandModifierHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        const errors: AntlersError[] = [];

        if (globalSettings.languageVersion == 'runtime') {
            return [];
        }

        if (node.isClosedBy != null && node.modifierChain != null) {
            const curNodeContent = node.content.trim(),
                closeNodeContent = node.isClosedBy.content.trim(),
                checkContent = '/' + curNodeContent;

            if (closeNodeContent != checkContent) {
                errors.push(AntlersError.makeSyntaxError(
                    AntlersErrorCodes.LINT_SHORTHAND_MODIFIER_TAG_MUST_MATCH,
                    node,
                    'Closing tags must match exactly when using shorthand modifiers in tag pairs.',
                    ErrrorLevel.Error
                ));

                errors.push(AntlersError.makeSyntaxError(
                    AntlersErrorCodes.LINT_SHORTHAND_MODIFIER_TAG_MUST_MATCH,
                    node.isClosedBy,
                    'Closing tags must match exactly when using shorthand modifiers in tag pairs. Expecting: "' + checkContent + '".',
                    ErrrorLevel.Error
                ));
            }
        }

        return errors;
    }
};

export default ShorthandModifierHandler;
