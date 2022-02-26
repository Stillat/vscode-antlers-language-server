import { AntlersError } from '../../runtime/errors/antlersError';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes';
import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { IDiagnosticsHandler } from '../diagnosticsHandler';

const InterleavedNodeHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        const errors: AntlersError[] = [];

        // Temp disable due to some conditional pairs.
        /* if (node.isClosedBy == null) { return errors; }
        if (node.parent == null) { return errors; }
        if (node.parent instanceof AntlersNode == false) { return errors; }
        
        const nodeParent = node.parent as AntlersNode;
        if (nodeParent.isClosedBy == null) { return errors; }

        const runtimeName = node.runtimeName();

        if (runtimeName == 'if' || runtimeName == 'if:index' || runtimeName == 'else' || runtimeName == 'else:index' ||
            runtimeName == 'elseif' || runtimeName == 'elseif:index' ||
            runtimeName == 'elseunless' || runtimeName == 'elseunless:index') { return errors; }

        if (nodeParent.isClosedBy.startPosition?.isBefore(node.isClosedBy.endPosition)) {
            errors.push(AntlersError.makeSyntaxError(
                AntlersErrorCodes.LINT_INTERLEAVED_TAG_PAIRS,
                node,
                'Closing tag cannot appear after parent closing tag.'
            ));
            errors.push(AntlersError.makeSyntaxError(
                AntlersErrorCodes.LINT_INTERLEAVED_TAG_PAIRS,
                node.isClosedBy,
                'Closing tag cannot appear after parent closing tag.'
            ));
        } */

        return errors;
    }
};

export default InterleavedNodeHandler;
