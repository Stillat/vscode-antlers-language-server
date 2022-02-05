import { IEnvironmentHelper, IVariableHelper, parseIdeHelper } from '../../idehelper/parser';
import { IBlueprintField } from '../../projects/blueprints/fields';
import { getFieldRuntimeType } from '../../projects/blueprints/blueprintTypes';
import ReferenceManager from '../../references/referenceManager';
import { AbstractNode, AntlersNode, EqualCompOperator, StringValueNode, VariableNode } from '../../runtime/nodes/abstractNode';
import { IAntlersTag } from '../tagManager';
import TagManager from '../tagManagerInstance';
import { makeArrayVariables } from '../variables/arrayVariables';
import { makeContentVariables } from '../variables/contentVariables';
import { makeLoopVariables } from '../variables/loopVariables';
import { getSiteData, getSystemVariables } from '../variables/systemVariables';
import { checkNodeForPagination } from './factories/paginationFactory';
import { IProjectDetailsProvider } from '../../projects/projectDetailsProvider';
import { blueprintFieldsToScopeVariables, blueprintFieldToScopeVariable } from './scopeUtilities';
import { Scope } from './scope';
import { IScopeVariable } from './types';
import { IFieldtypeInjection } from '../../projects/fieldsets/fieldtypeInjection';
import FieldtypeManager from '../fieldtypes/fieldtypeManager';
import InjectionManager from './injections';
import { AntlersDocument } from '../../runtime/document/antlersDocument';

const IgnoreArrayContextualData: string[] = ['collection'];
const ChecksForFieldReferences: string[] = ['if', 'elseif', 'unless', 'elseunless'];

export class ScopeEngine {

    private document: AntlersDocument;
    private statamicProject: IProjectDetailsProvider;
    private pageVars: IScopeVariable[] = [];
    private viewDataVars: Scope | null = null;
    private documentUri = '';
    private lastSymbolId = '';
    private ideHelperMap: Map<string, IVariableHelper> = new Map();

    constructor(project: IProjectDetailsProvider, documentUri: string, document: AntlersDocument) {
        this.statamicProject = project;
        this.documentUri = documentUri;
        this.document = document;

        this.makePageScope();
        this.makeViewDataScope();
    }

    private makeViewDataScope() {
        if (this.document.hasFrontMatter()) {
            this.viewDataVars = this.document.getFrontMatterScope();
        }
    }

    private makePageScope() {
        const newPageVariables: IScopeVariable[] = [];

        const projFields = this.statamicProject.getFields();
        if (projFields.has('pages')) {
            const pageFields = projFields.get('pages') as IBlueprintField[];

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

    analyzeScope(nodes: AntlersNode[]) {
        const rootScope = new Scope(this.statamicProject);
        rootScope.name = '*root*';
        rootScope.parentScope = rootScope;

        rootScope.addScopeList('site', getSiteData(this.statamicProject));
        rootScope.addScopeList('sites', getSiteData(this.statamicProject));
        rootScope.addVariables(getSystemVariables());
        const rootUserVariableScope = new Scope(this.statamicProject);
        rootUserVariableScope.name = '*root_user*';
        rootUserVariableScope.parentScope = rootScope;

        this.statamicProject.getUserFields().forEach((field) => {
            rootUserVariableScope.addBlueprintField(null, field);
        });

        rootScope.addScopeList('current_user', rootUserVariableScope);

        if (ReferenceManager.instance?.pageScopeDisabled(this.documentUri)) {
            if (this.viewDataVars != null) {
                rootScope.addScopeList('view', this.viewDataVars);
            }
        } else {

            if (this.viewDataVars != null) {
                rootScope.mergeAndList('page', this.pageVars).addScopeList('view', this.viewDataVars);
            } else {
                rootScope.mergeAndList('page', this.pageVars);
            }
        }

        let ideHelper: IEnvironmentHelper | null = null;

        if (nodes.length > 0 && nodes[0].isComment) {
            ideHelper = parseIdeHelper(this.documentUri, nodes[0]);
        }

        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].isComment) {
                const varIdeHelper = parseIdeHelper(this.documentUri, nodes[i]);

                if (varIdeHelper.variableHelper != null) {
                    this.ideHelperMap.set(nodes[i].id(), varIdeHelper.variableHelper);
                }
            }
        }

