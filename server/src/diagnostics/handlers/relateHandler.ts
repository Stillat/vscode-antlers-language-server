import { AntlersError, ErrorLevel } from '../../runtime/errors/antlersError.js';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes.js';
import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IDiagnosticsHandler } from '../diagnosticsHandler.js';

const RelateTagHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        const errors: AntlersError[] = [];

        if (node.isTagNode && node.name != null && node.getTagName() == 'relate') {
            errors.push(AntlersError.makeSyntaxError(
                AntlersErrorCodes.LINT_REMOVE_RELATE_TAG,
                node,
                'The `relate` tag is not necessary here, and can be removed.',
                ErrorLevel.Warning
            ));
        }

        return errors;
    }
};

export default RelateTagHandler;
