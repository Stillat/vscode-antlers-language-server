import { IComposerPackage } from '../composer/composerPackage';
import { IAssets } from './assets/asset';
import { IBlueprintField } from './blueprints/fields';
import { ICollection } from './collections/collection';
import { ICollectionScope } from './collections/collectionScope';
import { IFieldsetField } from './fieldsets/fieldset';
import { INavigation } from './navigations/navigation';
import { ITemplate } from './templates';
import { IUserRole, IUserGroup } from './users/users';
import { IView } from './views/view';

interface IStatamicStructure {
    isMocked: boolean;
    rootPath: string;
    fieldsetsPath: string;
    viewsPath: string;
    contentDirectory: string;
    taxonomyContentDirectory: string;
    collectionBlueprintsPath: string;
    formBlueprintsPath: string;
    globalBlueprintsPath: string;
    miscBlueprintsPath: string;
    taxonomiesBlueprintsPath: string;
    userPermissionsPath: string;
    composerPackages: IComposerPackage[];
    statamicPackage: IComposerPackage | null;

    searchIndexes: string[];

    assets: Map<string, IAssets>;
    assetFields: Map<string, IBlueprintField[]>;

    collections: Map<string, ICollection>;
    collectionScopes: ICollectionScope[];

    oauthProviders: string[];

    hasMacrosFile: boolean;
    macroFilePath: string;
    globalFiles: string[];
    blueprintFiles: string[];

    collectionNames: string[];
    fieldsets: Map<string, IFieldsetField[]>;
    forms: Map<string, IBlueprintField[]>;
    globals: Map<string, IBlueprintField[]>;
    taxonomies: Map<string, IBlueprintField[]>;
    taxonomyPluralizedMapping: Map<string, string>;
    taxonomyTerms: Map<string, string[]>;
    taxonomyNames: string[];
    fields: Map<string, IBlueprintField[]>;
    miscFields: Map<string, IBlueprintField[]>;
    templates: ITemplate[];
    views: IView[];
    partialCache: IView[];
    partialViewNames: string[];

    navigationMenus: Map<string, INavigation>;
    workingDirectory: string;
    userRoles: Map<string, IUserRole>;
    userRoleNames: string[];
    userGroups: Map<string, IUserGroup>;
    userGroupNames: string[];
    internalFieldReference: IBlueprintField[];
    restoreProperties: IStructureRestore | null;
}

interface IStructureRestore {
    globalFiles: string[];
    blueprintFiles: string[];
    collectionNames: string[];

    collections: Map<string, ICollection>;
    fieldsets: Map<string, IFieldsetField[]>;
    forms: Map<string, IBlueprintField[]>;
    globals: Map<string, IBlueprintField[]>;
    taxonomies: Map<string, IBlueprintField[]>;
    fields: Map<string, IBlueprintField[]>;
    miscFields: Map<string, IBlueprintField[]>;
    blueprintRef: Map<string, IBlueprintField[]>;
    blueprintCollectionRef: Map<string, string>;

    templates: ITemplate[];
    views: IView[];
    partialCache: IView[];
    partialViewNames: string[];
    taxonomyNames: string[];
    collectionQueryScopes: ICollectionScope[];
    taxonomyTerms: Map<string, string[]>;
    assets: Map<string, IAssets>;
    userGroups: Map<string, IUserGroup>;
    userRoles: Map<string, IUserGroup>;
    navigationMenus: Map<string, INavigation>;

    viewMap: Map<string, IView>;
    routeNames: string[];
    translationKeys: string[];
    uniqueFormNames: string[];
    uniquePartialViewNames: string[];
    uniqueCollectionNames: string[];
    uniqueTaxonomyNames: string[];
    uniqueUserGroups: string[];
    uniqueUserRoles: string[];
    uniqueGlobalSettingNames: string[];
    uniqueNavigationNames: string[];
    uniqueAssetNames: string[];
    publicAssets: string[];
    packageMapping: Map<string, IComposerPackage>;
    statamicAddonMapping: Map<string, IComposerPackage>;
    blueprintFieldReference: IBlueprintField[];
    baseResourcePath: string;
}

const MockStructure: IStatamicStructure = {
    isMocked: true,
    rootPath: "",
    workingDirectory: "",
    assets: new Map(),
    assetFields: new Map(),
    globalBlueprintsPath: "",
    oauthProviders: [],
    fieldsetsPath: "",
    collections: new Map(),
    collectionScopes: [],
    viewsPath: "",
    collectionBlueprintsPath: "",
    formBlueprintsPath: "",
    contentDirectory: "",
    taxonomyContentDirectory: "",
    taxonomiesBlueprintsPath: "",
    taxonomyPluralizedMapping: new Map(),
    taxonomyTerms: new Map(),
    globalFiles: [],
    fieldsets: new Map(),
    miscBlueprintsPath: "",
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
    macroFilePath: "",

    composerPackages: [],
    statamicPackage: null,

    navigationMenus: new Map(),
    searchIndexes: [],
    userPermissionsPath: "",
    userRoles: new Map(),
    userRoleNames: [],
    userGroups: new Map(),
    userGroupNames: [],

    internalFieldReference: [],
    restoreProperties: null
};

export { MockStructure, IStatamicStructure, IStructureRestore };
