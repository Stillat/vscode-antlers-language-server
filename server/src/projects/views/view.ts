import { IAntlersParameter } from '../../antlers/tagManager';

export interface IView {
    /**
     * The normalized path to the template file.
     */
    path: string;
    /**
     * The relative file name on disk.
     */
    relativeFileName: string;
    /**
     * A display name constructed from the relative file path and file name.
     */
    relativeDisplayName: string;
    /**
     * The normalizerd relative path to the file.
     */
    relativePath: string;
    /**
     * A list of collections (or blueprints) the template file injects into the scope context.
     */
    injectsCollections: string[];
    /**
     * The file name (including extension) of the template.
     */
    fileName: string;
    /**
     * The adjusted document URI of the template.
     */
    documentUri: string;
    /**
     * The original document URI presented to the internal systems.
     */
    originalDocumentUri: string;
    /**
     * A friendly display name for the template.
     */
    displayName: string;
    /**
     * Indicates if the template is an Antlers partial.
     */
    isPartial: boolean;
    /**
     * Indicates if the template is an Antlers file.
     */
    isAntlers: boolean;
    /**
     * Indicates if the template is a Blade file.
     */
    isBlade: boolean;
    injectsParameters: IAntlersParameter[];
    varReferenceNames: Map<string, string>;
    templateName: string;
}