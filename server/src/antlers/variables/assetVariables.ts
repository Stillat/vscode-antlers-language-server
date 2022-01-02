import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { IScopeVariable } from '../scope/types';

export function makeAssetVariables(symbol: AntlersNode): IScopeVariable[] {
    return [
        { name: 'basename', dataType: 'string', sourceName: '*internal.asset', sourceField: null, introducedBy: symbol },
        { name: 'extension', dataType: 'string', sourceName: '*internal.asset', sourceField: null, introducedBy: symbol },
        { name: 'filename', dataType: 'string', sourceName: '*internal.asset', sourceField: null, introducedBy: symbol },
        { name: 'focus', dataType: 'string', sourceName: '*internal.asset', sourceField: null, introducedBy: symbol },
        { name: 'focus_css', dataType: 'string', sourceName: '*internal.asset', sourceField: null, introducedBy: symbol },
        { name: 'height', dataType: 'number', sourceName: '*internal.asset', sourceField: null, introducedBy: symbol },
        { name: 'is_asset', dataType: 'boolean', sourceName: '*internal.asset', sourceField: null, introducedBy: symbol },
        { name: 'is_image', dataType: 'boolean', sourceName: '*internal.asset', sourceField: null, introducedBy: symbol },
        { name: 'path', dataType: 'string', sourceName: '*internal.asset', sourceField: null, introducedBy: symbol },
        { name: 'size', dataType: 'string', sourceName: '*internal.asset', sourceField: null, introducedBy: symbol },
        { name: 'size_bytes', dataType: 'number', sourceName: '*internal.asset', sourceField: null, introducedBy: symbol },
        { name: 'size_gigabytes', dataType: 'number', sourceName: '*internal.asset', sourceField: null, introducedBy: symbol },
        { name: 'size_kilobytes', dataType: 'number', sourceName: '*internal.asset', sourceField: null, introducedBy: symbol },
        { name: 'size_megabytes', dataType: 'number', sourceName: '*internal.asset', sourceField: null, introducedBy: symbol },
        { name: 'width', dataType: 'number', sourceName: '*internal.asset', sourceField: null, introducedBy: symbol },
    ];
}