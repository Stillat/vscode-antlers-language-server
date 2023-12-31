import { IScopeVariable } from '../../antlers/scope/types.js';
import { IFieldsetField } from "../fieldsets/fieldset.js";

export interface IBlueprint {
    handle: string;
    title: string;
    fields: IBlueprintField[];
    filePath: string;
    type: string;
}

export interface IBlueprintField {
    /**
     * The name of the blueprint or collection introducing the field.
     */
    blueprintName: string;
    /**
     * The name of the field.
     */
    name: string;
    /**
     * A user-friendly name for the field, if any.
     */
    displayName: string | null;
    /**
     * Optional instruction text that is displayed to the end-user.
     *
     * This typically is displayed to authors in the Statamic Control Panel.
     * This information may also be displayed in completion suggestions.
     */
    instructionText: string | null;
    /**
     * The maximum number of allowable items for list-type fields.
     */
    maxItems: number | null;
    /**
     * The field type.
     */
    type: string;
    /**
     * A reference to the known fieldset instance, if available.
     */
    refFieldSetField: IFieldsetField | null;
    /**
     * A list of sets contained within the field.
     *
     * Common examples are the Replicator and Bard fieldtypes.
     */
    sets: ISet[] | null;
    import: string | null;
}

export interface ISet {
    /**
     * The set's handle.
     */
    handle: string;
    /**
     * A user-friendly name for the set of fields.
     */
    displayName: string;
    /**
     * The fields contained within the set.
     */
    fields: IBlueprintField[];
}

const SetFieldTypes: string[] = ["replicator", "bard"];

export { SetFieldTypes };

function blueprintFieldFromScopeVariable(
    variable: IScopeVariable
): IBlueprintField {
    return {
        blueprintName: variable.sourceName,
        displayName: variable.name,
        instructionText: "",
        maxItems: -1,
        name: variable.name,
        refFieldSetField: null,
        type: variable.dataType,
        sets: null,
        import: null,
    };
}

export function variablesToBlueprintFields(
    variables: IScopeVariable[]
): IBlueprintField[] {
    const fields: IBlueprintField[] = [];

    for (let i = 0; i < variables.length; i++) {
        fields.push(blueprintFieldFromScopeVariable(variables[i]));
    }

    return fields;
}

export function blueprintFieldFromFieldSet(
    field: IFieldsetField,
    prefix = ""
): IBlueprintField {
    const fieldToReturn: IBlueprintField = {
        blueprintName: "fieldset",
        displayName: prefix + field.name,
        instructionText: field.instructionText,
        maxItems: field.maxItems,
        name: prefix + field.handle,
        type: field.type,
        refFieldSetField: field,
        sets: field.sets,
        import: field.import,
    };

    return fieldToReturn;
}

export function adjustFieldType(
    fieldType: string,
    field: any,
    maxItems: number
): string {
    if (fieldType == "select") {
        if (
            typeof field.field.multiple !== "undefined" &&
            field.field.multiple === true
        ) {
            fieldType = "select_multiple";
        }
    }

    if (typeof field.field.multiple === "undefined" || maxItems > 1) {
        if (fieldType == "form") {
            fieldType = "form_multiple";
        } else if (fieldType == "sites") {
            fieldType = "sites_multiple";
        } else if (fieldType == "taxonomies") {
            fieldType = "taxonomies_multiple";
        } else if (fieldType == "user_groups") {
            fieldType = "user_groups_multiple";
        } else if (fieldType == "user_roles") {
            fieldType = "user_roles_multiple";
        } else if (fieldType == "terms") {
            fieldType = "terms_multiple";
        } else if (fieldType == "users") {
            fieldType = "users_multiple";
        } else if (fieldType == "structures") {
            fieldType = "structures_multiple";
        }
    }

    return fieldType;
}

export function blueprintFieldsFromFieldset(
    fields: IFieldsetField[]
): IBlueprintField[] {
    const blueprintFields: IBlueprintField[] = [];

    for (let i = 0; i < fields.length; i++) {
        blueprintFields.push(blueprintFieldFromFieldSet(fields[i]));
    }

    return blueprintFields;
}
