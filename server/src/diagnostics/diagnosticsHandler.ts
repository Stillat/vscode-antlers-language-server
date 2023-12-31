import { AntlersSettings } from '../antlersSettings.js';
import { AntlersError } from '../runtime/errors/antlersError.js';
import { AntlersNode } from '../runtime/nodes/abstractNode.js';

export interface IDiagnosticsHandler {
    /**
     * Checks a node for any issues.
     *
     * @param {AntlersNode} node The node being analyzed.
     */
    checkNode(node: AntlersNode, settings: AntlersSettings): AntlersError[];
}
