import * as path from "path";
import * as fs from "fs";
import * as YAML from 'yaml';

import { dirname } from "path";
import { IComposerPackage } from '../../composer/composerPackage';
import { LockFileParser } from '../../composer/lockFileParser';
import { convertPathToUri, shouldProcessPath } from '../../utils/io';
import { IAssets } from '../assets/asset';
import { IBlueprint, IBlueprintField } from '../blueprints/fields';
import { ICollection } from '../collections/collection';
import { ICollectionScope } from '../collections/collectionScope';
import { IFieldsetField } from '../fieldsets/fieldset';
import { INavigation } from '../navigations/navigation';
import { ITemplate } from '../templates';
import { IUserGroup, IUserRole } from '../users/users';
import { IView } from '../views/view';
import { getBlueprintFields } from './blueprints';
import { getFieldsetFields } from './fieldsets';
import { getNavigationMenu } from './navigationMenus';
import { getProjectAssets } from './projectAssets';
import { getCollectionDetails } from './projectCollections';
import { getUserRoles, getUserGroups } from './userPermissions';
import { IProjectDetailsProvider } from '../projectDetailsProvider';
import { JsonSourceProject } from '../jsonSourceProject';
import { normalizePath } from '../../utils/uris';
import { replaceAllInString } from '../../utils/strings';
import { sendProjectDetails } from '../../server';
import { FieldSetParser, BlueprintParser, IParsedBlueprint } from '../structuredFieldTypes/types';
import { EnsureFields } from '../structuredFieldTypes/ensureFields';
import { HandleableClassParser } from '../../php/handleableClassParser';
import { IAntlersTag } from '../../antlers/tagManager';
import { ISuggestionRequest } from '../../suggestions/suggestionRequest';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { StringUtilities } from '../../runtime/utilities/stringUtilities';
import { makeTagDoc } from '../../documentation/utils';

function getRootProjectPath(path: string): string {
    const parts = normalizePath(path).split("/");
    const newParts = [];
    let lastPart = null;

    for (let i = 0; i < parts.length; i++) {
        if (i == 0) {
            lastPart = parts[i];
            newParts.push(parts[i]);
            continue;
        }

        if (parts[i] == "views" && lastPart == "resources") {
            break;
        }

        newParts.push(parts[i]);
        lastPart = parts[i];
    }

    return newParts.join("/");
}

function getLaravelRoot(root: string): string {
    if (root.endsWith("/") == false) {
        root = root + "/";
    }
    return root + "../";
}

function getComposerLockFile(laravelRoot: string): string {
    return laravelRoot + "composer.lock";
}

function getAppDirectory(laravelRoot: string): string {
    return laravelRoot + "app/";
}

function getQueryScopesDirectory(laravelRoot: string): string {
    return getAppDirectory(laravelRoot) + "Scopes/";
}

function getModifiersDirectory(laravelRoot: string): string {
    return getAppDirectory(laravelRoot) + "Modifiers/";
}

function getTagsDirectory(laravelRoot: string): string {
    return getAppDirectory(laravelRoot) + "Tags/";
}

function getComposerVendorDirectory(laravelRoot: string): string {
    return laravelRoot + "vendor/";
}

function makeCollectionsDirectory(root: string): string {
    return root + "/blueprints/collections/";
}

function makeTaxonomyBlueprintsDirectory(root: string): string {
    return root + "/blueprints/taxonomies/";
}

function makeAssetsBlueprintDirectory(root: string): string {
    return root + "/blueprints/assets/";
}

function makeGlobalSettingsBlueprintsDirectory(root: string): string {
    return root + "/blueprints/globals/";
}

function makeFormsBlueprintsDirectory(root: string): string {
    return root + "/blueprints/forms/";
}

function makeMiscBlueprintsDirectory(root: string): string {
    return root + "/blueprints/";
}

function makeMacroFilePath(root: string): string {
    return root + "/macros.yaml";
}

function makeViewsDirectory(root: string): string {
    return root + "/views/";
}

function makeUserPermissionsDirectory(root: string): string {
    return root + "/users/";
}

function makeFormsDirectory(root: string): string {
    return root + "/forms/";
}

function makeFieldsetsDirectory(root: string): string {
    return root + "/fieldsets";
}

function makeContentDirectory(root: string): string {
    return root + "/../content/";
}

