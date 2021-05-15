import { v4 as uuidv4 } from 'uuid';
import { IEnvironmentHelper, IVariableHelper, parseIdeHelper } from '../../idehelper/parser';
import { IBlueprintField } from '../../projects/blueprints';
import { getFieldRuntimeType } from '../../projects/blueprintTypes';
import { StatamicProject } from '../../projects/statamicProject';
import { ReferenceManager } from '../../references/referenceManager';
import { FieldtypeManager, IFieldtypeInjection } from '../fieldtypes/fieldtypeManager';
import { IAntlersTag, TagManager } from '../tagManager';
import { getParameter, ISymbol } from '../types';
import { makeArrayVariables } from '../variables/arrayVariables';
import { makeContentVariables } from '../variables/contentVariables';
import { makeLoopVariables } from '../variables/loopVariables';
import { getSiteData, getSystemVariables } from '../variables/systemVariables';
import { ConditionScopeInjections } from './conditionScopeInjections';
import { checkSymbolForPagination } from './factories/paginationFactory';
import { InjectionManager } from './injections';

const IgnoreArrayContextualData: string[] = ['collection'];
const ChecksForFieldReferences: string[] = ['if', 'elseif', 'unless', 'elseunless'];

export interface IScopeVariable {
	/**
	 * The name of the variable.
	 */
	name: string,
	/**
	 * The inferred runtime data type of the variable reference.
	 */
	dataType: string,
	/**
	 * The blueprint field underlying the variable, if any.
	 */
	sourceField: IBlueprintField | null,
	/**
	 * Provides a reference to where/how the variable was introduced.
	 * 
	 * Internal providers will be prefixed with '*internal'.
	 */
	sourceName: string,
	/**
	 * The symbol that introduced the variable.
	 * 
	 * An example would be the collection tag introducing a 'posts' array.
	 */
	introducedBy: ISymbol | null
}

interface IPristineSnapshot {
	introducedScope: string,
	parentCopy: Scope,
	introducedFields: IBlueprintField[]
}

export function blueprintFieldToScopeVariable(symbol: ISymbol, field: IBlueprintField): IScopeVariable {
	return {
		sourceName: field.blueprintName,
		dataType: field.type,
		name: field.name,
		sourceField: field,
		introducedBy: symbol
	};
}

export function blueprintFieldsToScopeVariables(symbol: ISymbol, blueprintFields: IBlueprintField[]): IScopeVariable[] {
	const variables: IScopeVariable[] = [];

	for (let i = 0; i < blueprintFields.length; i++) {
		const field = blueprintFields[i];

		variables.push({
			sourceName: field.blueprintName,
			dataType: field.type,
			name: field.name,
			sourceField: field,
			introducedBy: symbol
		});
	}

	return variables;
}

export class Scope {
	static generationCounter = 0;

	public generation = 0;
	public statamicProject: StatamicProject;
	public id = '';
	public name = '';
	public values: Map<string, IScopeVariable> = new Map();
	public lists: Map<string, Scope> = new Map();
	public pristine: Map<string, IPristineSnapshot> = new Map();
	public parentScope: Scope | null = null;

	constructor(statamicProject: StatamicProject) {
		this.statamicProject = statamicProject;
		Scope.generationCounter += 1;
		this.generation = Scope.generationCounter;
		this.id = uuidv4();
	}

	makeNew(): Scope {
		return new Scope(this.statamicProject);
	}

	ancestor(): Scope {
		if (this.parentScope != null) {
			return this.parentScope;
		}

		return this;
	}

	canShiftScope(path: string): boolean {
		if (this.pristine.has(path)) {
			return true;
		}

		return false;
	}

	shiftScope(symbol: ISymbol, path: string, newScopeName: string): Scope {
		if (this.pristine.has(path)) {
			const pristineCopy = this.pristine.get(path) as IPristineSnapshot,
				newScope = pristineCopy.parentCopy.copy();

			newScope.introduceAliasScope(symbol, newScopeName, pristineCopy.introducedFields);

			return newScope;
		}

		return this;
	}

