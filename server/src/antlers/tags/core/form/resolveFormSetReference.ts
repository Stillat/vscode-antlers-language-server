import { StatamicProject } from '../../../../projects/statamicProject';
import { ISpecialResolverResults, ISymbol } from '../../../types';

export function resolveFormSetReference(context: ISymbol, project: StatamicProject): ISpecialResolverResults {
	if (context.parserInstance != null) {
		const parentFormSet = context.parserInstance.locateParentOfType('form:set');

		if (parentFormSet != null) {
			return {
				context: parentFormSet,
				issues: []
			};
		}
	}

	return {
		context: null,
		issues: []
	};
}
