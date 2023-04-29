import ModifierManager from '../antlers/modifierManager';
import { parseMacros } from '../antlers/modifiers/macros';
import { IAntlersTag } from '../antlers/tagManager';
import { IComposerPackage } from '../composer/composerPackage';
import { replaceAllInString } from '../utils/strings';
import { convertUriToPath } from '../utils/uris';
import { IAssets } from './assets/asset';
import { IBlueprintField, blueprintFieldsFromFieldset, IBlueprint } from './blueprints/fields';
import { ICollection } from './collections/collection';
import { ICollectionScope } from './collections/collectionScope';
import { IFieldsetField } from './fieldsets/fieldset';
import { INavigation } from './navigations/navigation';
import { IProjectDetailsProvider } from './projectDetailsProvider';
import { IStatamicStructure, IStructureRestore } from './statamicStructure';
import { ITemplate } from './templates';
import { IUserGroup } from './users/users';
import { IView } from './views/view';

function makeBlueprintField(blueprintName: string, fieldName: string, fieldType: string): IBlueprintField {
    return {
        blueprintName: blueprintName,
        displayName: '',
        import: null,
        instructionText: '',
        maxItems: null,
        name: fieldName,
        refFieldSetField: null,
        sets: null,
        type: fieldType
    };
}

class JsonSourceProject implements IProjectDetailsProvider {
    public isMocked = false;
    public rootPath = "";
    public fieldsetsPath = "";
    public viewsPath = "";
    public collectionBlueprintsPath = "";
    public formBlueprintsPath = "";
    public globalBlueprintsPath = "";
    public miscBlueprintsPath = "";
    public taxonomiesBlueprintsPath = "";
    public globalFiles: string[] = [];
    public blueprintFiles: string[] = [];
    public collectionNames: string[] = [];
    public speculativeFields: Map<string, IBlueprintField> = new Map();
    public customModifierNames: string[] = [];
    public customTags: IAntlersTag[] = [];

    public collections: Map<string, ICollection> = new Map();
    public fieldsets: Map<string, IFieldsetField[]> = new Map();
    public forms: Map<string, IBlueprintField[]> = new Map();
    public globals: Map<string, IBlueprintField[]> = new Map();
    public taxonomies: Map<string, IBlueprintField[]> = new Map();
    public fields: Map<string, IBlueprintField[]> = new Map();
    public miscFields: Map<string, IBlueprintField[]> = new Map();
    protected blueprintRef: Map<string, IBlueprintField[]> = new Map();
    protected blueprintCollectionRef: Map<string, string> = new Map();

    public templates: ITemplate[] = [];
    public views: IView[] = [];
    public partialCache: IView[] = [];
    public partialViewNames: string[] = [];
    public taxonomyNames: string[] = [];
    public hasMacroFile = false;
    public macroFilePath = "";
    public collectionQueryScopes: ICollectionScope[] = [];
    public taxonomyTerms: Map<string, string[]> = new Map();
    public assets: Map<string, IAssets> = new Map();
    public userGroups: Map<string, IUserGroup> = new Map();
    public userRoles: Map<string, IUserGroup> = new Map();
    public navigationMenus: Map<string, INavigation> = new Map();

    protected blueprints: IBlueprint[] = [];
    protected viewMap: Map<string, IView> = new Map();
    protected routeNames: string[] = [];
    protected translationKeys: string[] = [];
    protected uniqueFormNames: string[] = [];
    protected uniquePartialViewNames: string[] = [];
    protected uniqueCollectionNames: string[] = [];
    protected uniqueTaxonomyNames: string[] = [];
    protected uniqueUserGroups: string[] = [];
    protected uniqueUserRoles: string[] = [];
    protected sourceStructure: IStatamicStructure;
    protected uniqueGlobalSettingNames: string[] = [];
    protected uniqueNavigationNames: string[] = [];
    protected uniqueAssetNames: string[] = [];
    protected publicAssets: string[] = [];
    protected packageMapping: Map<string, IComposerPackage> = new Map();
    protected statamicAddonMapping: Map<string, IComposerPackage> = new Map();
    protected blueprintFieldReference: IBlueprintField[] = [];
    protected baseResourcePath: string;

