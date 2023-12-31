import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { IScopeVariable } from '../../scope/types.js';

export function makeFieldsVariables(node: AntlersNode): IScopeVariable[] {
    return [
        { name: 'handle', dataType: 'string', sourceName: '*internal.forms.fields', sourceField: null, introducedBy: node },
        { name: 'display', dataType: 'string', sourceName: '*internal.forms.fields', sourceField: null, introducedBy: node },
        { name: 'type', dataType: 'string', sourceName: '*internal.forms.fields', sourceField: null, introducedBy: node },
        { name: 'field', dataType: 'string', sourceName: '*internal.forms.fields', sourceField: null, introducedBy: node },
        { name: 'error', dataType: 'string', sourceName: '*internal.forms.fields', sourceField: null, introducedBy: node },
        { name: 'instructions', dataType: 'string', sourceName: '*internal.forms.fields', sourceField: null, introducedBy: node },
        { name: 'old', dataType: 'string', sourceName: '*internal.forms.fields', sourceField: null, introducedBy: node },
    ];
}
