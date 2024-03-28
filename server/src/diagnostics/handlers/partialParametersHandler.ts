import { getViewName } from '../../antlers/tags/core/partials/partialUtilities.js';
import ProjectManager from '../../projects/projectManager.js';
import { AntlersError, ErrorLevel } from '../../runtime/errors/antlersError.js';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes.js';
import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IDiagnosticsHandler } from '../diagnosticsHandler.js';

const PartialParametersHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        const errors: AntlersError[] = [];

        if (node.isTagNode && node.name != null && node.getTagName() == 'partial') {
            if (node.isClosingTag && !node.isSelfClosing) {
                return errors;
            }

            const viewName = getViewName(node);

            if (viewName == null) { return errors; }

            const viewRef = ProjectManager.instance?.getStructure()?.findRelativeView(viewName);

            if (typeof viewRef == 'undefined' || viewRef == null) { return errors; }

            if (viewRef.injectsParameters.length > 0) {
                viewRef.injectsParameters.forEach((parameter) => {
                    if (parameter.isRequired && ! node.hasParameter(parameter.name)) {
                        errors.push(AntlersError.makeSyntaxError(
                            AntlersErrorCodes.LINT_MISSING_REQUIRED_PARAMETER,
                            node,
                            "Missing required parameter: " + parameter.name,
                            ErrorLevel.Error
                        ));
                    }
                });
            }
        }

        return errors;
    }
};

export default PartialParametersHandler;
