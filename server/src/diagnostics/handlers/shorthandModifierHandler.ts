import { AntlersSettings } from '../../antlersSettings.js';
import { AntlersError, ErrorLevel } from '../../runtime/errors/antlersError.js';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes.js';
import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IDiagnosticsHandler } from '../diagnosticsHandler.js';

const ShorthandModifierHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode, settings: AntlersSettings) {
        const errors: AntlersError[] = [];

        if (settings.languageVersion == 'runtime') {
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
                    ErrorLevel.Error
                ));

                errors.push(AntlersError.makeSyntaxError(
                    AntlersErrorCodes.LINT_SHORTHAND_MODIFIER_TAG_MUST_MATCH,
                    node.isClosedBy,
                    'Closing tags must match exactly when using shorthand modifiers in tag pairs. Expecting: "' + checkContent + '".',
                    ErrorLevel.Error
                ));
            }
        }

        return errors;
    }
};

export default ShorthandModifierHandler;
