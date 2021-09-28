import { IBlueprintField, variablesToBlueprintFields } from '../../../../projects/blueprints';
import { Scope } from '../../../scope/engine';
import { getParameter, ISymbol } from '../../../types';
import { makeRoutableVariables } from '../../../variables/routeableVariables';

export function augmentNavScope(symbol: ISymbol, scope: Scope): Scope {
	scope.addVariables([
		{ name: 'is_published', dataType: 'boolean', sourceField: null, sourceName: '*internal.nav', introducedBy: symbol },
		{ name: 'is_page', dataType: 'boolean', sourceField: null, sourceName: '*internal.nav', introducedBy: symbol },
		{ name: 'is_entry', dataType: 'boolean', sourceField: null, sourceName: '*internal.nav', introducedBy: symbol },
		{ name: 'has_entries', dataType: 'boolean', sourceField: null, sourceName: '*internal.nav', introducedBy: symbol },
		{ name: 'is_parent', dataType: 'boolean', sourceField: null, sourceName: '*internal.nav', introducedBy: symbol },
		{ name: 'is_current', dataType: 'boolean', sourceField: null, sourceName: '*internal.nav', introducedBy: symbol },
		{ name: 'is_external', dataType: 'boolean', sourceField: null, sourceName: '*internal.nav', introducedBy: symbol },
		{ name: 'depth', dataType: 'number', sourceField: null, sourceName: '*internal.nav', introducedBy: symbol },
		{ name: 'children', dataType: 'array', sourceField: null, sourceName: '*internal.nav', introducedBy: symbol },
		{ name: 'first', dataType: 'boolean', sourceField: null, sourceName: '*internal.nav', introducedBy: symbol },
		{ name: 'last', dataType: 'boolean', sourceField: null, sourceName: '*internal.nav', introducedBy: symbol },
		{ name: 'count', dataType: 'integer', sourceField: null, sourceName: '*internal.nav', introducedBy: symbol },
		{ name: 'index', dataType: 'integer', sourceField: null, sourceName: '*internal.nav', introducedBy: symbol },
	]);

	// Check if in "nav" or "collection" mode and populate the values accordingly.
	const collectionNames = scope.statamicProject.getUniqueCollectionNames(),
		currentHandles: string[] = [];
	let isCollection = false;

	if (symbol.methodName != null && symbol.methodName.startsWith('collection:')) {
		isCollection = true;

		const handleName = symbol.methodName.split(':').pop() as string;

		currentHandles.push(handleName);
	} else if (symbol.methodName != null) {
		if (symbol.methodName == 'pages') {
			isCollection = true;
			currentHandles.push('pages');
		} else {
			isCollection = false;
			currentHandles.push(symbol.methodName);
		}
	} else if (symbol.methodName == null) {
		const handleParam = getParameter('handle', symbol);

		if (handleParam != null) {
			if (collectionNames.includes(handleParam.value)) {
				isCollection = true;
			} else {
				isCollection = false;
			}

			currentHandles.push(handleParam.value);
		}
	}

	if (isCollection) {
		const blueprintFields: IBlueprintField[] = scope.statamicProject.getBlueprintFields(currentHandles);

		scope.addBlueprintFields(symbol, blueprintFields);
		scope.expandScopedAliasScope(symbol, 'page', 'page', blueprintFields);
	} else {
		const blueprintFields: IBlueprintField[] = variablesToBlueprintFields(makeRoutableVariables(symbol));

		scope.addBlueprintFields(symbol, blueprintFields);
		scope.expandScopedAliasScope(symbol, 'page', 'page', blueprintFields);
	}

	return scope;
}
