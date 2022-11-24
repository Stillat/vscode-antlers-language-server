import { IArrayFieldType, IDateFieldType, IFieldDetails, IIntegerFieldType, ISlugFieldType, IToggleFieldType } from '../../projects/structuredFieldTypes/types';
import { ITextField } from './fieldTypeProviders/generalTextDocumentationProvider';
import { IInjectedField } from './types';

export class Faker {
    static getInternalIcon(type: string): string {

        if (type == 'array') { return 'array'; }
        if (type == 'asset_container') { return 'asset_container'; }
        if (type == 'asset_folder') { return 'asset_folder'; }
        if (type == 'assets') { return 'assets'; }
        if (type == 'bard') { return 'bard'; }
        if (type == 'replicator') { return 'replicator'; }
        if (type == 'bard_buttons_setting') { return 'bard_buttons_setting'; }
        if (type == 'button_group') { return 'button_group'; }
        if (type == 'checkboxes') { return 'checkboxes'; }
        if (type == 'code') { return 'code'; }
        if (type == 'collection_routes') { return 'collection_routes'; }
        if (type == 'collection_title_formats') { return 'collection_title_formats'; }
        if (type == 'collections') { return 'collections'; }
        if (type == 'color') { return 'color'; }
        if (type == 'date') { return 'date'; }
        if (type == 'entries') { return 'entries'; }
        if (type == 'files') { return 'files'; }
        if (type == 'float') { return 'float'; }
        if (type == 'global_set_sites') { return 'global_set_sites'; }
        if (type == 'grid') { return 'grid'; }
        if (type == 'hidden') { return 'hidden'; }
        if (type == 'html') { return 'html'; }
        if (type == 'integer') { return 'integer'; }
        if (type == 'link') { return 'link'; }
        if (type == 'list') { return 'list'; }
        if (type == 'markdown') { return 'markdown'; }
        if (type == 'fields') { return 'fields'; }
        if (type == 'radio') { return 'radio'; }
        if (type == 'range') { return 'range'; }
        if (type == 'revealer') { return 'revealer'; }
        if (type == 'section') { return 'section'; }
        if (type == 'select') { return 'select'; }
        if (type == 'sets') { return 'sets'; }
        if (type == 'sites') { return 'sites'; }
        if (type == 'structures') { return 'structures'; }
        if (type == 'slug') { return 'slug'; }
        if (type == 'text') { return 'text'; }
        if (type == 'table') { return 'table'; }
        if (type == 'taggable') { return 'tags'; }
        if (type == 'terms') { return 'taxonomy'; }
        if (type == 'taxonomies') { return 'taxonomy'; }
        if (type == 'template') { return 'template'; }
        if (type == 'template_folder') { return 'template_folder'; }
        if (type == 'textarea') { return 'textarea'; }
        if (type == 'time') { return 'time'; }
        if (type == 'toggle') { return 'toggle'; }
        if (type == 'user_groups') { return 'user_groups'; }
        if (type == 'user_roles') { return 'user_roles'; }
        if (type == 'users') { return 'users'; }
        if (type == 'video') { return 'video'; }
        if (type == 'yaml') { return 'yaml'; }
        if (type == 'form') { return 'form'; }

        return '';
    }

    static baseField(handle: string, type: string): IFieldDetails {
        return {
            validate: [],
            unless: [],
            type: type,
            sets: [],
            required: true,
            linkedFrom: '',
            isLinked: false,
            internalIcon: Faker.getInternalIcon(type),
            handle: handle,
            fields: [],
            display: '',
            developerDocumentation: '',
            instructionText: ''
        };
    }

    static textField(handle: string): ITextField {
        return {
            ...this.baseField(handle, 'text')
        }
    }

    static slugField(handle: string): ISlugFieldType {
        return {
            ...this.baseField(handle, 'slug'),
            from: '',
            generate: true
        };
    }

    static injectedTextField(handle: string): IInjectedField {
        return {
            name: handle,
            type: 'string',
            field: this.textField(handle),
            description: ''
        };
    }

    static boolField(handle: string): IToggleFieldType {
        return {
            ...this.baseField(handle, 'toggle'),
            inlineLabel: '',
            default: false
        }
    }

    static injectedBoolField(handle: string): IInjectedField {
        return {
            name: handle,
            type: 'boolean',
            field: this.boolField(handle),
            description: ''
        };
    }

    static integerField(handle: string): IIntegerFieldType {
        return {
            ...this.baseField(handle, 'integer'),
            default: ''
        };
    }

    static injectedIntegerField(handle: string): IInjectedField {
        return {
            name: handle,
            type: 'integer',
            field: this.integerField(handle),
            description: ''
        };
    }

    static floatField(handle: string): IIntegerFieldType {
        return {
            ...this.baseField(handle, 'float'),
            default: ''
        };
    }

    static injectedFloatField(handle: string): IInjectedField {
        return {
            name: handle,
            type: 'float',
            field: this.floatField(handle),
            description: ''
        };
    }

    static arrayField(handle: string): IArrayFieldType {
        return {
            ...this.baseField(handle, 'array'),
            mode: 'dynamic',
            keys: []
        };
    }

    static injectedArrayField(handle: string): IInjectedField {
        return {
            name: handle,
            type: 'array',
            field: this.arrayField(handle),
            description: ''
        };
    }


    static dateField(handle: string): IDateFieldType {
        return {
            ...this.baseField(handle, 'date'),
            mode: '',
            format: null,
            earliestDate: null,
            latestDate: null,
            timeEnabled: null,
            timeSecondsEnabled: null,
            fullWidth: null,
            inline: null,
            columns: 0,
            rows: 0
        };
    }

    static injectedDateField(handle: string): IInjectedField {
        return {
            name: handle,
            type: 'date',
            field: this.dateField(handle),
            description: ''
        };
    }
}