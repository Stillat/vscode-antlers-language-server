import { AntlersError, ErrrorLevel } from '../../runtime/errors/antlersError';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes';
import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { IDiagnosticsHandler } from '../diagnosticsHandler';

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
                ErrrorLevel.Warning
            ));
        }

        if (node.modifiers.hasModifier('dump')) {
            errors.push(AntlersError.makeSyntaxError(
                AntlersErrorCodes.LINT_DEBUG_DATA_EXPOSED,
                node,
                'dump modifier exposes data and should be removed after debugging.',
                ErrrorLevel.Warning
            ));
        }

        return errors;
    }
};

export default DataDumpHandler;
