export interface IAntlersExtension {
    /**
     * The path to the tags.json file, if any.
     */
    tagsFile: string | null;
    /**
     * The path to the modifiers.json file, if any.
     */
    modifiersFile: string | null;
    /**
     * The path to the types.json file, if any.
     */
    fieldtypesFile: string | null;
}

export interface IComposerPackage {
    /**
     * The name of the Composer package.
     */
    name: string;
    /**
     * The installed version of the Composer package (from composer.lock).
     */
    version: string;
    /**
     * The path on disk to the composer.json (accounts for path repository types).
     */
    vendorPath: string;
    /**
     * Indicates if the Composer package is a Statamic addon.
     */
    isStatamicAddon: boolean;
    /**
     * Additional details about possible Antlers language server extensions, if any.
     */
    antlersExtension: IAntlersExtension | null;
}
