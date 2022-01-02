const stringTypes: string[] = [
    "markdown",
    "text",
    "textarea",
    "slug",
    "button_group",
    "code",
    "color",
    "date",
    "form",
    "link",
    "structures",
    "select",
    "taxonomies",
    "terms",
    "template",
    "time",
    "video",
    "users",
    "user_groups",
    "user_roles",
];

const arrayTypes: string[] = [
    "array",
    "assets",
    "bard",
    "blueprints",
    "collections",
    "entries",
    "list",
    "grid",
    "replicator",
    "structures_multiple",
    "sites",
    "select_multiple",
    "form_multiple",
    "table",
    "tags",
    "terms_multiple",
    "taxonomies_multiple",
    "users_multiple",
    "checkboxes",
    "select_multiple",
    "yaml",
    "user_groups_multiple",
    "user_roles_multiple",
];

const numberTypes: string[] = ["integer", "range"];

const booleanTypes: string[] = ["toggle"];

export function getFieldRuntimeType(fieldType: string): string {
    if (stringTypes.includes(fieldType)) {
        return "string";
    }

    if (arrayTypes.includes(fieldType)) {
        return "array";
    }

    if (numberTypes.includes(fieldType)) {
        return "number";
    }

    if (booleanTypes.includes(fieldType)) {
        return "boolean";
    }

    return fieldType;
}
