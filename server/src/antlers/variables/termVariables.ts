import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IScopeVariable } from '../scope/types.js';
import { makeContentVariables } from './contentVariables.js';

export function makeTermVariables(symbol: AntlersNode): IScopeVariable[] {
    return makeContentVariables(symbol).concat([
        { name: 'entries_count', dataType: 'number', sourceName: '*internal.term', sourceField: null, introducedBy: symbol },
        { name: 'is_term', dataType: 'boolean', sourceName: '*internal.term', sourceField: null, introducedBy: symbol },
        { name: 'taxonomy', dataType: 'string', sourceName: '*internal.term', sourceField: null, introducedBy: symbol },

    ]);
}
