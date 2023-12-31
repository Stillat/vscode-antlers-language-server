import { IProjectDetailsProvider } from '../../../../projects/projectDetailsProvider.js';
import { AntlersNode } from '../../../../runtime/nodes/abstractNode.js';
import { ISpecialResolverResults } from '../../../types.js';

export function resolveFormSetReference(context: AntlersNode, project: IProjectDetailsProvider): ISpecialResolverResults {
    const parentFormSet = context.structure.findParentWithName('form:set');

    if (parentFormSet != null) {
        return {
            context: parentFormSet,
            issues: []
        };
    }

    return {
        context: null,
        issues: []
    };
}
