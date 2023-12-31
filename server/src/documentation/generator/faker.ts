import { IArrayFieldType, IDateFieldType, IFieldDetails, IIntegerFieldType, ISlugFieldType, IToggleFieldType } from '../../projects/structuredFieldTypes/types.js';
import { ITextField } from './fieldTypeProviders/generalTextDocumentationProvider.js';
import { IInjectedField } from './types.js';

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

    static baseField(handle: string, type: string, instructionText: string): IFieldDetails {
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
            instructionText: instructionText
        };
    }

    static textField(handle: string, instructionText: string): ITextField {
        return {
            ...this.baseField(handle, 'text', instructionText)
        }
    }

    static slugField(handle: string, instructionText: string): ISlugFieldType {
        return {
            ...this.baseField(handle, 'slug', instructionText),
            from: '',
            generate: true
        };
    }

    static injectedTextField(handle: string, instructionText: string): IInjectedField {
        return {
            name: handle,
            type: 'string',
            field: this.textField(handle, instructionText),
            description: instructionText
        };
    }

    static boolField(handle: string, instructionText: string): IToggleFieldType {
        return {
            ...this.baseField(handle, 'toggle', instructionText),
            inlineLabel: '',
            default: false
        }
    }

    static injectedBoolField(handle: string, instructionText: string): IInjectedField {
        return {
            name: handle,
            type: 'boolean',
            field: this.boolField(handle, instructionText),
            description: instructionText
        };
    }

    static integerField(handle: string, instructionText: string): IIntegerFieldType {
        return {
            ...this.baseField(handle, 'integer', instructionText),
            default: ''
        };
    }

    static injectedIntegerField(handle: string, instructionText: string): IInjectedField {
        return {
            name: handle,
            type: 'integer',
            field: this.integerField(handle, instructionText),
            description: instructionText
        };
    }

    static floatField(handle: string, instructionText: string): IIntegerFieldType {
        return {
            ...this.baseField(handle, 'float', instructionText),
            default: ''
        };
    }

    static injectedFloatField(handle: string, instructionText: string): IInjectedField {
        return {
            name: handle,
            type: 'float',
            field: this.floatField(handle, instructionText),
            description: instructionText
        };
    }

    static arrayField(handle: string, instructionText: string): IArrayFieldType {
        return {
            ...this.baseField(handle, 'array', instructionText),
            mode: 'dynamic',
            keys: []
        };
    }

    static injectedArrayField(handle: string, instructionText: string): IInjectedField {
        return {
            name: handle,
            type: 'array',
            field: this.arrayField(handle, instructionText),
            description: instructionText
        };
    }


    static dateField(handle: string, instructionText: string): IDateFieldType {
        return {
            ...this.baseField(handle, 'date', instructionText),
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

    static injectedDateField(handle: string, instructionText: string): IInjectedField {
        return {
            name: handle,
            type: 'date',
            field: this.dateField(handle, instructionText),
            description: instructionText
        };
    }
}