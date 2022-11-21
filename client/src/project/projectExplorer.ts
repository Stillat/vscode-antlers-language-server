import * as vscode from 'vscode';
import * as path from 'path';
import { IProjectFields, IParsedBlueprint, ISet, IFieldDetails, getProperties } from './types';

const ignoreMetaTypes: string[] = ['revealer', 'section', 'hidden', 'html', 'yaml'];

function getDisplayTitle(blueprint: IParsedBlueprint): string {
    if (blueprint.title != null && blueprint.title.trim().length > 0) {
        return blueprint.title;
    }

    return blueprint.handle;
}

function getDisplayItems(blueprints: IParsedBlueprint[]): ProjectItem[] {
    const blueprintsToReturn: ProjectItem[] = [];

    blueprints.sort((a, b) => a.handle.localeCompare(b.handle)).forEach((blueprint) => {
        var item = new ProjectItem(getDisplayTitle(blueprint), '', ItemType.Collection, vscode.TreeItemCollapsibleState.Collapsed);

        item.setContext(blueprint);

        blueprintsToReturn.push(item);
    });

    return blueprintsToReturn;
}

function getFieldListingItems(allFields: IFieldDetails[]): ProjectItem[] {
    const fields: ProjectItem[] = [];

    allFields.sort((a, b) => a.handle.localeCompare(b.handle)).forEach((field) => {
        if ((field.type == 'entries' && field.handle == 'parent') || ignoreMetaTypes.includes(field.type)) { return; }

        const label = field.handle + ' - ' + field.type,
            newField = new ProjectItem(label, '', ItemType.Field, vscode.TreeItemCollapsibleState.Collapsed);

        newField.setContext(field);
        fields.push(newField);
    });

    return fields;
}

function getObjectPropertyItems(object: any): ProjectItem[] {
    const returnProperties: ProjectItem[] = [],
        objectKeys = Object.keys(object);

    objectKeys.forEach((propertyKey) => {
        const tempVal = object[propertyKey],
            tempValueType = typeof tempVal,
            allowedTypes = ['string', 'number', 'boolean', 'object'];

        if (tempVal !== null && allowedTypes.includes(tempValueType) == false) {
            return;
        }

        let strVal = '',
            type: ItemType = ItemType.Property,
            state: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
            context: any = null;

        if (tempValueType == 'object' && tempVal !== null) {
            const objKeys = Object.keys(tempVal);
            strVal = '{' + objKeys.length + '}';
            type = ItemType.ObjectProperty;
            state = vscode.TreeItemCollapsibleState.Collapsed;
            context = tempVal;
        } else {
            if (tempVal === null) {
                strVal = 'null';
            } else {
                strVal = tempVal.toString();
            }
        }

        const label = propertyKey + ': ' + strVal,
            item = new ProjectItem(label, '', type, state);

        item.context = context;
        returnProperties.push(item);
    });

    return returnProperties;
}

function getFieldItems(element: ProjectItem): ProjectItem[] {
    const blueprint = element.context as IParsedBlueprint;

    return getFieldListingItems(blueprint.allFields);
}

function getSetItems(element: ProjectItem): ProjectItem[] {
    const sets = element.context['sets'] as ISet[],
        newSets: ProjectItem[] = [];

    sets.forEach((set) => {
        const tSet = new ProjectItem(set.handle, '', ItemType.SetEntry, vscode.TreeItemCollapsibleState.Collapsed);
        tSet.context = set;
        newSets.push(tSet);
    });

    return newSets;
}

class ProjectDataProvider implements vscode.TreeDataProvider<ProjectItem> {
    private rootItems: ProjectItem[] = [];
    private structure: IProjectFields | null = null;

    constructor() {

    }

    private rebuildRoot() {
        if (this.structure?.assets.length > 0) {
            this.rootItems.push(new ProjectItem('Assets', 'collections', ItemType.AssetListing, vscode.TreeItemCollapsibleState.Collapsed));
        }
        
        if (this.structure?.collections.length > 0) {
            this.rootItems.push(new ProjectItem('Collections', 'collections', ItemType.CollectionListing, vscode.TreeItemCollapsibleState.Collapsed));
        }

        if (this.structure?.forms.length > 0) {
            this.rootItems.push(new ProjectItem('Forms', 'collections', ItemType.FormListing, vscode.TreeItemCollapsibleState.Collapsed));
        }

        if (this.structure?.general.length > 0) {
            this.rootItems.push(new ProjectItem('General Blueprints', 'collections', ItemType.BlueprintListing, vscode.TreeItemCollapsibleState.Collapsed));
        }

        if (this.structure?.globals.length > 0) {
            this.rootItems.push(new ProjectItem('Globals', 'collections', ItemType.GlobalListing, vscode.TreeItemCollapsibleState.Collapsed));
        }
        
        if (this.structure?.navigations.length > 0) {
            this.rootItems.push(new ProjectItem('Navigations', 'collections', ItemType.NavigationListing, vscode.TreeItemCollapsibleState.Collapsed));
        }
    }

    updateStructure(structure: IProjectFields) {
        this.structure = structure;
        this.rebuildRoot();
        this.refresh();
    }

    private _onDidChangeTreeData: vscode.EventEmitter<ProjectItem | undefined> = new vscode.EventEmitter<ProjectItem | undefined>();

