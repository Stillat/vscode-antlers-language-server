export interface IManifestConifg {
    assetPresets: string[];
    siteNames: string[];
    oauthProviders: string[];
    searchIndexes: string[];
}
export interface IManifestTagParameter {
    name: string;
    description: string;
    expectsTypes: string[];
    isRequired: boolean;
    aliases: string[];
}

export interface IManifestTag {
    sourceFile: string;
    handle: string;
    name: string;
    compound: string;
    showInCompletions: boolean;
    parameters: IManifestTagParameter[];
}

export interface IManifestModifierParameter {
    name: string;
    description: string;
    acceptsTypes: string[];
    isRequired: boolean;
    aliases: string[];
}

export interface IManifestModifier {
    sourceFile: string;
    name: string;
    description: string;
    expectsTypes: string[];
    returnsTypes: string[];
    parameters: IManifestModifierParameter[];
}

export interface IContributedField {
    name: string;
    description: string;
    returnTypes: string[];
}

export interface IManifestAugmentationContribution {
    sourceFile: string;
    name: string;
    description: string;
    collections: string[];
    blueprints: string[];
    fields: IContributedField[];
}

export interface IManifestViewModel {
    name: string;
    fqn: string;
    sourceFile: string;
    fields: string[];
}

export interface IManifestQueryScope {
    sourceFile: string;
    name: string;
    description: string;
}

export interface IComposerPackageManifest {
    packageName: string;

    tags: IManifestTag[];
    modifiers: IManifestModifier[];
    augmentContributions: IManifestAugmentationContribution[];
    queryScopes: IManifestQueryScope[];
    viewModels: IManifestViewModel[];
}

export interface IAntlersManifest {
    config: IManifestConifg;
    tags: IManifestTag[];
    modifiers: IManifestModifier[];
    augmentContributions: IManifestAugmentationContribution[];
    queryScopes: IManifestQueryScope[];
    viewModels: IManifestViewModel[];
    packageManifests: IComposerPackageManifest[];
}
