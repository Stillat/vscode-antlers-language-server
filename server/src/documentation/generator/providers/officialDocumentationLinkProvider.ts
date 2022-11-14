export class OfficialDocumentationLinkProvider {
    static getDocLink(fieldType: string): string | null {
        fieldType = fieldType.toLowerCase();

        if (fieldType == 'array') {
            return 'https://statamic.dev/fieldtypes/array';
        }
        
        if (fieldType == 'assets') {
            return 'https://statamic.dev/fieldtypes/assets';
        }

        if (fieldType == 'bard') {
            return 'https://statamic.dev/fieldtypes/bard';
        }

        if (fieldType == 'button_group') {
            return 'https://statamic.dev/fieldtypes/button_group';
        }

        if (fieldType == 'checkboxes') {
            return 'https://statamic.dev/fieldtypes/checkboxes';
        }

        if (fieldType == 'code') {
            return 'https://statamic.dev/fieldtypes/code';
        }

        if (fieldType == 'collections') {
            return 'https://statamic.dev/fieldtypes/collections';
        }

        if (fieldType == 'color') {
            return 'https://statamic.dev/fieldtypes/color';
        }

        if (fieldType == 'date') {
            return 'https://statamic.dev/fieldtypes/date';
        }

        if (fieldType == 'entries') {
            return 'https://statamic.dev/fieldtypes/entries';
        }

        if (fieldType == 'form') {
            return 'https://statamic.dev/fieldtypes/form';
        }

        if (fieldType == 'grid') {
            return 'https://statamic.dev/fieldtypes/grid';
        }

        if (fieldType == 'integer') {
            return 'https://statamic.dev/fieldtypes/integer';
        }

        if (fieldType == 'link') {
            return 'https://statamic.dev/fieldtypes/link';
        }
        
        if (fieldType == 'list') {
            return 'https://statamic.dev/fieldtypes/list';
        }

        if (fieldType == 'markdown') {
            return 'https://statamic.dev/fieldtypes/markdown';
        }

        if (fieldType == 'radio') {
            return 'https://statamic.dev/fieldtypes/radio';
        }

        if (fieldType == 'range') {
            return 'https://statamic.dev/fieldtypes/range';
        }

        if (fieldType == 'replicator') {
            return 'https://statamic.dev/fieldtypes/replicator';
        }

        if (fieldType == 'select') {
            return 'https://statamic.dev/fieldtypes/select';
        }

        if (fieldType == 'sites') {
            return 'https://statamic.dev/fieldtypes/sites';
        }

        if (fieldType == 'structures') {
            return 'https://statamic.dev/fieldtypes/structures';
        }

        if (fieldType == 'table') {
            return 'https://statamic.dev/fieldtypes/table';
        }

        if (fieldType == 'taggable') {
            return 'https://statamic.dev/fieldtypes/taggable';
        }

        if (fieldType == 'taxonomies') {
            return 'https://statamic.dev/fieldtypes/taxonomies';
        }

        if (fieldType == 'template') {
            return 'https://statamic.dev/fieldtypes/template';
        }

        if (fieldType == 'terms') {
            return 'https://statamic.dev/fieldtypes/terms';
        }

        if (fieldType == 'text') {
            return 'https://statamic.dev/fieldtypes/text';
        }

        if (fieldType == 'textarea') {
            return 'https://statamic.dev/fieldtypes/textarea';
        }

        if (fieldType == 'time') {
            return 'https://statamic.dev/fieldtypes/time';
        }

        if (fieldType == 'toggle') {
            return 'https://statamic.dev/fieldtypes/toggle';
        }

        if (fieldType == 'user_groups') {
            return 'https://statamic.dev/fieldtypes/user-groups';
        }

        if (fieldType == 'user_roles') {
            return 'https://statamic.dev/fieldtypes/user-roles';
        }

        if (fieldType == 'users') {
            return 'https://statamic.dev/fieldtypes/users';
        }

        if (fieldType == 'video') {
            return 'https://statamic.dev/fieldtypes/video';
        }

        if (fieldType == 'yaml') {
            return 'https://statamic.dev/fieldtypes/yaml';
        }

        return null;
    }
}