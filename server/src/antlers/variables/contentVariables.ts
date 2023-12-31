import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IScopeVariable } from '../scope/types.js';

const ContentVariableNames: string[] = [
    'edit_url',
    'id',
    'last_modified',
    'permalink',
    'published',
    'slug',
    'template',
    'url'
];

export { ContentVariableNames };

export function makeContentVariables(symbol: AntlersNode): IScopeVariable[] {
    return [
        { name: 'edit_url', dataType: 'string', sourceName: '*internal.entry', sourceField: null, introducedBy: symbol },
        { name: 'id', dataType: 'string', sourceName: '*internal.entry', sourceField: null, introducedBy: symbol },
        { name: 'last_modified', dataType: 'string', sourceName: '*internal.entry', sourceField: null, introducedBy: symbol },
        { name: 'permalink', dataType: 'string', sourceName: '*internal.entry', sourceField: null, introducedBy: symbol },
        { name: 'published', dataType: 'boolean', sourceName: '*internal.entry', sourceField: null, introducedBy: symbol },
        { name: 'slug', dataType: 'string', sourceName: '*internal.entry', sourceField: null, introducedBy: symbol },
        { name: 'template', dataType: 'string', sourceName: '*internal.entry', sourceField: null, introducedBy: symbol },
        { name: 'url', dataType: 'string', sourceName: '*internal.entry', sourceField: null, introducedBy: symbol },
    ];
}
