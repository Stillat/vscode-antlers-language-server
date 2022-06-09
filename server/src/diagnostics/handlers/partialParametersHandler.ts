import { getViewName } from '../../antlers/tags/core/partials/partialUtilities';
import ProjectManager from '../../projects/projectManager';
import { AntlersError, ErrrorLevel } from '../../runtime/errors/antlersError';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes';
import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { IDiagnosticsHandler } from '../diagnosticsHandler';

const PartialParametersHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        const errors: AntlersError[] = [];

        if (node.isTagNode && node.name != null && node.getTagName() == 'partial') {
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
                            ErrrorLevel.Error
                        ));
                    }
                });
            }
        }

        return errors;
    }
};

export default PartialParametersHandler;