    constructor(structure: IStatamicStructure, resourcePath: string) {
        this.baseResourcePath = resourcePath;
        this.sourceStructure = structure;
        this.rootPath = '';
        this.isMocked = structure.isMocked;
        this.rootPath = structure.rootPath;
        this.fieldsetsPath = structure.fieldsetsPath;
        this.viewsPath = structure.viewsPath;
        this.collectionBlueprintsPath = structure.collectionBlueprintsPath;
        this.formBlueprintsPath = structure.formBlueprintsPath;
        this.globalBlueprintsPath = structure.globalBlueprintsPath;
        this.miscBlueprintsPath = structure.miscBlueprintsPath;
        this.taxonomiesBlueprintsPath = structure.taxonomiesBlueprintsPath;
        this.globalFiles = structure.globalFiles;
        this.blueprintFiles = structure.blueprintFiles;
        this.collectionNames = structure.collectionNames;
        this.blueprints = structure.blueprints;
        this.collections = structure.collections;
        this.assets = structure.assets;
        this.fieldsets = structure.fieldsets;
        this.forms = structure.forms;
        this.globals = structure.globals;
        this.taxonomies = structure.taxonomies;
        this.fields = structure.fields;
        this.miscFields = structure.miscFields;
        this.templates = structure.templates;
        this.views = structure.views;
        this.partialCache = structure.partialCache;
        this.partialViewNames = structure.partialViewNames;
        this.taxonomyNames = structure.taxonomyNames;
        this.macroFilePath = structure.macroFilePath;
        this.hasMacroFile = structure.hasMacrosFile;
        this.collectionQueryScopes = structure.collectionScopes;
        this.taxonomyTerms = structure.taxonomyTerms;
        this.navigationMenus = structure.navigationMenus;
        this.rootPath = structure.workingDirectory;
        this.speculativeFields = structure.namedBluePrintFields;
        this.customModifierNames = structure.customModifierNames;
        this.customTags = structure.customTags;

        this.buildDetails();

        if (typeof this.sourceStructure.restoreProperties !== 'undefined' && this.sourceStructure.restoreProperties != null) {
            this.assets = this.sourceStructure.restoreProperties.assets;
            this.blueprintCollectionRef = this.sourceStructure.restoreProperties.blueprintCollectionRef;
            this.blueprintFieldReference = this.sourceStructure.restoreProperties.blueprintFieldReference;
            this.blueprintFiles = this.sourceStructure.restoreProperties.blueprintFiles;
            this.blueprintRef = this.sourceStructure.restoreProperties.blueprintRef;
            this.collectionNames = this.sourceStructure.restoreProperties.collectionNames;
            this.collectionQueryScopes = this.sourceStructure.restoreProperties.collectionQueryScopes;
            this.collections = this.sourceStructure.restoreProperties.collections;
            this.fields = this.sourceStructure.restoreProperties.fields;
            this.fieldsets = this.sourceStructure.restoreProperties.fieldsets;
            this.blueprints = this.sourceStructure.restoreProperties.blueprints;
            this.forms = this.sourceStructure.restoreProperties.forms;
            this.globalFiles = this.sourceStructure.restoreProperties.globalFiles;
            this.globals = this.sourceStructure.restoreProperties.globals;
            this.miscFields = this.sourceStructure.restoreProperties.miscFields;
            this.navigationMenus = this.sourceStructure.restoreProperties.navigationMenus;
            this.packageMapping = this.sourceStructure.restoreProperties.packageMapping;
            this.partialCache = this.sourceStructure.restoreProperties.partialCache;
            this.partialViewNames = this.sourceStructure.restoreProperties.partialViewNames;
            this.publicAssets = this.sourceStructure.restoreProperties.publicAssets;
            this.routeNames = this.sourceStructure.restoreProperties.routeNames;
            this.statamicAddonMapping = this.sourceStructure.restoreProperties.statamicAddonMapping;
            this.taxonomies = this.sourceStructure.restoreProperties.taxonomies;
            this.taxonomyNames = this.sourceStructure.restoreProperties.taxonomyNames;
            this.taxonomyTerms = this.sourceStructure.restoreProperties.taxonomyTerms;
            this.templates = this.sourceStructure.restoreProperties.templates;
            this.translationKeys = this.sourceStructure.restoreProperties.translationKeys;
            this.uniqueAssetNames = this.sourceStructure.restoreProperties.uniqueAssetNames;
            this.uniqueCollectionNames = this.sourceStructure.restoreProperties.uniqueCollectionNames;
            this.uniqueFormNames = this.sourceStructure.restoreProperties.uniqueFormNames;
            this.uniqueGlobalSettingNames = this.sourceStructure.restoreProperties.uniqueGlobalSettingNames;
            this.uniqueNavigationNames = this.sourceStructure.restoreProperties.uniqueNavigationNames;
            this.uniquePartialViewNames = this.sourceStructure.restoreProperties.uniquePartialViewNames;
            this.uniqueTaxonomyNames = this.sourceStructure.restoreProperties.uniqueTaxonomyNames;
            this.uniqueUserGroups = this.sourceStructure.restoreProperties.uniqueUserGroups;
            this.uniqueUserRoles = this.sourceStructure.restoreProperties.uniqueUserRoles;
            this.userGroups = this.sourceStructure.restoreProperties.userGroups;
            this.userRoles = this.sourceStructure.restoreProperties.userRoles;
            this.viewMap = this.sourceStructure.restoreProperties.viewMap;
            this.views = this.sourceStructure.restoreProperties.views;
            this.customModifierNames = this.sourceStructure.restoreProperties.customModifierNames;
            this.customTags = this.sourceStructure.restoreProperties.customTags;
        }
    }