    readonly onDidChangeTreeData: vscode.Event<ProjectItem | undefined> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: ProjectItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        if (element) {
            return element;
        }

        return null;
    }

    getChildren(element?: ProjectItem): vscode.ProviderResult<ProjectItem[]> {
        if (element) {
            if (this.structure == null) {
                return [];
            }

            if (element.type == ItemType.CollectionListing) {
                return getDisplayItems(this.structure.collections);
            } else if (element.type == ItemType.AssetListing) {
                return getDisplayItems(this.structure.assets);
            } else if (element.type == ItemType.FormListing) {
                return getDisplayItems(this.structure.forms);
            } else if (element.type == ItemType.BlueprintListing) {
                return getDisplayItems(this.structure.general);
            } else if (element.type == ItemType.GlobalListing) {
                return getDisplayItems(this.structure.globals);
            } else if (element.type == ItemType.NavigationListing) {
                return getDisplayItems(this.structure.navigations);
            } else if (element.type == ItemType.Collection) {
                return getFieldItems(element);
            } else if (element.type == ItemType.FieldsListing) {
                return getFieldItems(element);
            } else if (element.type == ItemType.NestedSetsListing) {
                return getSetItems(element);
            } else if (element.type == ItemType.SetEntry) {
                const set = element.context as ISet;

                return getFieldListingItems(set.fields);
            } else if (element.type == ItemType.NestedFieldsListing) {
                const fields = element.context['fields'] as IFieldDetails[];

                return getFieldListingItems(fields);
            } else if (element.type == ItemType.Field) {
                const tempItems: ProjectItem[] = [],
                    helpItem = new ProjectItem('Help', '', ItemType.HelpItem, vscode.TreeItemCollapsibleState.None);

                helpItem.command = {
                    command: 'extension.antlersLanguageServer.generateHelpInformation',
                    title: '',
                    arguments: [element.context]
                };

                helpItem.setContext(element.context);
                tempItems.push(helpItem);

                if (typeof element.context['sets'] !== 'undefined') {
                    const tempSets = element.context['sets'] as any[];

                    if (tempSets.length > 0) {
                        const nestedSets = new ProjectItem('Sets (' + tempSets.length + ')', '', ItemType.NestedSetsListing, vscode.TreeItemCollapsibleState.Collapsed);

                        nestedSets.context = element.context;
                        tempItems.push(nestedSets);
                    }
                }

                if (typeof element.context['fields'] !== 'undefined') {
                    const tempFields = element.context['fields'] as any[];

                    if (tempFields.length > 0) {
                        const nestedFields = new ProjectItem('Fields (' + tempFields.length + ')', '', ItemType.NestedFieldsListing, vscode.TreeItemCollapsibleState.Collapsed);

                        nestedFields.context = element.context;
                        tempItems.push(nestedFields);
                    }
                }

                const propertiesItem = new ProjectItem('Properties', '', ItemType.PropertyListing, vscode.TreeItemCollapsibleState.Collapsed);

                propertiesItem.setContext(element.context);
                tempItems.push(propertiesItem);

                return tempItems;
            } else if (element.type == ItemType.ObjectProperty) {
                const tempField = element.context as any;

                return getObjectPropertyItems(tempField);
            } else if (element.type == ItemType.PropertyListing) {
                const tempField = element.context as IFieldDetails,
                    properties = getProperties(tempField);

                return getObjectPropertyItems(properties);
            }
            return [];
        } else {
            return this.rootItems;
        }
    }

    getParent?(element: ProjectItem): vscode.ProviderResult<ProjectItem> {
        return null;
    }

    resolveTreeItem?(
        item: vscode.TreeItem,
        element: ProjectItem,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TreeItem> {
        return item;
    }
}

enum ItemType {
    AssetListing,
    CollectionListing,
    NavigationListing,
    FormListing,
    BlueprintListing,
    FieldsetListing,
    GlobalListing,

    Collection,
    FieldsListing,
    Field,
    HelpItem,
    PropertyListing,
    SetEntry,
    NestedSetsListing,
    NestedFieldsListing,
    Property,
    ObjectProperty,
    General,
}

class ProjectItem extends vscode.TreeItem {
    public context: any;

    setContext(context: any) {
        this.context = context;

        if (this.type == ItemType.FieldsListing || this.type == ItemType.HelpItem || this.type == ItemType.PropertyListing) {
            return;
        }

        if (typeof context['internalIcon'] === 'string') {
            this.icon = context['internalIcon'] as string;
            this.iconPath = {
                light: path.join(__dirname, '..', '..', '..', 'resources', 'light', this.icon + '.svg'),
                dark: path.join(__dirname, '..', '..', '..', 'resources', 'dark', this.icon + '.svg'),
            };
        }
    }

    constructor(
        public readonly label: string,
        public icon: string,
        public readonly type: ItemType,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
    }
}

export class ProjectExplorer {
    private provider: ProjectDataProvider;
    constructor(context: vscode.ExtensionContext) {
        this.provider = new ProjectDataProvider();
        const view = vscode.window.createTreeView('antlers.projectExplorer', {
            treeDataProvider: this.provider,
            showCollapseAll: true,
        });

        context.subscriptions.push(view);
    }

    updateStructure(structure: IProjectFields) {
        this.provider.updateStructure(structure);
    }

}
