import { ISet } from "../blueprints/fields";

export interface IFieldsetField {
    /**
     * The fieldsets handle.
     */
    handle: string;
    /**
     * The name of the field.
     */
    name: string;
    /**
     * Optional instruction text that is displayed to the end-user.
     *
     * This typically is displayed to authors in the Statamic Control Panel.
     * This information may also be displayed in completion suggestions.
     */
    instructionText: string | null;
    /**
     * The fieldset type.
     */
    type: string;
    maxItems: number | null;
    sets: ISet[] | null;
    import: string | null;
}