    getViewPath(): string {
        return this.viewsPath;
    }

    getProjectRoot(): string {
        return this.rootPath;
    }

    getCustomModifierNames(): string[] {
        return this.customModifierNames;
    }

    export(): IStatamicStructure {
        const exportStructure = this.sourceStructure;

        exportStructure.restoreProperties = this.getRestoreRecords();

        return exportStructure;
    }

    private getRestoreRecords(): IStructureRestore {
        return {
            assets: this.assets,
            baseResourcePath: this.baseResourcePath,
            blueprintCollectionRef: this.blueprintCollectionRef,
            blueprintFieldReference: this.blueprintFieldReference,
            blueprintFiles: this.blueprintFiles,
            blueprintRef: this.blueprintRef,
            collectionNames: this.collectionNames,
            collectionQueryScopes: this.collectionQueryScopes,
            blueprints: this.blueprints,
            collections: this.collections,
            fields: this.fields,
            fieldsets: this.fieldsets,
            forms: this.forms,
            globalFiles: this.globalFiles,
            globals: this.globals,
            miscFields: this.miscFields,
            navigationMenus: this.navigationMenus,
            packageMapping: this.packageMapping,
            partialCache: this.partialCache,
            partialViewNames: this.partialViewNames,
            publicAssets: this.publicAssets,
            routeNames: this.routeNames,
            statamicAddonMapping: this.statamicAddonMapping,
            taxonomies: this.taxonomies,
            taxonomyNames: this.taxonomyNames,
            taxonomyTerms: this.taxonomyTerms,
            templates: this.templates,
            translationKeys: this.translationKeys,
            uniqueAssetNames: this.uniqueAssetNames,
            uniqueCollectionNames: this.uniqueCollectionNames,
            uniqueFormNames: this.uniqueFormNames,
            uniqueGlobalSettingNames: this.uniqueGlobalSettingNames,
            uniqueNavigationNames: this.uniqueNavigationNames,
            uniquePartialViewNames: this.uniquePartialViewNames,
            uniqueTaxonomyNames: this.uniqueTaxonomyNames,
            uniqueUserGroups: this.uniqueUserGroups,
            uniqueUserRoles: this.uniqueUserRoles,
            userGroups: this.userGroups,
            userRoles: this.userRoles,
            viewMap: this.viewMap,
            views: this.views,
            customModifierNames: this.customModifierNames,
            customTags: this.customTags
        };
    }

