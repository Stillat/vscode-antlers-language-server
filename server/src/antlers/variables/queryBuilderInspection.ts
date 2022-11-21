
const internalBuilderTypes:string[] = [
    'assets', 'entries', 'form_multiple',
    'sites_multiple', 'structures_multiple',
    'taxonomies_multiple', 'terms_multiple',
    'user_groups_multiple', 'user_roles_multiple',
    'users_multiple'
];

const ignoredModifierNames:string[] = [
    'as', 'on_each_side', 'order_by', 'sort',
    'query_scope', 'filter', 'reverse'
];

export class QueryBuilderInspection {
    static isQueryBuilderType(fieldType:string): boolean {
        return internalBuilderTypes.includes(fieldType);
    }

    static isIgnoredParameterName(name:string): boolean {
        return ignoredModifierNames.includes(name);
    }
}