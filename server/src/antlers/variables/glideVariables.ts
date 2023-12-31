import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IScopeVariable } from '../scope/types.js';

export function makeGlideVariables(node: AntlersNode): IScopeVariable[] {
    return [
        { name: 'width', dataType: 'number', sourceName: '*internal.glide', sourceField: null, introducedBy: node },
        { name: 'height', dataType: 'number', sourceName: '*internal.glide', sourceField: null, introducedBy: node },
        { name: 'url', dataType: 'string', sourceName: '*internal.glide', sourceField: null, introducedBy: node },
    ];
}
