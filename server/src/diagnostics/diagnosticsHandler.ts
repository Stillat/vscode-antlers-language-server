import { AntlersSettings } from '../antlersSettings';
import { AntlersError } from '../runtime/errors/antlersError';
import { AntlersNode } from '../runtime/nodes/abstractNode';

export interface IDiagnosticsHandler {
    /**
     * Checks a node for any issues.
     *
     * @param {AntlersNode} node The node being analyzed.
     */
    checkNode(node: AntlersNode, settings: AntlersSettings): AntlersError[];
}