	containsPath(path: string): boolean {
		if (path.includes(':')) {
			const parts: string[] = path.split(':'),
				thisPath = parts.shift(),
				nextPath = parts.join(':');

			if (typeof thisPath === 'undefined') {
				return false;
			}

			const nextScope = this.lists.get(thisPath) as Scope;

			if (typeof nextScope === 'undefined') {
				return false;
			}

			return nextScope.containsPath(nextPath);
		}

		if (this.lists.has(path)) {
			return true;
		}

		return false;
	}

	findReference(path: string): IScopeVariable | null {
		if (path.includes(':')) {
			const parts = path.split(':'),
				itemToFind = parts.pop() as string,
				newPath = parts.join(':'),
				adjustScope = this.findNestedScope(newPath);

			if (adjustScope != null) {
				return adjustScope.findReference(itemToFind);
			}
		}

		if (this.values.has(path)) {
			return this.values.get(path) as IScopeVariable;
		}

		return null;
	}

	containsReference(path: string): boolean {
		const pathRef = this.findReference(path);

		if (pathRef == null) {
			return false;
		}

		return true;
	}

	findNestedScope(path: string): Scope | null {
		if (path.includes(':')) {
			const parts: string[] = path.split(':'),
				thisPath = parts.shift(),
				nextPath = parts.join(':');

			if (typeof thisPath === 'undefined') {
				return null;
			}

			const nextScope = this.lists.get(thisPath) as Scope;

			if (typeof nextScope === 'undefined') {
				return null;
			}

			return nextScope.findNestedScope(nextPath);
		}

		if (this.lists.has(path)) {
			return this.lists.get(path) as Scope;
		}

		if (this.parentScope != null && this.parentScope != this && this.parentScope.hasList(path)) {
			return this.parentScope.lists.get(path) as Scope;
		}

		return null;
	}

	/**
	 * Finds a scope list, and removes it from the current scope.
	 * @param name The list name.
	 * @returns 
	 */
	liftList(name: string): Scope | null {

		if (this.lists.has(name)) {
			const list = this.lists.get(name);

			if (typeof list === 'undefined' || list === null) {
				return null;
			}

			this.lists.delete(name);

			return list;
		}

		return null;
	}

	hasPristineReference(name: string): boolean {
		if (this.pristine.has(name)) {
			return true;
		}

		return false;
	}

	hasListInHistory(name: string): boolean {
		if (this.hasList(name)) {
			return true;
		}

		if (this.parentScope != null) {
			// The root scope references itself.
			if (this.name == '*root*') {
				return false;
			}

			return this.parentScope.hasList(name);
		}

		return false;
	}

	hasList(name: string): boolean {
		if (this.lists.has(name)) {
			const list = this.lists.get(name);

			if (typeof list === 'undefined' || list === null) {
				return false;
			}

			return true;
		}

		return false;
	}

	bringListIntoMainScope(path: string): Scope {
		if (path.includes(':')) {
			const parts: string[] = path.split(':'),
				thisPath = parts.shift(),
				nextPath = parts.join(':');

			if (typeof thisPath === 'undefined') {
				return this;
			}

			const nextScope = this.lists.get(thisPath) as Scope;

			if (typeof nextScope === 'undefined') {
				return this;
			}

			return nextScope.bringListIntoMainScope(nextPath);
		}

		const nestedScope = this.lists.get(path) as Scope;
		this.lists.delete(path);

		return this.mergeScope(nestedScope);
	}

	getListNames(): string[] {
		const listNames: string[] = [];

		this.lists.forEach((value: Scope, name: string) => {
			listNames.push(name);
		});

		return listNames;
	}

	hasValue(name: string): boolean {
		return this.values.has(name);
	}

	findReferenceNotIntroducedBy(name: string, introducedBy: ISymbol): IScopeVariable | null {
		if (this.hasValue(name)) {
			const varRef = this.values.get(name) as IScopeVariable;

			if (varRef.introducedBy != null && varRef.introducedBy != introducedBy) {
				return varRef;
			}
		}

		if (this.parentScope != null && this.parentScope != this) {
			return this.parentScope.findReferenceNotIntroducedBy(name, introducedBy);
		}

		return null;
	}

