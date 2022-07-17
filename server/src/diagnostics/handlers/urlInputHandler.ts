import { AntlersError, ErrrorLevel } from '../../runtime/errors/antlersError';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes';
import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { intersect } from '../../runtime/utilities/arrayHelpers';
import { IDiagnosticsHandler } from '../diagnosticsHandler';
import ModifierManager from '../../antlers/modifierManager';

const UrlInputHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        const tagName = node.getTagName().toLowerCase(),
            errors: AntlersError[] = [];
        if (tagName == 'get' || tagName == 'post') {
            const overlap = intersect(ModifierManager.instance?.getModifierNames() ?? [], node.modifiers.modifierNames);

            // Return early if the developer is using custom modifiers. These may sanitize.
            if (overlap.length == 0 && node.modifiers.modifierNames.length > 0 &&
                (node.modifiers.modifierNames.length == 1 && ModifierManager?.instance?.hasMacro(node.modifiers.modifierNames[0])) == false) {
                return errors;
            }

            let foundSanitizeInMacro = false;

            for (let i = 0; i < node.modifiers.modifierNames.length; i++) {
                const name = node.modifiers.modifierNames[i];

                if (ModifierManager.instance?.hasMacro(name)) {
                    const macro = ModifierManager.instance?.getMacro(name);

                    if (macro != null) {
                        for (let j = 0; j < macro.modifiers.length; j++) {
                            const macroModifier = macro.modifiers[j];

                            if (macroModifier.name == 'sanitize') {
                                foundSanitizeInMacro = true;
                                break;
                            }
                        }
                    }
                }
            }

            if (foundSanitizeInMacro == true) { return errors; }

            if (node.modifiers.modifierNames.includes('sanitize') == false) {
                errors.push(AntlersError.makeSyntaxError(
                    AntlersErrorCodes.LINT_URL_VARIABLE_WITHOUT_SANITIZE,
                    node,
                    'Request variables can be controlled by the end user, and should be sanitized',
                    ErrrorLevel.Warning
                ));
            }
        }

        return errors;
    }
}

export default UrlInputHandler;
