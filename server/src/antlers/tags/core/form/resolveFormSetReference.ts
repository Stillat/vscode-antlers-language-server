import { IProjectDetailsProvider } from '../../../../projects/projectDetailsProvider';
import { AntlersNode } from '../../../../runtime/nodes/abstractNode';
import { ISpecialResolverResults } from '../../../types';

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