	removeThroughIntroduction(name: string, introducedBy: ISymbol) {
		this.values.delete(name);

		// If this removal operation will re-expose a previously
		// hidden variable with the same name, let's locate
		// the last time the variable was introduced by
		// any other symbol that is not the current.
		if (this.parentScope != null) {
			const refInSCope = this.findReferenceNotIntroducedBy(name, introducedBy);

			if (refInSCope != null) {
				this.addVariable(refInSCope);
			}
		}
	}

	wasIntroducedBySymbol(name: string, checkSymbol: ISymbol): boolean {
		if (this.values.has(name) == false) {
			return false;
		}

		const value = this.values.get(name) as IScopeVariable;

		if (value.introducedBy != null) {
			return value.introducedBy == checkSymbol;
		}

		return false;
	}

	referencesArray(name: string): boolean {
		if (this.values.has(name) == false) {
			return false;
		}

		const ref = this.values.get(name) as IScopeVariable;

		if (ref.dataType == 'array') {
			return true;
		}

		return false;
	}

	addScopeList(listName: string, scope: Scope): Scope {
		this.lists.set(listName, scope);

		return this;
	}

	mergeAndList(listName: string, data: IScopeVariable[]): Scope {
		const newListScope = new Scope(this.statamicProject);
		newListScope.values = valuesToDataMap(data);

		this.lists.set(listName, newListScope);
		this.mergeVariableScope(data);

		return this;
	}

	mergeScope(scope: Scope): Scope {
		if (scope == this || scope == null) {
			return this;
		}

		scope.values.forEach((value: IScopeVariable, name: string) => {
			this.values.set(name, value);
		});

		scope.lists.forEach((value: Scope, name: string) => {
			this.lists.set(name, value);
		});

		return this;
	}

	mergeVariableScope(data: IScopeVariable[]): Scope {
		for (let i = 0; i < data.length; i++) {
			this.values.set(data[i].name, data[i]);
		}

		return this;
	}

	addVariable(variable: IScopeVariable) {
		this.values.set(variable.name, variable);
	}

	addVariables(variables: IScopeVariable[]) {
		for (let i = 0; i < variables.length; i++) {
			this.addVariable(variables[i]);
		}
	}

	addVariableArray(name: string, variables: IScopeVariable[]) {
		if (this.values.has(name)) {
			this.values.delete(name);
		}

		const array = new Scope(this.statamicProject);
		array.addVariables(variables);

		this.addScopeList(name, array);
	}

	injectAssetContainer(symbol: ISymbol, container: string) {
		this.addBlueprintFields(symbol, this.statamicProject.getAssetBlueprintFields(container));
	}

	injectUserFields(symbol: ISymbol) {
		this.addBlueprintFields(symbol, this.statamicProject.getUserFields());
	}

	addBlueprintField(symbol: ISymbol, field: IBlueprintField) {
		this.addVariable({
			dataType: field.type,
			name: field.name,
			sourceField: field,
			sourceName: field.blueprintName,
			introducedBy: symbol
		});
	}

	introduceScopedAliasScope(symbol: ISymbol, scopeName: string, aliasName: string, fields: IBlueprintField[]): Scope {
		this.pristine.set(aliasName, {
			introducedFields: fields,
			introducedScope: aliasName,
			parentCopy: this.copy()
		});

		const newAliasScope = new Scope(this.statamicProject),
			fieldScope = new Scope(this.statamicProject);

		fieldScope.addBlueprintFields(symbol, fields);

		newAliasScope.name = aliasName;
		newAliasScope.addScopeList(scopeName, fieldScope);

		this.addScopeList(aliasName, newAliasScope);

		return newAliasScope;
	}

	expandScopedAliasScope(symbol: ISymbol, scopeName: string, aliasName: string, fields: IBlueprintField[]) {
		if (this.lists.has(aliasName) == false) {
			this.introduceScopedAliasScope(symbol, scopeName, aliasName, fields);
		} else {
			const listRef = this.lists.get(aliasName) as Scope;

			listRef.addBlueprintFields(symbol, fields);
		}
	}

