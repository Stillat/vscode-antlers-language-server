import { IAntlersTag } from '../antlers/tagManager.js';
import { IComposerPackage } from '../composer/composerPackage.js';
import { IBlueprintField } from './blueprints/fields.js';
import { ICollection } from './collections/collection.js';
import { ICollectionScope } from './collections/collectionScope.js';
import { IStatamicStructure } from './statamicStructure.js';
import { IView } from './views/view.js';

export interface IProjectDetailsProvider {
    reloadDetails(): IProjectDetailsProvider,
    getWorkingDirectory(): string,
    getProjectRoot(): string,
    getOAuthProviders(): string[],
    getSiteNames(): string[],
    getSearchIndexes(): string[],
    getCustomModifierNames(): string[],
    getStatamicVersion(): string,
    hasComposerPackage(packageName: string): boolean,
    hasStatamicAddon(addonName: string): boolean,
    getAddonDetails(addonName: string): IComposerPackage | null,
    getComposerPackages(): Map<string, IComposerPackage>,
    getComposerPackageDetails(packageName: string): IComposerPackage | null,
    getPartials(): IView[],
    getBlueprintDetails(handle: string): IBlueprintField[],
    getBlueprintNames(): string[],
    hasViewCollectionInjections(documentUri: string): boolean,
    getCollectionNames(): string[],
    getCollectionNamesForView(documentUri: string): string[],
    getPublicAssetPaths(): string[],
    getViewPath(): string,
    getTaxonomyTerms(name: string): string[],
    hasTaxonomy(name: string): boolean,
    getCollectionQueryScopes(): ICollectionScope[],
    getCustomAntlersTags():IAntlersTag[],
    findQueryScopeByHandle(handle: string): ICollectionScope | null,
    getBlueprintFields(collections: string[]): IBlueprintField[],
    getBlueprintField(collectionName: string, handle: string): IBlueprintField | null,
    getTaxonomyBlueprintFields(taxonomies: string[]): IBlueprintField[],
    getUserFields(): IBlueprintField[],
    getAssetBlueprintFields(handle: string): IBlueprintField[],
    getUniqueTaxonomyNames(): string[],
    getUniqueCollectionNames(): string[],
    getUniquePartialNames(): string[],
    getUniqueUserGroupNames(): string[],
    getUniqueUserRoleNames(): string[],
    getUniqueFormNames(): string[],
    getAssetPresets(): string[],
    getUniqueGlobalsNames(): string[],
    getUniqueNavigationMenuNames(): string[],
    getUniqueAssetNames(): string[],
    getCollectionDetails(handle: string): ICollection | null,
    getFormBlueprintFields(handle: string): IBlueprintField[],
    getRouteNames(): string[],
    getTranslationKeys(): string[],
    getViews(): IView[],
    getTemplateNames(): string[],
    findView(documentUri: string): IView | null,
    findRelativeView(relativeName: string): IView | null,
    findPartial(partialName: string): IView | null,
    getFields(): Map<string, IBlueprintField[]>
    export(): IStatamicStructure,
    findAnyBlueprintField(field: string): IBlueprintField | null
}