import { AntlersNode } from '../../../runtime/nodes/abstractNode';
import { IScopeVariable } from '../../scope/types';

export function makeStandardFormVariables(node: AntlersNode): IScopeVariable[] {
    return [
        { name: 'success', dataType: 'string', sourceField: null, sourceName: '*internal.forms', introducedBy: node },
        { name: 'submission_created', dataType: 'boolean', sourceField: null, sourceName: '*internal.forms', introducedBy: node },
    ];
}