	introduceAliasScope(symbol: ISymbol, aliasName: string, fields: IBlueprintField[]) {
		this.pristine.set(aliasName, {
			introducedFields: fields,
			introducedScope: aliasName,
			parentCopy: this.copy()
		});

		const newAliasScope = new Scope(this.statamicProject);
		newAliasScope.addBlueprintFields(symbol, fields);
		newAliasScope.name = aliasName;
		this.addScopeList(aliasName, newAliasScope);
	}

	introduceDynamicScopeList(symbol: ISymbol, listName: string, fields: IBlueprintField[]) {
		this.pristine.set(listName, {
			introducedFields: fields,
			introducedScope: listName,
			parentCopy: this.copy()
		});

		const newListScope = new Scope(this.statamicProject);

		newListScope.name = listName;
		newListScope.addBlueprintFields(symbol, fields);

		this.addScopeList(listName, newListScope);
	}

	addBlueprintFields(symbol: ISymbol, fields: IBlueprintField[]) {
		for (let i = 0; i < fields.length; i++) {
			this.addBlueprintField(symbol, fields[i]);
		}
	}

	injectBlueprint(symbol: ISymbol, handle: string) {
		const blueprintDetails = this.statamicProject.getBlueprintDetails(handle);

		if (blueprintDetails.length > 0) {
			this.addBlueprintFields(symbol, blueprintDetails);
		}
	}

	copy(): Scope {
		const newScope = new Scope(this.statamicProject);
		newScope.pristine = new Map(this.pristine);
		newScope.values = new Map(this.values);
		newScope.lists = new Map(this.lists);
		newScope.parentScope = this;

		return newScope;
	}
}

function valuesToDataMap(variables: IScopeVariable[]): Map<string, IScopeVariable> {
	const mapToReturn: Map<string, IScopeVariable> = new Map();

	for (let i = 0; i < variables.length; i++) {
		mapToReturn.set(variables[i].name, variables[i]);
	}

	return mapToReturn;
}

export class ScopeEngine {

	private statamicProject: StatamicProject;
	private pageVars: IScopeVariable[] = [];
	private viewDataVars: IScopeVariable[] = [];
	private documentUri = '';
	private lastSymbolId = '';
	private ideHelperMap: Map<string, IVariableHelper> = new Map();

	constructor(project: StatamicProject, documentUri: string) {
		this.statamicProject = project;
		this.makePageScope();
		this.makeViewDataScope();
		this.documentUri = documentUri;
	}

	private makeViewDataScope() {
		const newViewDataVariables: IScopeVariable[] = [],
			projectView = this.statamicProject.findView(this.documentUri);

		if (projectView != null && projectView.isAntlers) {
			if (projectView.viewDataVariables.length > 0) {
				for (let i = 0; i < projectView.viewDataVariables.length; i++) {
					newViewDataVariables.push({
						dataType: 'string',
						name: projectView.viewDataVariables[i],
						sourceField: null,
						sourceName: 'view',
						introducedBy: null
					});
				}
			}
		}

		this.viewDataVars = newViewDataVariables;
	}

	private makePageScope() {
		const newPageVariables: IScopeVariable[] = [];

		if (this.statamicProject.fields.has('pages')) {
			const pageFields = this.statamicProject.fields.get('pages') as IBlueprintField[];

			for (let i = 0; i < pageFields.length; i++) {
				const thisField = pageFields[i];

				newPageVariables.push({
					name: thisField.name,
					dataType: thisField.type,
					sourceField: thisField,
					sourceName: thisField.blueprintName,
					introducedBy: null
				});
			}
		}

		this.pageVars = newPageVariables;
	}