    reloadDetails(): IProjectDetailsProvider {
        return this;
    }

    findQueryScopeByHandle(handle: string): ICollectionScope | null {
        for (let i = 0; i < this.collectionQueryScopes.length; i++) {
            if (this.collectionQueryScopes[i].handle === handle) {
                return this.collectionQueryScopes[i];
            }
        }

        return null;
    }

    getCustomAntlersTags(): IAntlersTag[] {
        return this.customTags;
    }

    findAnyBlueprintField(field: string): IBlueprintField | null {
        if (this.speculativeFields.has(field)) {
            return this.speculativeFields.get(field) as IBlueprintField;
        }

        return null;
    }

    protected buildImportRefernece(field: IBlueprintField) {
        if (field.sets != null) {
            for (let i = 0; i < field.sets.length; i++) {
                const thisSet = field.sets[i];

                for (let j = 0; j < thisSet.fields.length; j++) {
                    const thisField = thisSet.fields[j];

                    if (thisField.import != null) {
                        const lookup = thisField.import as string;

                        if (this.sourceStructure.fieldsets.has(lookup)) {
                            const fieldsetFields = this.sourceStructure.fieldsets.get(
                                lookup
                            ) as IFieldsetField[],
                                convertedFields = blueprintFieldsFromFieldset(fieldsetFields);

                            for (let k = 0; k < convertedFields.length; k++) {
                                this.buildImportRefernece(convertedFields[k]);
                            }

                            thisSet.fields.splice(j, 1);
                            thisSet.fields = thisSet.fields.concat(convertedFields);
                        }
                    }
                }
            }
        }
    }