        let documentCollectionNames = this.statamicProject.getCollectionNamesForView(this.documentUri);

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
                                        rootScope.addVariables(blueprintFieldsToScopeVariables(nodes[0], fieldRef.sets[i].fields));
                                        break;
                                    }
                                }
                            }
                        } else {
                            rootScope.addBlueprintField(nodes[0], fieldRef);
                        }
                    }
                }
            }
        }

        if (documentCollectionNames.length > 0) {
            for (let i = 0; i < documentCollectionNames.length; i++) {
                rootScope.injectBlueprint(nodes[0], documentCollectionNames[i]);
            }

            rootScope.addVariables(makeContentVariables(nodes[0]));

        }

        if (InjectionManager.instance?.hasAvailableInjections(this.documentUri)) {
            rootScope.mergeScope(InjectionManager.instance?.getScopeInjection(this.documentUri, this.statamicProject));
        }

        const currentScopeParts: string[] = [],
            popScopeIds: string[] = [],
            resolvedPaths: string[] = [],
            activeScopes: Scope[] = [];

        activeScopes.push(rootScope);

        for (let i = 0; i < nodes.length; i++) {
            const currentNode = nodes[i];

            if (this.lastSymbolId.length > 0 && popScopeIds.includes(currentNode.id())) {
                currentScopeParts.pop();
                activeScopes.pop();

                if (activeScopes.length == 0) {
                    activeScopes.push(rootScope);
                }
            }

            let currentScope = activeScopes[activeScopes.length - 1];

            // If there are any interpolations, we will give them the current scope before
            // tags have a chance to introduce any new variables into the active scope.
            if (currentNode.hasParameters) {
                for (let j = 0; j < currentNode.parameters.length; j++) {
                    if (currentNode.parameters[j].interpolations.length > 0) {
                        for (let k = 0; k < currentNode.parameters[j].interpolations.length; k++) {
                            const tInterpolationName = currentNode.parameters[j].interpolations[k];

                            if (currentNode.processedInterpolationRegions.has(tInterpolationName)) {
                                const tIntNodes = currentNode.processedInterpolationRegions.get(tInterpolationName) as AbstractNode[];

                                tIntNodes.forEach((node) => {
                                    if (node instanceof AntlersNode) {
                                        node.currentScope = currentScope;
                                    }
                                });
                            }
                        }
                    }
                }
            }

            // Attempt to resolve any source types before scope adjustments take place.
            if (TagManager.instance?.isKnownTag(currentNode.getTagName()) == false) {
                currentNode.scopeVariable = currentScope.findReference(currentNode.runtimeName());

                if (i > 0) {
                    const lastSymbol = nodes[i - 1];

                    if (lastSymbol.isComment && this.ideHelperMap.has(lastSymbol.id()) && !lastSymbol.isClosingTag && !currentNode.isClosingTag) {
                        const ideHelper = this.ideHelperMap.get(lastSymbol.id()) as IVariableHelper;

                        if (ideHelper.variableName == currentNode.getTagName()) {
                            const collectionFieldReference = this.statamicProject.getBlueprintField(ideHelper.collectionName, ideHelper.fieldHandle);

                            if (collectionFieldReference != null) {
                                currentNode.scopeVariable = blueprintFieldToScopeVariable(currentNode, collectionFieldReference);
                            }
                        }
                    }
                }

                if (currentNode.scopeVariable == null) {
                    const trimmedRuntimeName = currentNode.runtimeName().trim();

                    if (currentScope.hasList(trimmedRuntimeName) || currentNode.currentScope?.hasListInHistory(trimmedRuntimeName)) {
                        currentNode.sourceType = 'array';
                        const listReference = currentScope.getList(trimmedRuntimeName);

                        if (listReference != null && listReference.values.size > 0) {
                            const firstListVar = listReference.values.entries().next().value[1] as IScopeVariable;

                            currentNode.scopeVariable = {
                                dataType: 'array',
                                introducedBy: firstListVar.introducedBy,
                                name: trimmedRuntimeName,
                                sourceField: null,
                                sourceName: firstListVar.sourceName
                            };
                        }


                    }
                } else {
                    currentNode.sourceType = getFieldRuntimeType(currentNode.scopeVariable.dataType);
                    if (currentNode.scopeVariable.sourceField != null) {
                        if (FieldtypeManager.instance?.hasFieldtype(currentNode.scopeVariable.sourceField.type)) {
                            const fieldTypeRef = FieldtypeManager.instance?.getFieldType(currentNode.scopeVariable.sourceField.type) as IFieldtypeInjection;

                            fieldTypeRef.augmentScope(currentNode, currentScope);
                        }
                    }
                }
            }

            if (currentNode.hasParameters) {
                checkNodeForPagination(currentNode, currentScope);
            }


            if (currentNode.modifiers != null && currentNode.modifiers.hasModifiers()) {
                currentNode.manifestType = currentNode.modifiers.getLastManifestedModifierRuntimeType();
            } else {
                currentNode.manifestType = currentNode.sourceType;
            }

            if (currentNode.isClosedBy != null) {
                // Let's create a new scope.
                currentScopeParts.push(currentNode.id());
                popScopeIds.push(currentNode.isClosedBy.id());
                currentScope = currentScope.copy();
                activeScopes.push(currentScope);
            }

            // This assumes people close their scope tags.
            if (currentNode.getTagName() == 'scope' && currentNode.hasMethodPart()) {
                // Take a snapshot of the current scope.
                const snapshot = activeScopes[activeScopes.length - 2].copy();
                currentScope.addScopeList(currentNode.getMethodNameValue(), snapshot);
            }

            if (currentScope.containsPath(currentNode.runtimeName())) {
                currentScopeParts.push(currentNode.id());

                if (currentNode.isClosedBy != null) {
                    popScopeIds.push(currentNode.isClosedBy.id());
                }

                currentScope = currentScope.copy().bringListIntoMainScope(currentNode.runtimeName());
                activeScopes.push(currentScope);
                currentNode.currentScope = currentScope;

            } else {
                currentNode.currentScope = currentScope;
            }

            // If we see a "scope" on already scoped values
            // rewind to a pristine before value scope and rewrite
            if (currentNode.getTagName() != 'cache') {
                const scopeParam = currentNode.findParameter('scope');

                if (scopeParam != null && currentScope.canShiftScope(currentNode.runtimeName())) {
                    currentScope = currentScope.shiftScope(currentNode, currentNode.runtimeName(), scopeParam.value);
                    currentNode.currentScope = currentScope;
                    activeScopes.pop();
                    activeScopes.push(currentScope);
                }
            }

            if (TagManager.instance?.isKnownTag(currentNode.runtimeName())) {
                const tagRef = TagManager.instance?.findTag(currentNode.runtimeName()) as IAntlersTag;

                if (typeof tagRef !== 'undefined' && tagRef.augmentScope != null) {
                    // Augment the scope.
                    tagRef.augmentScope(currentNode, currentScope);
                }
            }

            if (currentNode.modifierChain != null && currentNode.modifierChain.modifierChain.length > 0) {
                currentNode.modifierChain.modifierChain.forEach((modifier) => {
                    if (modifier.modifier != null && typeof modifier.modifier.augmentScope != 'undefined' && modifier.modifier.augmentScope != null) {
                        modifier.modifier.augmentScope(currentNode, currentScope);
                    }
                });
            }

            if (currentNode.modifiers.hasParameterModifiers()) {
                currentNode.modifiers.parameterModifiers.forEach((param) => {
                    if (param.modifier != null && typeof param.modifier.augmentScope != 'undefined' && param.modifier.augmentScope != null) {
                        param.modifier.augmentScope(currentNode, currentScope);
                    }
                });
            }

            if (currentNode.sourceType == 'array') {
                const chunkParam = currentNode.findParameter('chunk');
                let injectContextualArrayData = true;

                if (currentNode.parent != null && currentNode.parent instanceof AntlersNode) {
                    if (IgnoreArrayContextualData.includes(currentNode.parent.runtimeName())) {
                        injectContextualArrayData = false;
                    }
                }

                if (typeof chunkParam !== 'undefined' && chunkParam !== null) {
                    if (currentNode.currentScope.parentScope != null && (currentNode.currentScope.parentScope.hasList(currentNode.runtimeName()) ||
                        currentScope.referencesArray(currentNode.runtimeName()))) {
                        const adjustedScope = currentNode.currentScope.parentScope.copy();
                        let thisArrayValues = adjustedScope.liftList(currentNode.runtimeName()) as Scope;

                        if (thisArrayValues == null && currentScope.referencesArray(currentNode.runtimeName())) {
                            thisArrayValues = new Scope(currentScope.statamicProject);

                            if (injectContextualArrayData) {
                                const symbolArrayVariables = makeArrayVariables(currentNode);

                                for (let i = 0; i < symbolArrayVariables.length; i++) {
                                    const checkVar = symbolArrayVariables[i];

                                    if (adjustedScope.wasIntroducedBySymbol(checkVar.name, currentNode)) {
                                        adjustedScope.removeThroughIntroduction(checkVar.name, currentNode);
                                    }
                                }

                                thisArrayValues.addVariables(symbolArrayVariables);
                            }
                        } else {
                            if (injectContextualArrayData) {
                                adjustedScope.addVariables(makeArrayVariables(currentNode));
                            }
                        }

                        adjustedScope.addScopeList('chunk', thisArrayValues);

                        currentScope = adjustedScope;
                        activeScopes.pop();
                        activeScopes.push(currentScope);
                        currentNode.currentScope = adjustedScope;
                    } else {
                        const scopeParam = currentNode.findParameter('scope');

                        if (typeof scopeParam !== 'undefined' && scopeParam !== null) {
                            if (currentNode.currentScope != null && currentNode.currentScope.hasList(scopeParam.value) && currentNode.scopeName != null) {
                                const adjustedScope = currentNode.currentScope.copy(),
                                    injectScope = adjustedScope.ancestor().copy(),
                                    thisArrayValues = adjustedScope.liftList(currentNode.scopeName) as Scope;

                                if (injectContextualArrayData) {
                                    adjustedScope.addVariables(makeArrayVariables(currentNode));
                                }

                                // Throw away the existing list here.
                                injectScope.liftList(currentNode.scopeName);
                                adjustedScope.addScopeList(currentNode.scopeName, thisArrayValues);
                                injectScope.addScopeList('chunk', adjustedScope);

                                currentScope = injectScope;
                                activeScopes.pop();
                                activeScopes.push(currentScope);
                                currentNode.currentScope = injectScope;
                            }
                        }
                    }
                } else {
                    if (currentNode.scopeVariable != null && currentNode.scopeVariable.sourceField == null) {
                        if (injectContextualArrayData) {
                            currentScope.addVariables(makeArrayVariables(currentNode));
                            currentScope.addVariables(makeLoopVariables(currentNode));
                        }
                    }
                }
            }

            if (popScopeIds.includes(currentNode.id())) {
                if (currentNode.parent != null && currentNode.parent instanceof AntlersNode) {
                    const tRef = currentNode.currentScope.findAncestorWithList(currentNode.getTagName());

                    if (tRef != null) {
                        currentNode.currentScope = tRef;
                        currentScope = tRef.copy();
                        activeScopes.pop();

                        if (activeScopes.length == 0) {
                            activeScopes.push(rootScope);
                        }

                        activeScopes.push(currentScope);
                    } else {
                        if (currentNode.parent.parent != null) {
                            currentNode.currentScope = currentNode.parent.parent.currentScope;
                        } else {
                            currentNode.currentScope = currentNode.parent.currentScope;
                        }
                    }
                }
            }

            if (currentNode.currentScope != null && currentNode.runtimeNodes.length > 0) {
                currentNode.runtimeNodes.forEach((runtimeNode) => {
                    if (runtimeNode instanceof VariableNode) {
                        if (currentNode.currentScope?.hasValue(runtimeNode.name)) {
                            const varRef = currentNode.currentScope.findReferenceWithField(runtimeNode.name);

                            runtimeNode.currentScope = currentNode.currentScope;
                            runtimeNode.scopeName = currentNode.scopeName;
                            runtimeNode.scopeVariable = varRef;
                        }
                    }
                });
            }

            if (ChecksForFieldReferences.includes(currentNode.runtimeName())) {
                if (currentNode.runtimeNodes.length == 3) {
                    if (currentNode.runtimeNodes[0] instanceof VariableNode &&
                        currentNode.runtimeNodes[1] instanceof EqualCompOperator &&
                        currentNode.runtimeNodes[2] instanceof StringValueNode) {
                        if (currentNode.runtimeNodes[0].scopeVariable != null &&
                            currentNode.runtimeNodes[0].scopeVariable.sourceField != null) {
                            const targetVar = currentNode.runtimeNodes[0].scopeVariable,
                                checkValue = currentNode.runtimeNodes[2].value,
                                targetField = targetVar.sourceField as IBlueprintField;

                            if (targetField.sets != null) {
                                for (let setIndex = 0; setIndex < targetField.sets.length; setIndex++) {
                                    const thisSet = targetField.sets[setIndex];

                                    if (thisSet.handle == checkValue && thisSet.fields != null) {
                                        currentScope = currentScope.copy();
                                        currentScope.addBlueprintFields(currentNode, thisSet.fields);

                                        if (currentNode.isClosedBy != null && !currentNode.isSelfClosing) {
                                            currentScopeParts.push(currentNode.id());
                                            popScopeIds.push(currentNode.isClosedBy.id());
                                            activeScopes.push(currentScope);
                                        }

                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            this.lastSymbolId = currentNode.id();

            const scopePath = currentScopeParts.join('/');
            resolvedPaths.push(scopePath);
        }
    }

}
