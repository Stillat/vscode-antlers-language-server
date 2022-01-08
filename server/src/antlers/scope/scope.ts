import { IBlueprintField } from '../../projects/blueprints/fields';
import { IProjectDetailsProvider } from '../../projects/projectDetailsProvider';
import { v4 as uuidv4 } from 'uuid';
import { IPristineSnapshot, IScopeVariable } from './types';
import { valuesToDataMap } from './scopeUtilities';
import { AntlersNode } from '../../runtime/nodes/abstractNode';

export class Scope {
    static generationCounter = 0;

    public generation = 0;
    public statamicProject: IProjectDetailsProvider;
    public id = '';
    public name = '';
    public values: Map<string, IScopeVariable> = new Map();
    public lists: Map<string, Scope> = new Map();
    public pristine: Map<string, IPristineSnapshot> = new Map();
    public parentScope: Scope | null = null;

    constructor(statamicProject: IProjectDetailsProvider) {
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

    shiftScope(symbol: AntlersNode, path: string, newScopeName: string): Scope {
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

    findReferenceWithField(path: string): IScopeVariable | null {
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
            const varRef = this.values.get(path) as IScopeVariable;

            if (varRef.sourceField == null) {
                if (varRef.introducedBy != null && varRef.introducedBy.currentScope != null) {
                    return varRef.introducedBy.currentScope.findReferenceWithField(varRef.introducedBy.getTagName());
                }

                if (this.parentScope != null && this.parentScope != this) {
                    return this.parentScope.findReferenceWithField(path);
                }
            }

            return varRef;
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

	getVariableNames(): string[] {
		const variableNames:string[] = [];

		this.values.forEach((variable) => {
			variableNames.push(variable.name);
		});

		return variableNames;
	}

    getList(name: string): Scope | null {
        if (this.lists.has(name)) {
            return this.lists.get(name) as Scope;
        }

        if (this.parentScope != null && this.parentScope != this) {
            return this.parentScope.getList(name);
        }

        return null;
    }

    hasValue(name: string): boolean {
        return this.values.has(name);
    }

	findAncestorWithList(name: string): Scope | null {
		if (this.hasList(name)) {
			return this;
		}

		if (this.parentScope != null && this.parentScope != this) {
			return this.parentScope.findAncestorWithList(name);
		}
	
		return null;
	}

    findReferenceNotIntroducedBy(name: string, introducedBy: AntlersNode): IScopeVariable | null {
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

    removeThroughIntroduction(name: string, introducedBy: AntlersNode) {
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

    wasIntroducedBySymbol(name: string, checkSymbol: AntlersNode): boolean {
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

    injectAssetContainer(symbol: AntlersNode, container: string) {
        this.addBlueprintFields(symbol, this.statamicProject.getAssetBlueprintFields(container));
    }

    injectUserFields(symbol: AntlersNode) {
        this.addBlueprintFields(symbol, this.statamicProject.getUserFields());
    }

    addBlueprintField(symbol: AntlersNode | null, field: IBlueprintField) {
        this.addVariable({
            dataType: field.type,
            name: field.name,
            sourceField: field,
            sourceName: field.blueprintName,
            introducedBy: symbol
        });
    }

    introduceScopedAliasScope(symbol: AntlersNode, scopeName: string, aliasName: string, fields: IBlueprintField[]): Scope {
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

    expandScopedAliasScope(symbol: AntlersNode, scopeName: string, aliasName: string, fields: IBlueprintField[]) {
        if (this.lists.has(aliasName) == false) {
            this.introduceScopedAliasScope(symbol, scopeName, aliasName, fields);
        } else {
            const listRef = this.lists.get(aliasName) as Scope;

            listRef.addBlueprintFields(symbol, fields);
        }
    }

    introduceAliasScope(symbol: AntlersNode, aliasName: string, fields: IBlueprintField[]) {
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

    introduceDynamicScopeList(symbol: AntlersNode, listName: string, fields: IBlueprintField[]) {
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

    addBlueprintFields(symbol: AntlersNode, fields: IBlueprintField[]) {
        for (let i = 0; i < fields.length; i++) {
            this.addBlueprintField(symbol, fields[i]);
        }
    }

    injectBlueprint(symbol: AntlersNode, handle: string) {
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