    protected buildDetails() {
        const formNames: string[] = [],
            globalSettingNames: string[] = [],
            navNames: string[] = [],
            assetNames: string[] = [];

        if (typeof this.sourceStructure.assets['forEach'] !== 'undefined') {
            this.sourceStructure.assets.forEach((val: IAssets, handle: string) => {
                assetNames.push(handle);
            });
        }

        if (typeof this.sourceStructure.forms['forEach'] !== 'undefined') {
            this.sourceStructure.forms.forEach(
                (val: IBlueprintField[], handle: string) => {
                    val.forEach((field) => {
                        this.blueprintCollectionRef.set(field.blueprintName, handle);
                    });
                    formNames.push(handle);
                    this.blueprintRef.set(handle, val);
                }
            );
        }

        if (typeof this.sourceStructure.globals['forEach'] !== 'undefined') {
            this.sourceStructure.globals.forEach(
                (val: IBlueprintField[], handle: string) => {
                    val.forEach((field) => {
                        this.blueprintCollectionRef.set(field.blueprintName, handle);
                    });

                    globalSettingNames.push(handle);
                    this.blueprintRef.set(handle, val);
                }
            );
        }

        if (typeof this.sourceStructure.miscFields['forEach'] !== 'undefined') {
            this.sourceStructure.miscFields.forEach(
                (val: IBlueprintField[], handle: string) => {
                    val.forEach((field) => {
                        this.blueprintCollectionRef.set(field.blueprintName, handle);
                    });

                    this.blueprintRef.set(handle, val);
                }
            );
        }

        if (typeof this.sourceStructure.taxonomies['forEach'] !== 'undefined') {
            this.sourceStructure.taxonomies.forEach(
                (val: IBlueprintField[], handle: string) => {
                    val.forEach((field) => {
                        this.blueprintCollectionRef.set(field.blueprintName, handle);
                    });

                    this.blueprintRef.set(handle, val);
                }
            );
        }

        if (typeof this.sourceStructure.fields['forEach'] !== 'undefined') {
            this.sourceStructure.fields.forEach(
                (val: IBlueprintField[], handle: string) => {
                    val.forEach((field) => {
                        this.blueprintCollectionRef.set(field.blueprintName, handle);
                    });

                    this.blueprintRef.set(handle, val);
                }
            );
        }

        if (typeof this.sourceStructure.navigationMenus['forEach'] !== 'undefined') {
            this.sourceStructure.navigationMenus.forEach(
                (val: INavigation, handle: string) => {
                    navNames.push(handle);
                }
            );
        }


        if (typeof this.sourceStructure.views['forEach'] !== 'undefined') {
            this.sourceStructure.views.forEach((view: IView, index: number) => {
                this.viewMap.set(view.documentUri, view);
            });
        }

        if (typeof this.sourceStructure.composerPackages['forEach'] !== 'undefined') {
            this.sourceStructure.composerPackages.forEach(
                (composerPackage: IComposerPackage) => {
                    if (composerPackage.isStatamicAddon) {
                        this.statamicAddonMapping.set(composerPackage.name, composerPackage);
                    }

                    this.packageMapping.set(composerPackage.name, composerPackage);
                }
            );
        }

        this.uniqueAssetNames = [...new Set(assetNames)];
        this.uniqueNavigationNames = [...new Set(navNames)];
        this.uniqueGlobalSettingNames = [...new Set(globalSettingNames)];
        this.uniqueFormNames = [...new Set(formNames)];
        this.uniqueCollectionNames = [...new Set(this.collectionNames)];
        this.uniquePartialViewNames = [...new Set(this.partialViewNames)];
        this.uniqueTaxonomyNames = [...new Set(this.taxonomyNames)];

        ModifierManager.instance?.resetMacros();

        if (this.hasMacroFile) {
            const parsedMacros = parseMacros(this.macroFilePath);

            // Register them with the modifier manager.
            if (parsedMacros.length > 0) {
                ModifierManager.instance?.registerMacros(parsedMacros);
            }
        }

        this.uniqueUserRoles = [...new Set(this.sourceStructure.userRoleNames)];
        this.uniqueUserGroups = [...new Set(this.sourceStructure.userGroupNames)];

        if (this.sourceStructure.searchIndexes.length == 0) {
            this.sourceStructure.searchIndexes.push("default");
        }

        for (
            let i = 0;
            i < this.sourceStructure.internalFieldReference.length;
            i++
        ) {
            this.buildImportRefernece(this.sourceStructure.internalFieldReference[i]);
        }
    }

    getWorkingDirectory(): string {
        return this.sourceStructure.workingDirectory;
    }

    getOAuthProviders(): string[] {
        return [];
    }

    getSiteNames(): string[] {
        return [];
    }

    getSearchIndexes(): string[] {
        return this.sourceStructure.searchIndexes;
    }

    getStatamicVersion(): string {
        if (this.sourceStructure.statamicPackage != null) {
            return this.sourceStructure.statamicPackage.version;
        }

        return "";
    }

    hasComposerPackage(packageName: string): boolean {
        return this.packageMapping.has(packageName);
    }

    hasStatamicAddon(addonName: string): boolean {
        return this.statamicAddonMapping.has(addonName);
    }

    getAddonDetails(addonName: string): IComposerPackage | null {
        if (this.hasStatamicAddon(addonName)) {
            return this.statamicAddonMapping.get(addonName) as IComposerPackage;
        }

        return null;
    }

    getComposerPackages(): Map<string, IComposerPackage> {
        return this.packageMapping;
    }