	analyzeScope(symbols: ISymbol[]) {
		const rootScope = new Scope(this.statamicProject);
		rootScope.name = '*root*';
		rootScope.parentScope = rootScope;

		rootScope.addScopeList('site', getSiteData(this.statamicProject));
		rootScope.addScopeList('sites', getSiteData(this.statamicProject));
		rootScope.addVariables(getSystemVariables());

		if (ReferenceManager.pageScopeDisabled(this.documentUri)) {
			rootScope.mergeAndList('view', this.viewDataVars);
		} else {
			rootScope.mergeAndList('page', this.pageVars)
				.mergeAndList('view', this.viewDataVars);
		}

		let ideHelper: IEnvironmentHelper | null = null;

		if (symbols.length > 0 && symbols[0].isComment) {
			ideHelper = parseIdeHelper(this.documentUri, symbols[0]);
		}

		for (let i = 0; i < symbols.length; i++) {
			if (symbols[i].isComment) {
				const varIdeHelper = parseIdeHelper(this.documentUri, symbols[i]);

				if (varIdeHelper.variableHelper != null) {
					this.ideHelperMap.set(symbols[i].id, varIdeHelper.variableHelper);
				}
			}
		}

		let documentCollectionNames = this.statamicProject.getCollectionNamesForView(encodeURIComponent(this.documentUri));

		if (ideHelper != null) {
			if (ideHelper.collectionInjections.length > 0) {
				documentCollectionNames = documentCollectionNames.concat(ideHelper.collectionInjections);
			}

			if (ideHelper.blueprints.length > 0) {
				documentCollectionNames = documentCollectionNames.concat(ideHelper.blueprints);
			}

			if (ideHelper.variableHelper != null) {
				if (ideHelper.variableHelper.variableName == '@page') {
					const fieldRef = this.statamicProject.getBlueprintField(ideHelper.variableHelper.collectionName, ideHelper.variableHelper.fieldHandle);

					if (fieldRef != null) {
						if (ideHelper.variableHelper.setHandle.length > 0) {
							if (fieldRef.sets != null) {
								for (let i = 0; i < fieldRef.sets.length; i++) {
									if (fieldRef.sets[i].handle == ideHelper.variableHelper.setHandle) {
										rootScope.addVariables(blueprintFieldsToScopeVariables(symbols[0], fieldRef.sets[i].fields));
										break;
									}
								}
							}
						} else {
							rootScope.addBlueprintField(symbols[0], fieldRef);
						}
					}
				}
			}
		}

		if (documentCollectionNames.length > 0) {
			for (let i = 0; i < documentCollectionNames.length; i++) {
				rootScope.injectBlueprint(symbols[0], documentCollectionNames[i]);
			}

			rootScope.addVariables(makeContentVariables(symbols[0]));
		}

		if (InjectionManager.hasAvailableInjections(this.documentUri)) {
			rootScope.mergeScope(InjectionManager.getScopeInjection(this.documentUri, this.statamicProject));
		}

		const currentScopeParts: string[] = [],
			popScopeIds: string[] = [],
			resolvedPaths: string[] = [],
			activeScopes: Scope[] = [];

		activeScopes.push(rootScope);

		for (let i = 0; i < symbols.length; i++) {
			const currentSymbol = symbols[i];

			if (this.lastSymbolId.length > 0 && popScopeIds.includes(currentSymbol.id)) {
				currentScopeParts.pop();
				activeScopes.pop();

				if (activeScopes.length == 0) {
					activeScopes.push(rootScope);
				}
			}

			let currentScope = activeScopes[activeScopes.length - 1];

			// If there are any interpolations, we will give them the current scope before
			// tags have a chance to introduce any new variables into the active scope.
			if (currentSymbol.parameterCache != null && currentSymbol.parameterCache.length > 0) {
				for (let j = 0; j < currentSymbol.parameterCache.length; j++) {
					if (currentSymbol.parameterCache[j].interpolations.length > 0) {
						for (let k = 0; k < currentSymbol.parameterCache[j].interpolations.length; k++) {
							if (currentSymbol.parameterCache[j].interpolations[k].symbols.length > 0) {
								for (let l = 0; l < currentSymbol.parameterCache[j].interpolations[k].symbols.length; l++) {
									currentSymbol.parameterCache[j].interpolations[k].symbols[l].currentScope = currentScope;
								}
							}
						}
					}
				}
			}

			// Attempt to resolve any source types before scope adjustments take place.
			if (TagManager.isKnownTag(currentSymbol.name) == false) {
				currentSymbol.scopeVariable = currentScope.findReference(currentSymbol.tagPart);

				if (i > 0) {
					const lastSymbol = symbols[i - 1];

					if (lastSymbol.isComment && this.ideHelperMap.has(lastSymbol.id)) {
						const ideHelper = this.ideHelperMap.get(lastSymbol.id) as IVariableHelper;

						if (ideHelper.variableName == currentSymbol.name) {
							const collectionFieldReference = this.statamicProject.getBlueprintField(ideHelper.collectionName, ideHelper.fieldHandle);

							if (collectionFieldReference != null) {
								currentSymbol.scopeVariable = blueprintFieldToScopeVariable(currentSymbol, collectionFieldReference);
							}
						}
					}
				}

				if (currentSymbol.scopeVariable == null) {
					if (currentScope.hasList(currentSymbol.tagPart.trim()) || currentSymbol.currentScope?.hasListInHistory(currentSymbol.tagPart.trim())) {
						currentSymbol.sourceType = 'array';
					}
				} else {
					currentSymbol.sourceType = getFieldRuntimeType(currentSymbol.scopeVariable.dataType);
					if (currentSymbol.scopeVariable.sourceField != null) {
						if (FieldtypeManager.hasFieldtype(currentSymbol.scopeVariable.sourceField.type)) {
							const fieldTypeRef = FieldtypeManager.fieldTypes.get(currentSymbol.scopeVariable.sourceField.type) as IFieldtypeInjection;

							fieldTypeRef.augmentScope(currentSymbol, currentScope);
						}
					}
				}
			}

			if (currentSymbol.parameterCache != null) {
				checkSymbolForPagination(currentSymbol, currentScope);
			}


			if (currentSymbol.modifiers != null && currentSymbol.modifiers.hasModifiers) {
				currentSymbol.manifestType = currentSymbol.modifiers.manifestType;
			} else {
				currentSymbol.manifestType = currentSymbol.sourceType;
			}

			if (currentSymbol.isClosedBy != null) {
				// Let's create a new scope.
				currentScopeParts.push(currentSymbol.id);
				popScopeIds.push(currentSymbol.isClosedBy.id);
				currentScope = currentScope.copy();
				activeScopes.push(currentScope);
			}

			// This assumes people close their scope tags.
			if (currentSymbol.name == 'scope' && currentSymbol.methodName != null) {
				// Take a snapshot of the current scope.
				const snapshot = activeScopes[activeScopes.length - 2].copy();
				currentScope.addScopeList(currentSymbol.methodName, snapshot);
			}

			if (currentScope.containsPath(currentSymbol.tagPart)) {
				currentScopeParts.push(currentSymbol.id);
				// TODO: Betterfy this.
				if (currentSymbol.isClosedBy != null) {
					popScopeIds.push(currentSymbol.isClosedBy.id);
				}

				currentScope = currentScope.copy().bringListIntoMainScope(currentSymbol.tagPart);
				activeScopes.push(currentScope);
				currentSymbol.currentScope = currentScope;

			} else {
				currentSymbol.currentScope = currentScope;
			}

			// If we see a "scope" on already scoped values
			// rewind to a pristine before value scope and rewrite
			if (currentSymbol.name != 'cache') {
				const scopeParam = getParameter('scope', currentSymbol);

				if (scopeParam != null && currentScope.canShiftScope(currentSymbol.tagPart)) {
					currentScope = currentScope.shiftScope(currentSymbol, currentSymbol.tagPart, scopeParam.value);
					currentSymbol.currentScope = currentScope;
					activeScopes.pop();
					activeScopes.push(currentScope);
				}
			}

			if (TagManager.isKnownTag(currentSymbol.runtimeName)) {
				const tagRef = TagManager.findTag(currentSymbol.runtimeName) as IAntlersTag;

				if (typeof tagRef !== 'undefined' && tagRef.augmentScope != null) {
					// Augment the scope.
					tagRef.augmentScope(currentSymbol, currentScope);
				}
			}

			if (currentSymbol.sourceType == 'array') {
				const chunkParam = getParameter('chunk', currentSymbol);
				let injectContextualArrayData = true;

				if (currentSymbol.belongsTo != null) {
					if (IgnoreArrayContextualData.includes(currentSymbol.belongsTo.name)) {
						injectContextualArrayData = false;
					}
				}

				if (typeof chunkParam !== 'undefined' && chunkParam !== null) {
					if (currentSymbol.currentScope.parentScope != null && (currentSymbol.currentScope.parentScope.hasList(currentSymbol.tagPart) ||
						currentScope.referencesArray(currentSymbol.tagPart))) {
						const adjustedScope = currentSymbol.currentScope.parentScope.copy();
						let thisArrayValues = adjustedScope.liftList(currentSymbol.tagPart) as Scope;

						if (thisArrayValues == null && currentScope.referencesArray(currentSymbol.tagPart)) {
							thisArrayValues = new Scope(currentScope.statamicProject);

							if (injectContextualArrayData) {
								const symbolArrayVariables = makeArrayVariables(currentSymbol);

								for (let i = 0; i < symbolArrayVariables.length; i++) {
									const checkVar = symbolArrayVariables[i];

									if (adjustedScope.wasIntroducedBySymbol(checkVar.name, currentSymbol)) {
										adjustedScope.removeThroughIntroduction(checkVar.name, currentSymbol);
									}
								}

								thisArrayValues.addVariables(symbolArrayVariables);
							}
						} else {
							if (injectContextualArrayData) {
								adjustedScope.addVariables(makeArrayVariables(currentSymbol));
							}
						}

						adjustedScope.addScopeList('chunk', thisArrayValues);

						currentScope = adjustedScope;
						activeScopes.pop();
						activeScopes.push(currentScope);
						currentSymbol.currentScope = adjustedScope;
					} else {
						const scopeParam = getParameter('scope', currentSymbol);

						if (typeof scopeParam !== 'undefined' && scopeParam !== null) {
							if (currentSymbol.currentScope != null && currentSymbol.currentScope.hasList(scopeParam.value) && currentSymbol.scopeName != null) {
								const adjustedScope = currentSymbol.currentScope.copy(),
									injectScope = adjustedScope.ancestor().copy(),
									thisArrayValues = adjustedScope.liftList(currentSymbol.scopeName) as Scope;

								if (injectContextualArrayData) {
									adjustedScope.addVariables(makeArrayVariables(currentSymbol));
								}

								// Throw away the existing list here.
								injectScope.liftList(currentSymbol.scopeName);
								adjustedScope.addScopeList(currentSymbol.scopeName, thisArrayValues);
								injectScope.addScopeList('chunk', adjustedScope);

								currentScope = injectScope;
								activeScopes.pop();
								activeScopes.push(currentScope);
								currentSymbol.currentScope = injectScope;
							}
						}
					}
				} else {
					if (currentSymbol.scopeVariable != null && currentSymbol.scopeVariable.sourceField == null) {
						if (injectContextualArrayData) {
							currentScope.addVariables(makeArrayVariables(currentSymbol));
							currentScope.addVariables(makeLoopVariables(currentSymbol));
						}
					}
				}
			}

			if (ChecksForFieldReferences.includes(currentSymbol.name)) {
				const analysisResults = ConditionScopeInjections.analyze(currentSymbol, symbols);

				if (analysisResults.length > 0) {
					currentScope = currentScope.copy();
					currentScope.addBlueprintFields(currentSymbol, analysisResults);

					if (currentSymbol.isClosedBy != null) {
						currentScopeParts.push(currentSymbol.id);
						popScopeIds.push(currentSymbol.isClosedBy.id);
						activeScopes.push(currentScope);
					}
				}
			}

			if (popScopeIds.includes(currentSymbol.id)) {
				if (currentSymbol.belongsTo != null) {
					currentSymbol.currentScope = currentSymbol.belongsTo.currentScope;
				}
			}

			this.lastSymbolId = currentSymbol.id;

			const scopePath = currentScopeParts.join('/');
			resolvedPaths.push(scopePath);
		}
	}

}
