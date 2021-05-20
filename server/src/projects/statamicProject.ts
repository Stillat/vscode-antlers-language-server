import * as path from 'path';
import * as fs from 'fs';
import * as YAML from 'yaml';

import { dirname } from 'path';
import { ModifierManager } from '../antlers/modifierManager';
import { parseMacros } from '../antlers/modifiers/macros';
import { convertPathToUri, convertUriToPath, normalizePath, shouldProcessPath } from '../utils/io';
import { blueprintFieldsFromFieldset, getBlueprintFields, IBlueprintField } from './blueprints';
import { ICollectionScope } from './collectionScope';
import { getFieldsetFields, IFieldsetField } from './fieldsets';
import { getNavigationMenu } from './navigationMenus';
import { getProjectAssets } from './projectAssets';
import { getCollectionDetails } from './projectCollections';
import { ITemplate } from './templates';
import { getUserRoles, getUserGroups } from './userPermissions';
import { IComposerPackage, LockFileParser } from '../composer/lockFileParser';
import { LoadedManifest } from './manifestManager';
import { AugmentationManager } from './augmentationManager';
import { ViewModelManager } from './viewModelManager';
import { IAntlersParameter } from '../antlers/tagManager';

let currentStructure: StatamicProject | null = null;

export function updateCurrentStructure(project: StatamicProject) {
    currentStructure = project;
}

export { currentStructure };

interface IStatamicStructure {
    isMocked: boolean,
    rootPath: string,
    fieldsetsPath: string,
    viewsPath: string,
    contentDirectory: string,
    taxonomyContentDirectory: string,
    collectionBlueprintsPath: string,
    formBlueprintsPath: string,
    globalBlueprintsPath: string,
    miscBlueprintsPath: string,
    taxonomiesBlueprintsPath: string,
    userPermissionsPath: string,
    composerPackages: IComposerPackage[],
    statamicPackage: IComposerPackage | null,

    searchIndexes: string[],

    assets: Map<string, IAssets>,
    assetFields: Map<string, IBlueprintField[]>,

    collections: Map<string, ICollection>,
    collectionScopes: ICollectionScope[],

    oauthProviders: string[],

    hasMacrosFile: boolean,
    macroFilePath: string,
    globalFiles: string[],
    blueprintFiles: string[],

    collectionNames: string[],
    fieldsets: Map<string, IFieldsetField[]>,
    forms: Map<string, IBlueprintField[]>,
    globals: Map<string, IBlueprintField[]>,
    taxonomies: Map<string, IBlueprintField[]>,
    taxonomyPluralizedMapping: Map<string, string>,
    taxonomyTerms: Map<string, string[]>,
    taxonomyNames: string[],
    fields: Map<string, IBlueprintField[]>,
    miscFields: Map<string, IBlueprintField[]>,
    templates: ITemplate[],
    views: IView[],
    partialCache: IView[],
    partialViewNames: string[],

    navigationMenus: Map<string, INavigation>,
    workingDirectory: string,
    userRoles: Map<string, IUserRole>,
    userRoleNames: string[],
    userGroups: Map<string, IUserGroup>,
    userGroupNames: string[],
    internalFieldReference: IBlueprintField[]
}

export class StatamicProject {

    public isMocked = false;
    public rootPath = '';
    public fieldsetsPath = '';
    public viewsPath = '';
    public collectionBlueprintsPath = '';
    public formBlueprintsPath = '';
    public globalBlueprintsPath = '';
    public miscBlueprintsPath = '';
    public taxonomiesBlueprintsPath = '';
    public globalFiles: string[] = [];
    public blueprintFiles: string[] = [];
    public collectionNames: string[] = [];

    public collections: Map<string, ICollection> = new Map();
    public fieldsets: Map<string, IFieldsetField[]> = new Map();
    public forms: Map<string, IBlueprintField[]> = new Map();
    public globals: Map<string, IBlueprintField[]> = new Map();
    public taxonomies: Map<string, IBlueprintField[]> = new Map();
    public fields: Map<string, IBlueprintField[]> = new Map();
    public miscFields: Map<string, IBlueprintField[]> = new Map();
    private blueprintRef: Map<string, IBlueprintField[]> = new Map();
    private blueprintCollectionRef: Map<string, string> = new Map();

    public templates: ITemplate[] = [];
    public views: IView[] = [];
    public partialCache: IView[] = [];
    public partialViewNames: string[] = [];
    public taxonomyNames: string[] = [];
    public hasMacroFile = false;
    public macroFilePath = '';
    public collectionQueryScopes: ICollectionScope[] = [];
    public taxonomyTerms: Map<string, string[]> = new Map();
    public assets: Map<string, IAssets> = new Map();
    public userGroups: Map<string, IUserGroup> = new Map();
    public userRoles: Map<string, IUserGroup> = new Map();
    public navigationMenus: Map<string, INavigation> = new Map();

