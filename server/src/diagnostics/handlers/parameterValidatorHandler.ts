import { AntlersSettings } from '../../antlersSettings';
import { ParameterValidator } from '../../runtime/analyzers/parameterValidator';
import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { IDiagnosticsHandler } from '../diagnosticsHandler';

const ParameterValidatorHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode, settings: AntlersSettings) {
        if (settings.diagnostics.validateTagParameters == false) {
            return [];
        }

        return ParameterValidator.validateParameters(node);
    }
}

export default ParameterValidatorHandler;