function makeAssetsContentDirectory(root: string): string {
    return makeContentDirectory(root) + "assets/";
}

function makeCollectionsContentDirectory(root: string): string {
    return makeContentDirectory(root) + "collections/";
}

function makeTaxonomyTermsDirectory(root: string): string {
    return makeContentDirectory(root) + "taxonomies/";
}

function makeNavigationDirectory(root: string): string {
    return makeContentDirectory(root) + "navigation/";
}

function getFiles(
    startPath: string,
    filter: string,
    foundFiles: string[]
): string[] {
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

function getDirectFiles(startPath: string, filter: string): string[] {
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
    const files = getFiles(viewPath, ".html", []),
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
            displayName = "";

        // Allows non .antlers.html files to be flagged as partials.
        if (fileName.startsWith("_")) {
            isPartial = true;
            workingFileName = workingFileName.substr(1);
        }

        if (fileName.endsWith(".antlers.html")) {
            isAntlers = true;

            workingFileName = workingFileName.substr(0, workingFileName.length - 13);
        } else if (fileName.endsWith(".blade.php")) {
            isAntlers = false;
            isBlade = true;
        } else {
            isAntlers = false;
            isBlade = false;
        }

        if (relativeDirName != ".") {
            displayName = relativeDirName + "/" + workingFileName;
        } else {
            displayName = workingFileName;
        }

        views.push({
            displayName: workingFileName,
            fileName: fileName,
            documentUri: convertPathToUri(thisFile),
            originalDocumentUri: convertPathToUri(thisFile),
            isAntlers: isAntlers,
            isBlade: isBlade,
            isPartial: isPartial,
            path: normalizePath(thisFile),
            relativeDisplayName: displayName,
            relativeFileName: fileName,
            relativePath: relativePath,
            injectsCollections: [],
            injectsParameters: [],
            templateName: replaceAllInString(displayName, '/', '.'),
            varReferenceNames: new Map(),
            document: null
        });
    }

    return views;
}