    getComposerPackageDetails(packageName: string): IComposerPackage | null {
        if (this.hasComposerPackage(packageName)) {
            return this.packageMapping.get(packageName) as IComposerPackage;
        }

        return null;
    }

    getPartials(): IView[] {
        return this.sourceStructure.partialCache;
    }

    getBlueprintNames(): string[] {
        const names: string[] = [];

        this.blueprintRef.forEach((values, handle) => {
            if (handle.startsWith('*') == false) {
                if (names.includes(handle) == false) {
                    names.push(handle);
                }
            }
        });

        return names;
    }

    getBlueprintDetails(handle: string): IBlueprintField[] {
        if (this.blueprintRef.has(handle) == false) {
            const defaultItems: IBlueprintField[] = [];
            defaultItems.push(makeBlueprintField(handle, 'title', 'text'));
            defaultItems.push(makeBlueprintField(handle, 'content', 'markdown'));
            defaultItems.push(makeBlueprintField(handle, 'slug', 'slug'));

            return defaultItems;
        }

        return this.blueprintRef.get(handle) as IBlueprintField[];
    }

    hasViewCollectionInjections(documentUri: string): boolean {
        if (this.viewMap.has(documentUri) == false) {
            return false;
        }

        const viewRef = this.viewMap.get(documentUri) as IView;

        if (viewRef.injectsCollections.length > 0) {
            return true;
        }

        return false;
    }

    getCollectionNames(): string[] {
        return this.collectionNames;
    }

    getCollectionNamesForView(documentUri: string): string[] {
        if (this.viewMap.has(documentUri) == false) {
            return [];
        }

        const viewRef = this.viewMap.get(documentUri) as IView;

        return viewRef.injectsCollections;
    }

    getPublicAssetPaths(): string[] {
        return this.publicAssets;
    }

    getTaxonomyTerms(name: string): string[] {
        if (this.hasTaxonomy(name)) {
            return this.taxonomyTerms.get(name) as string[];
        }

        return [];
    }

    hasTaxonomy(name: string): boolean {
        return this.taxonomyNames.includes(name);
    }

    getCollectionQueryScopes(): ICollectionScope[] {
        return this.collectionQueryScopes;
    }

    getBlueprintFields(collections: string[]): IBlueprintField[] {
        let fieldsToReturn: IBlueprintField[] = [];

        for (let i = 0; i < collections.length; i++) {
            const collectionName = collections[i],
                collectionDetails = this.getCollectionDetails(collectionName);

            if (collectionDetails != null && collectionDetails.injectFields != null) {
                for (let j = 0; j < collectionDetails.injectFields.length; j++) {
                    fieldsToReturn.push({
                        blueprintName: "*inject",
                        displayName: collectionDetails.injectFields[j],
                        import: null,
                        instructionText: null,
                        maxItems: null,
                        name: collectionDetails.injectFields[i],
                        refFieldSetField: null,
                        sets: null,
                        type: "*",
                    });
                }
            }

            if (this.fields.has(collectionName)) {
                const potentialFields = this.fields.get(collectionName);

                if (
                    typeof potentialFields !== "undefined" &&
                    potentialFields !== null
                ) {
                    fieldsToReturn = fieldsToReturn.concat(potentialFields);
                }
            }
        }

        return fieldsToReturn;
    }

    getBlueprintField(
        collectionName: string,
        handle: string
    ): IBlueprintField | null {
        let searchName = collectionName;

        if (this.blueprintCollectionRef.has(searchName)) {
            searchName = this.blueprintCollectionRef.get(searchName) as string;
        }

        if (this.fields.has(searchName)) {
            const collectionFields = this.fields.get(searchName) as IBlueprintField[];

            for (let i = 0; i < collectionFields.length; i++) {
                if (collectionFields[i].name == handle) {
                    return collectionFields[i];
                }
            }
        }

        return null;
    }

    getFields(): Map<string, IBlueprintField[]> {
        return this.fields;
    }