    private viewMap: Map<string, IView> = new Map();
    private routeNames: string[] = [];
    private translationKeys: string[] = [];
    private uniqueFormNames: string[] = [];
    private uniquePartialViewNames: string[] = [];
    private uniqueCollectionNames: string[] = [];
    private uniqueTaxonomyNames: string[] = [];
    private uniqueUserGroups: string[] = [];
    private uniqueUserRoles: string[] = [];
    private sourceStructure: IStatamicStructure;
    private uniqueGlobalSettingNames: string[] = [];
    private uniqueNavigationNames: string[] = [];
    private uniqueAssetNames: string[] = [];
    private publicAssets: string[] = [];
    private packageMapping: Map<string, IComposerPackage> = new Map();
    private statamicAddonMapping: Map<string, IComposerPackage> = new Map();
    private blueprintFieldReference: IBlueprintField[] = [];

    constructor(structure: IStatamicStructure) {
        this.sourceStructure = structure;

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

        this.buildDetails();
    }

    private buildImportRefernece(field: IBlueprintField) {
        if (field.sets != null) {
            for (let i = 0; i < field.sets.length; i++) {
                const thisSet = field.sets[i];

                for (let j = 0; j < thisSet.fields.length; j++) {
                    const thisField = thisSet.fields[j];

                    if (thisField.import != null) {
                        const lookup = thisField.import as string;

                        if (this.sourceStructure.fieldsets.has(lookup)) {
                            const fieldsetFields = this.sourceStructure.fieldsets.get(lookup) as IFieldsetField[],
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

    private buildDetails() {
        const formNames: string[] = [],
            globalSettingNames: string[] = [],
            navNames: string[] = [],
            assetNames: string[] = [];

        this.sourceStructure.assets.forEach((val: IAssets, handle: string) => {
            assetNames.push(handle);
        });

        this.sourceStructure.forms.forEach((val: IBlueprintField[], handle: string) => {
            val.forEach((field) => {
                this.blueprintCollectionRef.set(field.blueprintName, handle);
            });
            formNames.push(handle);
            this.blueprintRef.set(handle, val);
        });

        this.sourceStructure.globals.forEach((val: IBlueprintField[], handle: string) => {
            val.forEach((field) => {
                this.blueprintCollectionRef.set(field.blueprintName, handle);
            });

            globalSettingNames.push(handle);
            this.blueprintRef.set(handle, val);
        });

        this.sourceStructure.miscFields.forEach((val: IBlueprintField[], handle: string) => {
            val.forEach((field) => {
                this.blueprintCollectionRef.set(field.blueprintName, handle);
            });

            this.blueprintRef.set(handle, val);
        });

        this.sourceStructure.taxonomies.forEach((val: IBlueprintField[], handle: string) => {
            val.forEach((field) => {
                this.blueprintCollectionRef.set(field.blueprintName, handle);
            });

            this.blueprintRef.set(handle, val);
        });

        this.sourceStructure.fields.forEach((val: IBlueprintField[], handle: string) => {
            val.forEach((field) => {
                this.blueprintCollectionRef.set(field.blueprintName, handle);
            });

            this.blueprintRef.set(handle, val);
        });

        this.sourceStructure.navigationMenus.forEach((val: INavigation, handle: string) => {
            navNames.push(handle);
        });

        this.sourceStructure.views.forEach((view: IView, index: number) => {
            this.viewMap.set(view.documentUri, view);
        });

        this.sourceStructure.composerPackages.forEach((composerPackage: IComposerPackage) => {
            if (composerPackage.isStatamicAddon) {
                this.statamicAddonMapping.set(composerPackage.name, composerPackage);
            }

            this.packageMapping.set(composerPackage.name, composerPackage);
        });

        this.uniqueAssetNames = [...new Set(assetNames)];
        this.uniqueNavigationNames = [... new Set(navNames)];
        this.uniqueGlobalSettingNames = [... new Set(globalSettingNames)];
        this.uniqueFormNames = [...new Set(formNames)];
        this.uniqueCollectionNames = [...new Set(this.collectionNames)];
        this.uniquePartialViewNames = [...new Set(this.partialViewNames)];
        this.uniqueTaxonomyNames = [...new Set(this.taxonomyNames)];

        ModifierManager.resetMacros();

        if (this.hasMacroFile) {
            const parsedMacros = parseMacros(this.macroFilePath);

            // Register them with the modifier manager.
            if (parsedMacros.length > 0) {
                ModifierManager.registerMacros(parsedMacros);
            }
        }

        this.uniqueUserRoles = [...new Set(this.sourceStructure.userRoleNames)];
        this.uniqueUserGroups = [...new Set(this.sourceStructure.userGroupNames)];

        if (this.sourceStructure.searchIndexes.length == 0) {
            this.sourceStructure.searchIndexes.push('default');
        }

        for (let i = 0; i < this.sourceStructure.internalFieldReference.length; i++) {
            this.buildImportRefernece(this.sourceStructure.internalFieldReference[i]);
        }
    }

    getWorkingDirectory(): string {
        return this.sourceStructure.workingDirectory;
    }

    getOAuthProviders(): string[] {
        if (LoadedManifest != null) {
            return LoadedManifest.config.oauthProviders;
        }

        return [];
    }

    getSiteNames(): string[] {
        if (LoadedManifest != null) {
            return LoadedManifest.config.siteNames;
        }

        return [];
    }

    getSearchIndexes(): string[] {
        if (LoadedManifest != null) {
            return LoadedManifest.config.searchIndexes;
        }

        return this.sourceStructure.searchIndexes;
    }

    getStatamicVersion(): string {
        if (this.sourceStructure.statamicPackage != null) {
            return this.sourceStructure.statamicPackage.version;
        }

        return '';
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

    getComposerPackageDetails(packageName: string): IComposerPackage | null {
        if (this.hasComposerPackage(packageName)) {
            return this.packageMapping.get(packageName) as IComposerPackage;
        }

        return null;
    }

    getPartials(): IView[] {
        return this.sourceStructure.partialCache;
    }

    getBlueprintDetails(handle: string): IBlueprintField[] {
        if (this.blueprintRef.has(handle) == false) {
            return [];
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
        if (LoadedManifest != null) {
            const scopes: ICollectionScope[] = [];

            for (let i = 0; i < LoadedManifest.queryScopes.length; i++) {
                scopes.push({
                    name: LoadedManifest.queryScopes[i].name,
                    description: LoadedManifest.queryScopes[i].description
                });
            }

            return this.collectionQueryScopes.concat(scopes);
        }

        return this.collectionQueryScopes;
    }

    getBlueprintFields(collections: string[]): IBlueprintField[] {
        let fieldsToReturn: IBlueprintField[] = [];

        for (let i = 0; i < collections.length; i++) {
            const collectionName = collections[i],
                collectionDetails = this.getCollectionDetails(collectionName);

            fieldsToReturn = fieldsToReturn.concat(AugmentationManager.getCollectionFields(collectionName));

            if (collectionDetails != null && collectionDetails.viewModel != null) {
                const viewModel = ViewModelManager.getViewModelFields(collectionDetails.viewModel);

                if (viewModel.length > 0) {
                    fieldsToReturn = fieldsToReturn.concat(viewModel);
                }
            }

            if (collectionDetails != null && collectionDetails.injectFields != null) {
                for (let j = 0; j < collectionDetails.injectFields.length; j++) {
                    fieldsToReturn.push({
                        blueprintName: '*inject',
                        displayName: collectionDetails.injectFields[j],
                        import: null,
                        instructionText: null,
                        maxItems: null,
                        name: collectionDetails.injectFields[i],
                        refFieldSetField: null,
                        sets: null,
                        type: '*'
                    });
                }
            }

            if (this.fields.has(collectionName)) {
                const potentialFields = this.fields.get(collectionName);

                if (typeof potentialFields !== 'undefined' && potentialFields !== null) {
                    fieldsToReturn = fieldsToReturn.concat(potentialFields);
                }
            }
        }

        return fieldsToReturn;
    }

    getBlueprintField(collectionName: string, handle: string): IBlueprintField | null {
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

    getTaxonomyBlueprintFields(taxonomies: string[]): IBlueprintField[] {
        let fieldsToReturn: IBlueprintField[] = [];

        for (let i = 0; i < taxonomies.length; i++) {
            const taxonomyName = taxonomies[i];

            if (this.taxonomies.has(taxonomyName)) {
                const potentialFields = this.taxonomies.get(taxonomyName);

                if (typeof potentialFields !== 'undefined' && potentialFields !== null) {
                    fieldsToReturn = fieldsToReturn.concat(potentialFields);
                }
            }
        }

        return fieldsToReturn;
    }

    getUserFields(): IBlueprintField[] {
        if (this.miscFields.has('user')) {
            return this.miscFields.get('user') as IBlueprintField[];
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
        if (LoadedManifest != null) {
            return LoadedManifest.config.assetPresets;
        }

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

            if (typeof fields === 'undefined' || fields === null) {
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

    findView(documentUri: string): IView | null {
        if (documentUri.trim() == '') {
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

    findPartial(partialName: string): IView | null {
        for (let i = 0; i < this.views.length; i++) {
            if (this.views[i].isPartial && this.views[i].displayName == partialName) {
                return this.views[i];
            }
        }

        return null;
    }

}

export interface IAssets {
    handle: string,
    title: string,
    diskName: string
}

export interface IStructure {
    root: boolean,
    maxDepth: number
}

export interface ICollection {
    handle: string,
    title: string,
    template: string,
    layout: string,
    isStructure: boolean,
    taxonomies: string[],
    structure: IStructure | null,
    viewModel: string | null,
    injectFields: string[]
}

export interface INavigation {
    handle: string,
    title: string
}

export interface IUserGroup {
    handle: string,
    title: string
}

export interface IUserRole {
    handle: string,
    title: string
}

export interface IView {
    /**
     * The normalized path to the template file.
     */
    path: string,
    /**
     * The relative file name on disk.
     */
    relativeFileName: string,
    /**
     * A display name constructed from the relative file path and file name.
     */
    relativeDisplayName: string,
    /**
     * A collection of view data variables.
     *
     * @see https://statamic.dev/template-engines#view-data
     */
    viewDataVariables: string[],
    viewDataDocument: any,
    /**
     * The normalizerd relative path to the file.
     */
    relativePath: string,
    /**
     * A list of collections (or blueprints) the template file injects into the scope context.
     */
    injectsCollections: string[],
    /**
     * The file name (including extension) of the template.
     */
    fileName: string,
    /**
     * The adjusted document URI of the template.
     */
    documentUri: string,
    /**
     * The original document URI presented to the internal systems.
     */
    originalDocumentUri: string,
    /**
     * A friendly display name for the template.
     */
    displayName: string,
    /**
     * Indicates if the template is an Antlers partial.
     */
    isPartial: boolean,
    /**
     * Indicates if the template is an Antlers file.
     */
    isAntlers: boolean,
    /**
     * Indicates if the template is a Blade file.
     */
    isBlade: boolean,
	injectsParameters:IAntlersParameter[],
	varReferenceNames: Map<string, string>
}

const MockStructure: IStatamicStructure = {
    isMocked: true,
    rootPath: '',
    workingDirectory: '',
    assets: new Map(),
    assetFields: new Map(),
    globalBlueprintsPath: '',
    oauthProviders: [],
    fieldsetsPath: '',
    collections: new Map(),
    collectionScopes: [],
    viewsPath: '',
    collectionBlueprintsPath: '',
    formBlueprintsPath: '',
    contentDirectory: '',
    taxonomyContentDirectory: '',
    taxonomiesBlueprintsPath: '',
    taxonomyPluralizedMapping: new Map(),
    taxonomyTerms: new Map(),
    globalFiles: [],
    fieldsets: new Map(),
    miscBlueprintsPath: '',
    blueprintFiles: [],
    collectionNames: [],
    forms: new Map(),
    globals: new Map(),
    taxonomies: new Map(),
    taxonomyNames: [],
    fields: new Map(),
    miscFields: new Map(),
    templates: [],
    views: [],
    partialCache: [],
    partialViewNames: [],
    hasMacrosFile: false,
    macroFilePath: '',

    composerPackages: [],
    statamicPackage: null,

    navigationMenus: new Map(),
    searchIndexes: [],
    userPermissionsPath: '',
    userRoles: new Map(),
    userRoleNames: [],
    userGroups: new Map(),
    userGroupNames: [],

    internalFieldReference: []
};

const MockProject = new StatamicProject(MockStructure);

export { MockProject };

function getRootProjectPath(path: string): string {
    const parts = normalizePath(path).split('/');
    const newParts = [];
    let lastPart = null;

    for (let i = 0; i < parts.length; i++) {
        if (i == 0) {
            lastPart = parts[i];
            newParts.push(parts[i]);
            continue;
        }

        if (parts[i] == 'views' && lastPart == 'resources') {
            break;
        }

        newParts.push(parts[i]);
        lastPart = parts[i];
    }

    return newParts.join('/');
}

function getLaravelRoot(root: string): string {
    if (root.endsWith('/') == false) {
        root = root + '/';
    }
    return root + '../';
}

function getComposerLockFile(laravelRoot: string): string {
    return laravelRoot + 'composer.lock';
}

function getComposerVendorDirectory(laravelRoot: string): string {
    return laravelRoot + 'vendor/';
}

function makeCollectionsDirectory(root: string): string {
    return root + '/blueprints/collections/';
}

function makeTaxonomyBlueprintsDirectory(root: string): string {
    return root + '/blueprints/taxonomies/';
}

function makeAssetsBlueprintDirectory(root: string): string {
    return root + '/blueprints/assets/';
}

function makeGlobalSettingsBlueprintsDirectory(root: string): string {
    return root + '/blueprints/globals/';
}

function makeFormsBlueprintsDirectory(root: string): string {
    return root + '/blueprints/forms/';
}

function makeMiscBlueprintsDirectory(root: string): string {
    return root + '/blueprints/';
}

function makeMacroFilePath(root: string): string {
    return root + '/macros.yaml';
}

function makeViewsDirectory(root: string): string {
    return root + '/views/';
}

function makeUserPermissionsDirectory(root: string): string {
    return root + '/users/';
}

function makeFormsDirectory(root: string): string {
    return root + '/forms/';
}

function makeFieldsetsDirectory(root: string): string {
    return root + '/fieldsets';
}

function makeContentDirectory(root: string): string {
    return root + '/../content/';
}

function makeAssetsContentDirectory(root: string): string {
    return makeContentDirectory(root) + 'assets/';
}

function makeCollectionsContentDirectory(root: string): string {
    return makeContentDirectory(root) + 'collections/';
}

function makeTaxonomyTermsDirectory(root: string): string {
    return makeContentDirectory(root) + 'taxonomies/';
}

function makeNavigationDirectory(root: string): string {
    return makeContentDirectory(root) + 'navigation/';
}

function getFiles(startPath: string, filter: string, foundFiles: string[]): string[] {
    if (!fs.existsSync(startPath)) {
        return [];
    }

    let returnFiles = foundFiles || [];
    const files = fs.readdirSync(startPath);

    for (let i = 0; i < files.length; i++) {
        const filename = path.join(startPath, files[i]);
        const stat = fs.lstatSync(filename);

        if (stat.isDirectory()) {
            returnFiles = returnFiles.concat(getFiles(filename, filter, foundFiles));
        } else if (filename.indexOf(filter) >= 0) {
            returnFiles.push(filename);
        }
    }

    return [...new Set(returnFiles)];
}

export function getDirectFiles(startPath: string, filter: string): string[] {
    if (!fs.existsSync(startPath)) {
        return [];
    }

    const returnFiles = [];
    const files = fs.readdirSync(startPath);

    for (let i = 0; i < files.length; i++) {
        const filename = path.join(startPath, files[i]);
        const stat = fs.lstatSync(filename);

        if (stat.isDirectory() == false) {
            returnFiles.push(filename);
        }
    }

    return [...new Set(returnFiles)];
}

function getProjectViews(viewPath: string): IView[] {
    const files = getFiles(viewPath, '.html', []),
        sourcePathLen = viewPath.length,
        views: IView[] = [];

    for (let i = 0; i < files.length; i++) {
        const thisFile = files[i],
            relativePath = thisFile.substr(sourcePathLen),
            relativeDirName: string = normalizePath(path.dirname(relativePath)),
            fileName: string = path.basename(relativePath);
        let workingFileName: string = fileName,
            isPartial = false,
            isAntlers = false,
            isBlade = false,
            displayName = '',
            viewDataVariables: string[] = [],
            viewDataDoc: any = null;

        // Allows non .antlers.html files to be flagged as partials.
        if (fileName.startsWith('_')) {
            isPartial = true;
            workingFileName = workingFileName.substr(1);
        }

        if (fileName.endsWith('.antlers.html')) {
            isAntlers = true;

            workingFileName = workingFileName.substr(0, workingFileName.length - 13);

            const contents = fs.readFileSync(thisFile, { encoding: 'utf8' });

            if (contents.startsWith('---')) {
                try {
                    const parsedDocument = YAML.parseAllDocuments(contents);

                    if (typeof parsedDocument !== 'undefined' && parsedDocument !== null) {
                        if (parsedDocument.length > 0) {
                            const frontMatter = parsedDocument[0];
                            const docVars = frontMatter.toJSON();
                            viewDataDoc = docVars;
                            viewDataVariables = Object.keys(docVars);
                        }
                    }
                } catch (e) {
                    // Just move on to prevent bad YAML docs
                    // from bringing down the entire thing.
                }
            }
        } else if (fileName.endsWith('.blade.php')) {
            isAntlers = false;
            isBlade = true;
        } else {
            isAntlers = false;
            isBlade = false;
        }

        if (relativeDirName != '.') {
            displayName = relativeDirName + '/' + workingFileName;
        } else {
            displayName = workingFileName;
        }

        views.push({
            displayName: workingFileName,
            fileName: fileName,
            documentUri: encodeURIComponent(convertPathToUri(thisFile)),
            originalDocumentUri: convertPathToUri(thisFile),
            isAntlers: isAntlers,
            isBlade: isBlade,
            isPartial: isPartial,
            path: normalizePath(thisFile),
            relativeDisplayName: displayName,
            relativeFileName: fileName,
            relativePath: relativePath,
            viewDataVariables: viewDataVariables,
            injectsCollections: [],
            injectsParameters: [],
            varReferenceNames: new Map(),
            viewDataDocument: viewDataDoc
        });
    }

    return views;
}

export function getProjectStructure(resourcePath: string): StatamicProject {
    const projectPath = getRootProjectPath(resourcePath),
        collectionsDirectory = makeCollectionsDirectory(projectPath),
        viewsDirectory = makeViewsDirectory(projectPath),
        formsDirectory = makeFormsDirectory(projectPath),
        formsBlueprintDirectory = makeFormsBlueprintsDirectory(projectPath),
        fieldsetsDirectory = makeFieldsetsDirectory(projectPath),
        taxonomiesDirectory = makeTaxonomyBlueprintsDirectory(projectPath),
        globalSettingsDirectory = makeGlobalSettingsBlueprintsDirectory(projectPath),
        miscBlueprintsDirectory = makeMiscBlueprintsDirectory(projectPath),
        contentDirectory = makeContentDirectory(projectPath),
        navigationDirectory = makeNavigationDirectory(projectPath),
        taxonomyContentDirectory = makeTaxonomyTermsDirectory(projectPath),
        userPermissionsDirectory = makeUserPermissionsDirectory(projectPath),
        collectionContentDirectory = makeCollectionsContentDirectory(projectPath),
        assetsContentDirectory = makeAssetsContentDirectory(projectPath),
        assetsBlueprintDirectory = makeAssetsBlueprintDirectory(projectPath),

        blueprintsPaths = getFiles(collectionsDirectory, '.yaml', []),
        projectViews = getProjectViews(viewsDirectory),
        macroFilePath = makeMacroFilePath(projectPath),
        laravelRoot = getLaravelRoot(projectPath),
        composerLock = getComposerLockFile(laravelRoot),
        vendorDirectory = getComposerVendorDirectory(laravelRoot);
    let hasMacroFile = false;

    let statamicPackage: IComposerPackage | null = null;

    const composerPackages = LockFileParser.getInstalledPackages(composerLock, laravelRoot, vendorDirectory);

    for (let i = 0; i < composerPackages.length; i++) {
        if (composerPackages[i].name == 'statamic/cms') {
            statamicPackage = composerPackages[i];
            break;
        }
    }

    const fieldsets: Map<string, IFieldsetField[]> = new Map();
    const pluralizedTaxonomyNames: Map<string, string> = new Map();
    const formsMapping: Map<string, IBlueprintField[]> = new Map();
    const globalsMapping: Map<string, IBlueprintField[]> = new Map();
    const taxonomyMapping: Map<string, IBlueprintField[]> = new Map();
    const miscFields: Map<string, IBlueprintField[]> = new Map();
    const templates: ITemplate[] = [];
    const fieldMapping: Map<string, IBlueprintField[]> = new Map();
    const discoveredCollectionNames: string[] = [];
    const discoveredTaxonomyNames: string[] = [];
    const partialCache: IView[] = [];
    const partialNames: string[] = [];
    const collectionScopes: ICollectionScope[] = [];
    const taxonomyTerms: Map<string, string[]> = new Map();

    const userGroups: Map<string, IUserGroup> = new Map(),
        userGroupNames: string[] = [],
        userRoles: Map<string, IUserRole> = new Map(),
        userRoleNames: string[] = [],
        navigationItems: Map<string, INavigation> = new Map(),
        collections: Map<string, ICollection> = new Map(),
        assets: Map<string, IAssets> = new Map(),
        assetFields: Map<string, IBlueprintField[]> = new Map();

    if (macroFilePath.trim().length > 0) {
        hasMacroFile = fs.existsSync(macroFilePath);
    }

    // Views.

    for (let i = 0; i < projectViews.length; i++) {
        if (projectViews[i].isPartial) {
            partialCache.push(projectViews[i]);
            partialNames.push(projectViews[i].relativeDisplayName);
        }
    }

    // Assets.
    const assetPaths = getDirectFiles(assetsContentDirectory, '.yaml');

    for (let i = 0; i < assetPaths.length; i++) {
        if (shouldProcessPath(assetPaths[i])) {
            const asset = getProjectAssets(assetPaths[i]);

            assets.set(asset.handle, asset);
        }
    }

    // Collection details.
    const collectionPaths = getDirectFiles(collectionContentDirectory, '.yaml');

    for (let i = 0; i < collectionPaths.length; i++) {
        if (shouldProcessPath(collectionPaths[i])) {
            const collection = getCollectionDetails(collectionPaths[i]);

            collections.set(collection.handle, collection);
        }
    }

    // User roles and groups.
    const rolesPath = userPermissionsDirectory + 'roles.yaml',
        groupsPath = userPermissionsDirectory + 'groups.yaml';

    if (fs.existsSync(rolesPath)) {
        const roles = getUserRoles(rolesPath);

        for (let i = 0; i < roles.length; i++) {
            userRoles.set(roles[i].handle, roles[i]);
            userRoleNames.push(roles[i].handle);
        }
    }

    if (fs.existsSync(groupsPath)) {
        const groups = getUserGroups(groupsPath);

        for (let i = 0; i < groups.length; i++) {
            userGroups.set(groups[i].handle, groups[i]);
            userGroupNames.push(groups[i].handle);
        }
    }

    // Gather up the fieldsets.
    const fieldsetPaths = getFiles(fieldsetsDirectory, '.yaml', []);
    let allBlueprintFields: IBlueprintField[] = [];

    for (let i = 0; i < fieldsetPaths.length; i++) {
        if (shouldProcessPath(fieldsetPaths[i])) {
            const fieldsetName = path.basename(fieldsetPaths[i]).split('.').slice(0, -1).join('.');

            if (fieldsetName != null && fieldsetName.trim().length > 0) {
                const fields = getFieldsetFields(fieldsetPaths[i], fieldsetName);

                fieldsets.set(fieldsetName, fields);
            }
        }
    }

    // Taxonomies.
    const taxonomyPaths = getFiles(taxonomiesDirectory, '.yaml', []);

    for (let i = 0; i < taxonomyPaths.length; i++) {
        if (shouldProcessPath(taxonomyPaths[i])) {
            const taxonomyName = path.basename(taxonomyPaths[i]).split('.').slice(0, -1).join('.'),
                pluralForm = path.basename(path.dirname(taxonomyPaths[i]));

            if (taxonomyName != null && taxonomyName.trim().length > 0) {
                pluralizedTaxonomyNames.set(taxonomyName, pluralForm);

                const fields = getBlueprintFields(taxonomyPaths[i], taxonomyName, fieldsets);

                taxonomyMapping.set(taxonomyName, fields);
                allBlueprintFields = allBlueprintFields.concat(fields);

                if (discoveredTaxonomyNames.includes(taxonomyName) == false) {
                    discoveredTaxonomyNames.push(taxonomyName);
                }
            }
        }
    }

    // Build up a list of relevant taxonomy terms.
    if (discoveredTaxonomyNames.length > 0) {

        for (let i = 0; i < discoveredTaxonomyNames.length; i++) {
            // We need to locate the plural form to use instead
            // "topic" becomes "topics" - so we need to use
            // that when we build a basic list of terms.
            if (pluralizedTaxonomyNames.has(discoveredTaxonomyNames[i])) {
                const pluralTaxonomyName = pluralizedTaxonomyNames.get(discoveredTaxonomyNames[i]);

                if (typeof pluralTaxonomyName !== 'undefined' && pluralTaxonomyName !== null) {
                    const termLocation = taxonomyContentDirectory + pluralTaxonomyName + '/';

                    if (fs.existsSync(termLocation)) {
                        const terms = getDirectFiles(termLocation, '.yaml'),
                            discoveredTerms: string[] = [];

                        for (let j = 0; j < terms.length; j++) {
                            if (shouldProcessPath(terms[j])) {
                                const termName = path.basename(terms[j]).split('.').slice(0, -1).join('.');

                                discoveredTerms.push(termName);
                            }
                        }

                        taxonomyTerms.set(discoveredTaxonomyNames[i], discoveredTerms);
                    }
                }
            }
        }
    }

    // Base level blueprints.
    const miscBlueprintPaths = getDirectFiles(miscBlueprintsDirectory, '.yaml');

    for (let i = 0; i < miscBlueprintPaths.length; i++) {
        if (shouldProcessPath(miscBlueprintPaths[i])) {
            const blueprintName = path.basename(miscBlueprintPaths[i]).split('.').slice(0, -1).join('.');

            if (blueprintName != null && blueprintName.trim().length > 0) {
                const fields = getBlueprintFields(miscBlueprintPaths[i], blueprintName, fieldsets);

                miscFields.set(blueprintName, fields);
                allBlueprintFields = allBlueprintFields.concat(fields);
            }
        }
    }

    for (let i = 0; i < blueprintsPaths.length; i++) {
        if (shouldProcessPath(blueprintsPaths[i])) {
            let blueprintName = path.basename(blueprintsPaths[i]).split('.').slice(0, -1).join('.');
            const fields = getBlueprintFields(blueprintsPaths[i], blueprintName, fieldsets);
            const collectionName = normalizePath(dirname(blueprintsPaths[i])).split('/').pop();

            allBlueprintFields = allBlueprintFields.concat(fields);

            if (collectionName != null && collectionName.trim().length > 0) {
                blueprintName = collectionName;
                if (discoveredCollectionNames.includes(collectionName) == false) {
                    discoveredCollectionNames.push(collectionName);
                }
            }

            fieldMapping.set(blueprintName, fields);
        }
    }

    // Navigation
    const navPaths = getDirectFiles(navigationDirectory, '.yaml');

    for (let i = 0; i < navPaths.length; i++) {
        if (shouldProcessPath(navPaths[i])) {
            const navigationMenu = getNavigationMenu(navPaths[i]);

            navigationItems.set(navigationMenu.handle, navigationMenu);
        }
    }

    // Globals.
    const globalBlueprintPaths = getDirectFiles(globalSettingsDirectory, '.yaml');

    for (let i = 0; i < globalBlueprintPaths.length; i++) {
        if (shouldProcessPath(globalBlueprintPaths[i])) {
            const globalName = path.basename(globalBlueprintPaths[i]).split('.').slice(0, -1).join('.'),
                fields = getBlueprintFields(globalBlueprintPaths[i], globalName, fieldsets);

            allBlueprintFields = allBlueprintFields.concat(fields);

            globalsMapping.set(globalName, fields);
        }
    }

    // Asset Fields.
    if (fs.existsSync(assetsBlueprintDirectory)) {
        const assetBlueprintPathts = getDirectFiles(assetsBlueprintDirectory, '.yaml');

        for (let i = 0; i < assetBlueprintPathts.length; i++) {
            if (shouldProcessPath(assetBlueprintPathts[i])) {
                const assetName = path.basename(assetBlueprintPathts[i]).split('.').slice(0, -1).join('.'),
                    fields = getBlueprintFields(assetBlueprintPathts[i], assetName, fieldsets);

                allBlueprintFields = allBlueprintFields.concat(fields);
                assetFields.set(assetName, fields);
            }
        }
    }

    // Forms.
    const formBlueprintPaths = getDirectFiles(formsBlueprintDirectory, '.yaml'),
        allFormDefinitions = getDirectFiles(formsDirectory, '.yaml'),
        formNames: string[] = [];

    for (let i = 0; i < allFormDefinitions.length; i++) {
        if (shouldProcessPath(allFormDefinitions[i])) {
            const formName = path.basename(allFormDefinitions[i]).split('.').slice(0, -1).join('.');

            if (!formNames.includes(formName)) {
                formNames.push(formName);
            }
        }
    }

    for (let i = 0; i < formBlueprintPaths.length; i++) {
        if (shouldProcessPath(formBlueprintPaths[i])) {
            const formName = path.basename(formBlueprintPaths[i]).split('.').slice(0, -1).join('.'),
                fields = getBlueprintFields(formBlueprintPaths[i], formName, fieldsets);

            allBlueprintFields = allBlueprintFields.concat(fields);
            formsMapping.set(formName, fields);
        }
    }

    for (let i = 0; i < formNames.length; i++) {
        if (!formsMapping.has(formNames[i])) {
            formsMapping.set(formNames[i], []);
        }
    }

    const projectViewMap: Map<string, IView> = new Map();

    for (let i = 0; i < projectViews.length; i++) {
        projectViewMap.set(projectViews[i].relativeDisplayName, projectViews[i]);
    }

    collections.forEach((collection: ICollection, collectionName: string) => {
        if (collection.template.trim().length > 0 && projectViewMap.has(collection.template)) {
            const refView = projectViewMap.get(collection.template) as IView;

            refView.injectsCollections.push(collection.handle);
        }
    });

    return new StatamicProject({
        composerPackages: composerPackages,
        statamicPackage: statamicPackage,
        isMocked: false,
        workingDirectory: laravelRoot,
        taxonomyPluralizedMapping: pluralizedTaxonomyNames,
        collectionScopes: collectionScopes,
        blueprintFiles: blueprintsPaths,
        collectionBlueprintsPath: collectionsDirectory,
        collections: collections,
        rootPath: projectPath,
        fields: fieldMapping,
        fieldsetsPath: fieldsetsDirectory,
        fieldsets: fieldsets,
        collectionNames: discoveredCollectionNames,
        formBlueprintsPath: formsDirectory,
        taxonomiesBlueprintsPath: taxonomiesDirectory,
        globalBlueprintsPath: globalSettingsDirectory,
        miscBlueprintsPath: miscBlueprintsDirectory,
        viewsPath: viewsDirectory,
        views: projectViews,
        globalFiles: [],
        forms: formsMapping,
        globals: globalsMapping,
        miscFields: miscFields,
        taxonomies: taxonomyMapping,
        taxonomyNames: discoveredTaxonomyNames,
        templates: templates,
        partialCache: partialCache,
        partialViewNames: partialNames,
        macroFilePath: macroFilePath,
        hasMacrosFile: hasMacroFile,
        contentDirectory: contentDirectory,
        taxonomyContentDirectory: taxonomyContentDirectory,
        taxonomyTerms: taxonomyTerms,

        assets: assets,
        assetFields: assetFields,
        oauthProviders: [],
        navigationMenus: navigationItems,

        userPermissionsPath: userPermissionsDirectory,
        userGroupNames: userGroupNames,
        userGroups: userGroups,
        userRoleNames: userRoleNames,
        userRoles: userRoles,
        searchIndexes: [],

        internalFieldReference: allBlueprintFields
    });
}