export function getProjectStructure(resourcePath: string): FileSystemStatamicProject {
    const projectPath = getRootProjectPath(resourcePath),
        collectionsDirectory = makeCollectionsDirectory(projectPath),
        viewsDirectory = makeViewsDirectory(projectPath),
        formsDirectory = makeFormsDirectory(projectPath),
        formsBlueprintDirectory = makeFormsBlueprintsDirectory(projectPath),
        fieldsetsDirectory = makeFieldsetsDirectory(projectPath),
        taxonomiesDirectory = makeTaxonomyBlueprintsDirectory(projectPath),
        globalSettingsDirectory =
            makeGlobalSettingsBlueprintsDirectory(projectPath),
        miscBlueprintsDirectory = makeMiscBlueprintsDirectory(projectPath),
        contentDirectory = makeContentDirectory(projectPath),
        navigationDirectory = makeNavigationDirectory(projectPath),
        taxonomyContentDirectory = makeTaxonomyTermsDirectory(projectPath),
        userPermissionsDirectory = makeUserPermissionsDirectory(projectPath),
        collectionContentDirectory = makeCollectionsContentDirectory(projectPath),
        assetsContentDirectory = makeAssetsContentDirectory(projectPath),
        assetsBlueprintDirectory = makeAssetsBlueprintDirectory(projectPath),
        blueprintsPaths = getFiles(collectionsDirectory, ".yaml", []),
        projectViews = getProjectViews(viewsDirectory),
        macroFilePath = makeMacroFilePath(projectPath),
        laravelRoot = getLaravelRoot(projectPath),
        composerLock = getComposerLockFile(laravelRoot),
        vendorDirectory = getComposerVendorDirectory(laravelRoot),
        queryScopesDirectory = getQueryScopesDirectory(laravelRoot),
        modifiersDirectory = getModifiersDirectory(laravelRoot),
        tagsDirectory = getTagsDirectory(laravelRoot);

    let hasMacroFile = false;

    let statamicPackage: IComposerPackage | null = null;

    const composerPackages = LockFileParser.getInstalledPackages(
        composerLock,
        laravelRoot,
        vendorDirectory
    );

    for (let i = 0; i < composerPackages.length; i++) {
        if (composerPackages[i].name == "statamic/cms") {
            statamicPackage = composerPackages[i];
            break;
        }
    }

    const blueprints: IBlueprint[] = [];
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
    const speculativeFields: Map<string, IBlueprintField> = new Map();

    const userGroups: Map<string, IUserGroup> = new Map(),
        userGroupNames: string[] = [],
        userRoles: Map<string, IUserRole> = new Map(),
        userRoleNames: string[] = [],
        navigationItems: Map<string, INavigation> = new Map(),
        collections: Map<string, ICollection> = new Map(),
        assets: Map<string, IAssets> = new Map(),
        assetFields: Map<string, IBlueprintField[]> = new Map(),
        customModifierNames: string[] = [],
        customTags: IAntlersTag[] = [];

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

    if (fs.existsSync(tagsDirectory)) {
        const tagsPaths = getFiles(tagsDirectory, '.php', []);

        for (let i = 0; i < tagsPaths.length; i++) {
            try {
                const tagDetails = HandleableClassParser.parsePhp(fs.readFileSync(tagsPaths[i], { encoding: 'utf8' }));
                if (typeof tagDetails.className !== 'undefined' && typeof tagDetails.handle !== 'undefined') {
                    const tagMethodCandidates = tagDetails.methodNames.filter(f => f != 'index' && f != 'wildcard').map(f => StringUtilities.snakeCase(f));

                    customTags.push({
                        tagName: tagDetails.handle,
                        requiresClose: false,
                        allowsContentClose: true,
                        allowsArbitraryParameters: true,
                        injectParentScope: true,
                        parameters: [],
                        hideFromCompletions: false,
                        introducedIn: null,
                        resolveCompletionItems: (params: ISuggestionRequest) => {
                            if (params.leftWord == tagDetails.handle ||
                                params.leftWord == `/${tagDetails.handle}`) {
                                const items: CompletionItem[] = [];

                                tagMethodCandidates.forEach((name) => {
                                    items.push({
                                        label: name,
                                        kind: CompletionItemKind.Text,
                                        sortText: '1',
                                    });
                                });

                                return {
                                    items: items,
                                    isExclusiveResult: true,
                                    analyzeDefaults: false,
                                };
                            }

                            return {
                                items: [],
                                isExclusiveResult: false,
                                analyzeDefaults: true,
                            };
                        }
                    });

                    tagMethodCandidates.forEach((tag) => {
                        customTags.push({
                            tagName: `${tagDetails.handle}:${tag}`,
                            requiresClose: false,
                            allowsContentClose: true,
                            allowsArbitraryParameters: true,
                            injectParentScope: true,
                            parameters: [],
                            hideFromCompletions: false,
                            introducedIn: null,
                        });
                    });
                }
            } catch (err) { /* Prevent parser failures from crashing the process.*/ }
        }
    }

    if (fs.existsSync(modifiersDirectory)) {
        const modifierPaths = getFiles(modifiersDirectory, '.php', []);

        for (let i = 0; i < modifierPaths.length; i++) {
            try {
                const modifierDetails = HandleableClassParser.parsePhp(fs.readFileSync(modifierPaths[i], { encoding: 'utf8' }));
                if (typeof modifierDetails.className !== 'undefined' && typeof modifierDetails.handle !== 'undefined') {
                    customModifierNames.push(modifierDetails.handle);
                }
            } catch (err) { /* Prevent parser failures from crashing the process.*/ }
        }
    }

    // Query scopes.
    if (fs.existsSync(queryScopesDirectory)) {
        const scopePaths = getFiles(queryScopesDirectory, '.php', []);

        for (let i = 0; i < scopePaths.length; i++) {
            try {
                const scopeDetails = HandleableClassParser.parsePhp(fs.readFileSync(scopePaths[i], { encoding: 'utf8' }));
                if (typeof scopeDetails.className !== 'undefined' && typeof scopeDetails.handle !== 'undefined') {
                    collectionScopes.push({
                        description: scopeDetails.description,
                        handle: scopeDetails.handle,
                        name: scopeDetails.className,
                        path: convertPathToUri(scopePaths[i])
                    });
                }
            } catch (err) { /* Prevent parser failures from crashing the process.*/ }
        }
    }

    // Assets.
    const assetPaths = getDirectFiles(assetsContentDirectory, ".yaml");

    for (let i = 0; i < assetPaths.length; i++) {
        if (shouldProcessPath(assetPaths[i])) {
            const asset = getProjectAssets(assetPaths[i]);

            assets.set(asset.handle, asset);
        }
    }

    // Collection details.
    const collectionPaths = getDirectFiles(collectionContentDirectory, ".yaml"),
        discoveredCollections: string[] = [];

    for (let i = 0; i < collectionPaths.length; i++) {
        if (shouldProcessPath(collectionPaths[i])) {
            const collection = getCollectionDetails(collectionPaths[i]);

            discoveredCollectionNames.push(collection.handle);

            collections.set(collection.handle, collection);
        }
    }

    // User roles and groups.
    const rolesPath = userPermissionsDirectory + "roles.yaml",
        groupsPath = userPermissionsDirectory + "groups.yaml";

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

    // Resolve structured project details.
    // TODO: Potentially refactor away from existing project setup.
    const fsParser = new FieldSetParser();

    // Gather up the fieldsets.
    const fieldsetPaths = getFiles(fieldsetsDirectory, ".yaml", []);
    let allBlueprintFields: IBlueprintField[] = [];

    for (let i = 0; i < fieldsetPaths.length; i++) {
        if (shouldProcessPath(fieldsetPaths[i])) {
            const fieldsetName = path.basename(fieldsetPaths[i]).split(".").slice(0, -1).join("."),
                contents = fs.readFileSync(fieldsetPaths[i]).toString();

            try {
                fsParser.parseFieldset(YAML.parse(contents), fieldsetName);
            } catch (err) { }

            if (fieldsetName != null && fieldsetName.trim().length > 0) {
                const fields = getFieldsetFields(fieldsetPaths[i], fieldsetName);

                fieldsets.set(fieldsetName, fields);
            }
        }
    }

    const bpParser = new BlueprintParser();
    bpParser.setParsedFieldSet(fsParser.getFieldsets());

    // Taxonomies.
    const taxonomyPaths = getFiles(taxonomiesDirectory, ".yaml", []);

    for (let i = 0; i < taxonomyPaths.length; i++) {
        if (shouldProcessPath(taxonomyPaths[i])) {
            const taxonomyName = path
                .basename(taxonomyPaths[i])
                .split(".")
                .slice(0, -1)
                .join("."),
                pluralForm = path.basename(path.dirname(taxonomyPaths[i]));

            if (taxonomyName != null && taxonomyName.trim().length > 0) {
                pluralizedTaxonomyNames.set(taxonomyName, pluralForm);

                const blueprint = getBlueprintFields(
                    taxonomyPaths[i],
                    taxonomyName,
                    'taxonomy',
                    fieldsets
                );

                blueprints.push(blueprint);

                taxonomyMapping.set(taxonomyName, blueprint.fields);
                allBlueprintFields = allBlueprintFields.concat(blueprint.fields);

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
                const pluralTaxonomyName = pluralizedTaxonomyNames.get(
                    discoveredTaxonomyNames[i]
                );

                if (
                    typeof pluralTaxonomyName !== "undefined" &&
                    pluralTaxonomyName !== null
                ) {
                    const termLocation =
                        taxonomyContentDirectory + pluralTaxonomyName + "/";

                    if (fs.existsSync(termLocation)) {
                        const terms = getDirectFiles(termLocation, ".yaml"),
                            discoveredTerms: string[] = [];

                        for (let j = 0; j < terms.length; j++) {
                            if (shouldProcessPath(terms[j])) {
                                const termName = path
                                    .basename(terms[j])
                                    .split(".")
                                    .slice(0, -1)
                                    .join(".");

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
    const miscBlueprintPaths = getDirectFiles(miscBlueprintsDirectory, ".yaml");

    for (let i = 0; i < miscBlueprintPaths.length; i++) {
        if (shouldProcessPath(miscBlueprintPaths[i])) {
            const contents = fs.readFileSync(miscBlueprintPaths[i]).toString();
            const blueprintName = path.basename(miscBlueprintPaths[i]).split(".").slice(0, -1).join(".");

            try {
                bpParser.parseBlueprint(YAML.parse(contents), blueprintName, 'misc', blueprintName, miscBlueprintPaths[i]);
            } catch (err) { }

            if (blueprintName != null && blueprintName.trim().length > 0) {
                const blueprint = getBlueprintFields(
                    miscBlueprintPaths[i],
                    blueprintName,
                    'misc',
                    fieldsets
                );

                blueprints.push(blueprint);

                miscFields.set(blueprintName, blueprint.fields);
                allBlueprintFields = allBlueprintFields.concat(blueprint.fields);
            }
        }
    }

    const collectionsWithCustomBlueprints: string[] = [];

    for (let i = 0; i < blueprintsPaths.length; i++) {
        if (shouldProcessPath(blueprintsPaths[i])) {
            const contents = fs.readFileSync(blueprintsPaths[i]).toString();
            let blueprintName = path.basename(blueprintsPaths[i]).split(".").slice(0, -1).join(".");

            const blueprint = getBlueprintFields(blueprintsPaths[i], blueprintName, 'collection', fieldsets);
            const collectionName = normalizePath(dirname(blueprintsPaths[i])).split("/").pop() as string;

            if (!collectionsWithCustomBlueprints.includes(collectionName)) {
                collectionsWithCustomBlueprints.push(collectionName);
            }

            try {
                bpParser.parseBlueprint(YAML.parse(contents), blueprintName, 'collection', collectionName, blueprintsPaths[i]);
            } catch (err) { }

            blueprints.push(blueprint);

            allBlueprintFields = allBlueprintFields.concat(blueprint.fields);

            if (collectionName != null && collectionName.trim().length > 0) {
                blueprintName = collectionName;
                if (discoveredCollectionNames.includes(collectionName) == false) {
                    discoveredCollectionNames.push(collectionName);
                }
            }

            blueprint.fields.forEach((field) => {
                if (!speculativeFields.has(field.name)) {
                    speculativeFields.set(field.name, field);
                }
            });

            fieldMapping.set(blueprintName, blueprint.fields);
        }
    }

    const collectionsWithoutCustomBlueprints: string[] = [],
        otherCollections: IParsedBlueprint[] = [];

    discoveredCollectionNames.forEach((collectionName) => {
        if (!collectionsWithCustomBlueprints.includes(collectionName)) {
            collectionsWithoutCustomBlueprints.push(collectionName);

            otherCollections.push({
                tabs: [],
                fields: [],
                allFields: [],
                collection: collectionName,
                type: 'collection',
                handle: collectionName,
                title: collectionName
            });
        }
    });

    collectionsWithoutCustomBlueprints.forEach((collection) => {
        collections.set(collection, {
            handle: collection,
            injectFields: [],
            isStructure: false,
            title: collection,
            layout: '',
            viewModel: null,
            template: '',
            taxonomies: [],
            structure: null
        });
    });

    // Navigation
    const navPaths = getDirectFiles(navigationDirectory, ".yaml");

    for (let i = 0; i < navPaths.length; i++) {
        if (shouldProcessPath(navPaths[i])) {
            const contents = fs.readFileSync(navPaths[i]).toString();
            const navigationMenu = getNavigationMenu(navPaths[i]);
            let blueprintName = path.basename(navPaths[i]).split(".").slice(0, -1).join(".");

            try {
                bpParser.parseBlueprint(YAML.parse(contents), blueprintName, 'nav', blueprintName, navPaths[i]);
            } catch (err) { }

            navigationItems.set(navigationMenu.handle, navigationMenu);
        }
    }

    // Globals.
    const globalBlueprintPaths = getDirectFiles(globalSettingsDirectory, ".yaml");

    for (let i = 0; i < globalBlueprintPaths.length; i++) {
        if (shouldProcessPath(globalBlueprintPaths[i])) {
            const contents = fs.readFileSync(globalBlueprintPaths[i]).toString();
            const globalName = path.basename(globalBlueprintPaths[i]).split(".").slice(0, -1).join("."),
                blueprint = getBlueprintFields(globalBlueprintPaths[i], globalName, 'global', fieldsets);

            try {
                bpParser.parseBlueprint(YAML.parse(contents), globalName, 'global', globalName, globalBlueprintPaths[i]);
            } catch (err) { }

            blueprints.push(blueprint);
            allBlueprintFields = allBlueprintFields.concat(blueprint.fields);

            globalsMapping.set(globalName, blueprint.fields);
        }
    }

    // Asset Fields.
    if (fs.existsSync(assetsBlueprintDirectory)) {
        const assetBlueprintPaths = getDirectFiles(assetsBlueprintDirectory, ".yaml");

        for (let i = 0; i < assetBlueprintPaths.length; i++) {
            if (shouldProcessPath(assetBlueprintPaths[i])) {
                const contents = fs.readFileSync(assetBlueprintPaths[i]).toString();
                const assetName = path.basename(assetBlueprintPaths[i]).split(".").slice(0, -1).join("."),
                    blueprint = getBlueprintFields(assetBlueprintPaths[i], assetName, 'asset', fieldsets);

                try {
                    bpParser.parseBlueprint(YAML.parse(contents), assetName, 'asset', assetName, assetBlueprintPaths[i]);
                } catch (err) { }

                blueprints.push(blueprint);
                allBlueprintFields = allBlueprintFields.concat(blueprint.fields);
                assetFields.set(assetName, blueprint.fields);
            }
        }
    }

    // Forms.
    const formBlueprintPaths = getDirectFiles(formsBlueprintDirectory, ".yaml"),
        allFormDefinitions = getDirectFiles(formsDirectory, ".yaml"),
        formNames: string[] = [];

    for (let i = 0; i < allFormDefinitions.length; i++) {
        if (shouldProcessPath(allFormDefinitions[i])) {
            const formName = path.basename(allFormDefinitions[i]).split(".").slice(0, -1).join(".");

            if (!formNames.includes(formName)) {
                formNames.push(formName);
            }
        }
    }

    for (let i = 0; i < formBlueprintPaths.length; i++) {
        if (shouldProcessPath(formBlueprintPaths[i])) {
            const contents = fs.readFileSync(formBlueprintPaths[i]).toString();
            const formName = path.basename(formBlueprintPaths[i]).split(".").slice(0, -1).join("."),
                blueprint = getBlueprintFields(formBlueprintPaths[i], formName, 'form', fieldsets);

            try {
                bpParser.parseBlueprint(YAML.parse(contents), formName, 'form', formName, formBlueprintPaths[i]);
            } catch (err) { }

            blueprints.push(blueprint);
            allBlueprintFields = allBlueprintFields.concat(blueprint.fields);
            formsMapping.set(formName, blueprint.fields);
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
        if (
            collection.template.trim().length > 0 &&
            projectViewMap.has(collection.template)
        ) {
            const refView = projectViewMap.get(collection.template) as IView;

            refView.injectsCollections.push(collection.handle);
        }
    });

    const assetBlueprints: IParsedBlueprint[] = [],
        collectionBlueprints: IParsedBlueprint[] = otherCollections,
        taxonomyBlueprints: IParsedBlueprint[] = [],
        navigationBlueprints: IParsedBlueprint[] = [],
        formBlueprints: IParsedBlueprint[] = [],
        generalBlueprints: IParsedBlueprint[] = [],
        globalBlueprints: IParsedBlueprint[] = [];

    bpParser.getBlueprints().forEach((blueprint) => {
        if (blueprint.type == 'misc') {
            generalBlueprints.push(blueprint);
        } else if (blueprint.type == 'collection') {
            collectionBlueprints.push(blueprint);
        } else if (blueprint.type == 'nav') {
            navigationBlueprints.push(blueprint);
        } else if (blueprint.type == 'global') {
            globalBlueprints.push(blueprint);
        } else if (blueprint.type == 'asset') {
            assetBlueprints.push(blueprint);
        } else if (blueprint.type == 'form') {
            formBlueprints.push(blueprint);
        }
    });

    collectionBlueprints.forEach((collection) => {
        EnsureFields.ensureCollectionFields(collection);
    });

    navigationBlueprints.forEach((nav) => {
        EnsureFields.ensureNavigationFields(nav);
    });

    sendProjectDetails({
        assets: assetBlueprints,
        collections: collectionBlueprints,
        fieldsets: fsParser.getParsedFieldsets(),
        forms: formBlueprints,
        general: generalBlueprints,
        globals: globalBlueprints,
        navigations: navigationBlueprints,
        taxonomies: taxonomyBlueprints
    });

    return new FileSystemStatamicProject({
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
        blueprints: blueprints,
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

        internalFieldReference: allBlueprintFields,
        restoreProperties: null,
        namedBluePrintFields: speculativeFields,
        customModifierNames: customModifierNames,
        customTags: customTags
    }, resourcePath);
}

class FileSystemStatamicProject extends JsonSourceProject implements IProjectDetailsProvider {

    reloadDetails(): IProjectDetailsProvider {
        return getProjectStructure(this.baseResourcePath);
    }
}