    getTaxonomyBlueprintFields(taxonomies: string[]): IBlueprintField[] {
        let fieldsToReturn: IBlueprintField[] = [];

        for (let i = 0; i < taxonomies.length; i++) {
            const taxonomyName = taxonomies[i];

            if (this.taxonomies.has(taxonomyName)) {
                const potentialFields = this.taxonomies.get(taxonomyName);

                if (
                    typeof potentialFields !== "undefined" &&
                    potentialFields !== null
                ) {
                    fieldsToReturn = fieldsToReturn.concat(potentialFields);
                }
            }
        }

        return fieldsToReturn;
    }

    getUserFields(): IBlueprintField[] {
        if (this.miscFields.has("user")) {
            return this.miscFields.get("user") as IBlueprintField[];
        }

        return [];
    }

    getAssetBlueprintFields(handle: string): IBlueprintField[] {
        if (this.sourceStructure.assetFields.has(handle)) {
            return this.sourceStructure.assetFields.get(handle) as IBlueprintField[];
        }

        return [];
    }

    getUniqueTaxonomyNames(): string[] {
        return this.uniqueTaxonomyNames;
    }

    getUniqueCollectionNames(): string[] {
        return this.uniqueCollectionNames;
    }

    getUniquePartialNames(): string[] {
        return this.uniquePartialViewNames;
    }

    getUniqueUserGroupNames(): string[] {
        return this.uniqueUserGroups;
    }

    getUniqueUserRoleNames(): string[] {
        return this.uniqueUserRoles;
    }

    getUniqueFormNames(): string[] {
        return this.uniqueFormNames;
    }

    getAssetPresets(): string[] {
        return [];
    }

    getUniqueGlobalsNames(): string[] {
        return this.uniqueGlobalSettingNames;
    }

    getUniqueNavigationMenuNames(): string[] {
        return this.uniqueNavigationNames;
    }

    getUniqueAssetNames(): string[] {
        return this.uniqueAssetNames;
    }

    getCollectionDetails(handle: string): ICollection | null {
        if (this.collections.has(handle)) {
            return this.collections.get(handle) as ICollection;
        }

        return null;
    }

    getFormBlueprintFields(handle: string): IBlueprintField[] {
        if (this.forms.has(handle)) {
            const fields = this.forms.get(handle);

            if (typeof fields === "undefined" || fields === null) {
                return [];
            }

            return fields;
        }

        return [];
    }

    getRouteNames(): string[] {
        return this.routeNames;
    }

    getTranslationKeys(): string[] {
        return this.translationKeys;
    }

    getTemplateNames(): string[] {
        const templates: string[] = [];

        this.views.forEach((view) => {
            const adjustedName = replaceAllInString(view.relativeDisplayName, '/', '.');

            if (templates.includes(adjustedName) == false) {
                templates.push(adjustedName);
            }
        });

        return templates;
    }

    getViews(): IView[] {
        return this.views;
    }

    findView(documentUri: string): IView | null {
        if (documentUri.trim() == "") {
            return null;
        }

        const localPath = convertUriToPath(documentUri);

        for (let i = 0; i < this.views.length; i++) {
            if (this.views[i].path == localPath) {
                return this.views[i];
            }
        }

        return null;
    }

    findRelativeView(relativeName: string): IView | null {
        relativeName = replaceAllInString(relativeName, '\\.', '/');

        for (let i = 0; i < this.views.length; i++) {
            if (this.views[i].relativeDisplayName == relativeName) {
                return this.views[i];
            }
        }

        return null;
    }

    findPartial(partialName: string): IView | null {
        partialName = replaceAllInString(partialName, '\\.', '/');

        for (let i = 0; i < this.views.length; i++) {
            if (this.views[i].isPartial &&
                this.views[i].relativeDisplayName == partialName
            ) {
                return this.views[i];
            }
        }

        return null;
    }
}

export { JsonSourceProject };