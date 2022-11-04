
const internalBuilderTypes:string[] = [
    'assets', 'entries', 'form_multiple',
    'sites_multiple', 'structures_multiple',
    'taxonomies_multiple', 'terms_multiple',
    'user_groups_multiple', 'user_roles_multiple',
    'users_multiple'
];

export class QueryBuilderInspection {
    static isQueryBuilderType(fieldType:string): boolean {
        if (internalBuilderTypes.includes(fieldType)) {
            return true;
        }

        return false;
    }
}