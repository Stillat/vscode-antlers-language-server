import { AntlersSettings } from '../../antlersSettings.js';
import { ParameterValidator } from '../../runtime/analyzers/parameterValidator.js';
import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IDiagnosticsHandler } from '../diagnosticsHandler.js';

const ParameterValidatorHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode, settings: AntlersSettings) {
        if (settings.diagnostics.validateTagParameters == false) {
            return [];
        }

        return ParameterValidator.validateParameters(node);
    }
}

export default ParameterValidatorHandler;
