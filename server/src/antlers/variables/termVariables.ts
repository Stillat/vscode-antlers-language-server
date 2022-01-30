import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { IScopeVariable } from '../scope/types';
import { makeContentVariables } from './contentVariables';

export function makeTermVariables(symbol: AntlersNode): IScopeVariable[] {
    return makeContentVariables(symbol).concat([
        { name: 'entries_count', dataType: 'number', sourceName: '*internal.term', sourceField: null, introducedBy: symbol },
        { name: 'is_term', dataType: 'boolean', sourceName: '*internal.term', sourceField: null, introducedBy: symbol },
        { name: 'taxonomy', dataType: 'string', sourceName: '*internal.term', sourceField: null, introducedBy: symbol },

    ]);
}
