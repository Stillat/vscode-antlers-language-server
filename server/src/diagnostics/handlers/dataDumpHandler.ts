import { AntlersError, ErrorLevel } from '../../runtime/errors/antlersError.js';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes.js';
import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IDiagnosticsHandler } from '../diagnosticsHandler.js';

const DataDumpTags: string[] = [
    'dump', 'dd', 'ddd'
];

const DataDumpHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        const tagName = node.getTagName(),
            errors: AntlersError[] = [];

        if (DataDumpTags.includes(tagName)) {
            errors.push(AntlersError.makeSyntaxError(
                AntlersErrorCodes.LINT_DEBUG_DATA_EXPOSED,
                node,
                tagName + ' exposes data and should be removed after debugging.',
                ErrorLevel.Warning
            ));
        }

        if (node.modifiers.hasModifier('dump')) {
            errors.push(AntlersError.makeSyntaxError(
                AntlersErrorCodes.LINT_DEBUG_DATA_EXPOSED,
                node,
                'dump modifier exposes data and should be removed after debugging.',
                ErrorLevel.Warning
            ));
        }

        return errors;
    }
};

export default DataDumpHandler;
