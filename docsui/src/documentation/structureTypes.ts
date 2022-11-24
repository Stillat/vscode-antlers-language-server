
/**
 * This file was automatically generated. Any changes
 * made directly to this file are likely to be lost.
 */

 export interface IFieldDetails {
    required: boolean;
    type: string;
    display: string;
    validate: string[];
    unless: string[];
    handle: string;
    fields: IFieldDetails[];
    sets: ISet[];
    isLinked: boolean;
    linkedFrom: string;
    internalIcon: string;
    instructionText: string;
    developerDocumentation: string;
}

export interface ISet {
    handle: string;
    display: string;
    fields: IFieldDetails[];
}

function locateField(fieldName: string, fieldSet:IParsedFieldset): IFieldDetails | null {
    for (let i = 0; i < fieldSet.allFields.length; i++) {
        if (fieldSet.allFields[i].handle == fieldName) {
            return fieldSet.allFields[i];
        }
    }

    return null;
}

function fetchFields(prefix: string | null, fieldSet: IParsedFieldset): IFieldDetails[] {
    const returnFields: IFieldDetails[] = [];

    fieldSet.allFields.forEach((field) => {
        try {
            let newHandle = field.handle;
    
            if (prefix != null) {
                newHandle = prefix + newHandle;
            }
    
            returnFields.push({
                ...field,
                handle: newHandle,
                isLinked: true,
                linkedFrom: fieldSet.handle + '.' + field.handle
            });
        } catch (e) { }
    });

    return returnFields;
}

export function fetchDynamic<T>(context: any, field: string, defaultValue: T): T {
    if (typeof context[field] !== 'undefined') {
        try {
            const tempV = context[field] as T;
            return tempV;
        } catch (err) { }
    }
    return defaultValue;
}
export interface IArrayFieldType extends IFieldDetails {
    mode: string;
    keys: string[] | null;

}

export interface IAssetContainerFieldType extends IFieldDetails {
    maxItems: number | null;
    mode: string;

}

export interface IAssetFolderFieldType extends IFieldDetails {
    maxItems: number | null;
    mode: string;

}

export interface IAssetsFieldType extends IFieldDetails {
    mode: string;
    container: string;
    folder: IAssetFolderFieldType | null;
    restrict: boolean | null;
    allowUploads: boolean;
    showFilename: boolean;
    maxFiles: number | null;

}

export interface IBardFieldType extends IFieldDetails {
    collapse: string | null;
    alwaysShowSetButton: boolean | null;
    previews: boolean;
    buttons: any[];
    container: string | null;
    saveHtml: boolean | null;
    toolbarMode: string;
    linkNoopener: boolean | null;
    linkNoreferrer: boolean | null;
    targetBlank: boolean | null;
    linkCollections: string[] | null;
    readingTime: boolean | null;
    fullscreen: boolean;
    allowSource: boolean;
    enableInputRules: boolean;
    enablePasteRules: boolean;
    antlers: boolean | null;
    removeEmptyNodes: string;

}

export interface IReplicatorFieldType extends IFieldDetails {
    collapse: string | null;
    previews: boolean;
    maxSets: number | null;

}

export interface IBardButtonsSettingFieldType extends IFieldDetails {

}

export interface IButtonGroupFieldType extends IFieldDetails {
    options: string[] | null;
    default: string | null;

}

export interface ICheckboxesFieldType extends IFieldDetails {
    inline: boolean | null;
    options: string[] | null;
    default: string | null;

}

export interface ICodeFieldType extends IFieldDetails {
    theme: string;
    mode: string;
    modeSelectable: boolean | null;
    indentType: string;
    indentSize: number;
    keyMap: string;
    lineNumbers: boolean;
    lineWrapping: boolean;

}

export interface ICollectionRoutesFieldType extends IFieldDetails {

}

export interface ICollectionTitleFormatsFieldType extends IFieldDetails {

}

export interface ICollectionsFieldType extends IFieldDetails {
    maxItems: number | null;
    mode: string;

}

export interface IColorFieldType extends IFieldDetails {
    swatches: string[] | null;
    theme: string;
    lockOpacity: boolean | null;
    defaultColorMode: string;
    colorModes: string[];

}

export interface IDateFieldType extends IFieldDetails {
    mode: string;
    format: string | null;
    earliestDate: string | null;
    latestDate: string | null;
    timeEnabled: boolean | null;
    timeSecondsEnabled: boolean | null;
    fullWidth: boolean | null;
    inline: boolean | null;
    columns: number;
    rows: number;

}

export interface IEntriesFieldType extends IFieldDetails {
    maxItems: number | null;
    mode: string;
    create: boolean;
    collections: string[] | null;

}

export interface IFilesFieldType extends IFieldDetails {
    maxFiles: number | null;

}

export interface IFloatFieldType extends IFieldDetails {
    default: string | null;

}

export interface IGlobalSetSitesFieldType extends IFieldDetails {

}

export interface IGridFieldType extends IFieldDetails {
    mode: string;
    maxRows: number | null;
    minRows: number | null;
    addRow: string | null;
    reorderable: boolean;

}

export interface IHiddenFieldType extends IFieldDetails {
    default: string | null;

}

export interface IHtmlFieldType extends IFieldDetails {
    html: string | null;

}

export interface IIntegerFieldType extends IFieldDetails {
    default: string | null;

}

export interface ILinkFieldType extends IFieldDetails {
    collections: string[] | null;
    container: string | null;

}

export interface IListFieldType extends IFieldDetails {
    default: string[] | null;

}

export interface IMarkdownFieldType extends IFieldDetails {
    container: string | null;
    folder: IAssetFolderFieldType | null;
    restrict: boolean | null;
    automaticLineBreaks: boolean;
    automaticLinks: boolean | null;
    escapeMarkup: boolean | null;
    smartypants: boolean | null;
    parser: string | null;
    antlers: boolean | null;
    default: string | null;

}

export interface IFieldsFieldType extends IFieldDetails {

}

export interface IRadioFieldType extends IFieldDetails {
    options: string[] | null;
    inline: boolean | null;
    castBooleans: boolean | null;
    default: string | null;

}

export interface IRangeFieldType extends IFieldDetails {
    hidden: string | null;
    min: number | null;
    max: number;
    step: number;
    default: string | null;
    prepend: string | null;
    append: string | null;

}

export interface IRevealerFieldType extends IFieldDetails {
    mode: string;
    inputLabel: string;

}

export interface ISectionFieldType extends IFieldDetails {

}

export interface ISelectFieldType extends IFieldDetails {
    placeholder: string;
    options: string[] | null;
    multiple: boolean | null;
    maxItems: number | null;
    clearable: boolean | null;
    searchable: boolean;
    taggable: boolean | null;
    pushTags: boolean | null;
    castBooleans: boolean | null;
    default: string | null;

}

export interface ISetsFieldType extends IFieldDetails {

}

export interface ISitesFieldType extends IFieldDetails {
    maxItems: number | null;
    mode: string;

}

export interface IStructuresFieldType extends IFieldDetails {
    maxItems: number | null;
    mode: string;

}

export interface ISlugFieldType extends IFieldDetails {
    from: string;
    generate: boolean;

}

export interface ITextFieldType extends IFieldDetails {
    placeholder: string | null;
    inputType: string;
    characterLimit: number | null;
    prepend: string | null;
    append: string | null;
    antlers: boolean | null;
    default: string | null;

}

export interface ITableFieldType extends IFieldDetails {

}

export interface ITaggableFieldType extends IFieldDetails {
    placeholder: string;

}

export interface ITermsFieldType extends IFieldDetails {
    maxItems: number | null;
    mode: string;
    create: boolean;
    taxonomies: string[] | null;

}

export interface ITaxonomiesFieldType extends IFieldDetails {
    maxItems: number | null;
    mode: string;

}

export interface ITemplateFieldType extends IFieldDetails {
    hidePartials: boolean;
    blueprint: boolean | null;
    folder: string | null;

}

export interface ITemplateFolderFieldType extends IFieldDetails {
    maxItems: number | null;
    mode: string;

}

export interface ITextareaFieldType extends IFieldDetails {
    placeholder: string | null;
    characterLimit: string | null;
    antlers: boolean | null;
    default: string | null;

}

export interface ITimeFieldType extends IFieldDetails {
    secondsEnabled: boolean | null;
    default: string | null;

}

export interface IToggleFieldType extends IFieldDetails {
    inlineLabel: string;
    default: boolean | null;

}

export interface IUserGroupsFieldType extends IFieldDetails {
    maxItems: number | null;
    mode: string;

}

export interface IUserRolesFieldType extends IFieldDetails {
    maxItems: number | null;
    mode: string;

}

export interface IUsersFieldType extends IFieldDetails {
    maxItems: number | null;
    mode: string;

}

export interface IVideoFieldType extends IFieldDetails {
    default: string | null;
    placeholder: string | null;

}

export interface IYamlFieldType extends IFieldDetails {
    default: string | null;

}

export interface IFormFieldType extends IFieldDetails {
    placeholder: string | null;
    maxItems: number;

}



export function getProperties(context: any): any {
    let properties:any = {};

    if (typeof context['type'] === 'undefined') {
        return properties;
    }

    const contextType = context['type'] as string;

    if (contextType == 'array') {

        if (typeof context['mode'] !== 'undefined') {
            properties['mode'] = context['mode'];
        }

        if (typeof context['keys'] !== 'undefined') {
            properties['keys'] = context['keys'];
        }

    }    if (contextType == 'asset_container') {

        if (typeof context['maxItems'] !== 'undefined') {
            properties['max_items'] = context['maxItems'];
        }

        if (typeof context['mode'] !== 'undefined') {
            properties['mode'] = context['mode'];
        }

    }    if (contextType == 'asset_folder') {

        if (typeof context['maxItems'] !== 'undefined') {
            properties['max_items'] = context['maxItems'];
        }

        if (typeof context['mode'] !== 'undefined') {
            properties['mode'] = context['mode'];
        }

    }    if (contextType == 'assets') {

        if (typeof context['mode'] !== 'undefined') {
            properties['mode'] = context['mode'];
        }

        if (typeof context['container'] !== 'undefined') {
            properties['container'] = context['container'];
        }

        if (typeof context['folder'] !== 'undefined') {
            properties['folder'] = context['folder'];
        }

        if (typeof context['restrict'] !== 'undefined') {
            properties['restrict'] = context['restrict'];
        }

        if (typeof context['allowUploads'] !== 'undefined') {
            properties['allow_uploads'] = context['allowUploads'];
        }

        if (typeof context['showFilename'] !== 'undefined') {
            properties['show_filename'] = context['showFilename'];
        }

        if (typeof context['maxFiles'] !== 'undefined') {
            properties['max_files'] = context['maxFiles'];
        }

    }    if (contextType == 'bard') {

        if (typeof context['collapse'] !== 'undefined') {
            properties['collapse'] = context['collapse'];
        }

        if (typeof context['alwaysShowSetButton'] !== 'undefined') {
            properties['always_show_set_button'] = context['alwaysShowSetButton'];
        }

        if (typeof context['previews'] !== 'undefined') {
            properties['previews'] = context['previews'];
        }

        if (typeof context['buttons'] !== 'undefined') {
            properties['buttons'] = context['buttons'];
        }

        if (typeof context['container'] !== 'undefined') {
            properties['container'] = context['container'];
        }

        if (typeof context['saveHtml'] !== 'undefined') {
            properties['save_html'] = context['saveHtml'];
        }

        if (typeof context['toolbarMode'] !== 'undefined') {
            properties['toolbar_mode'] = context['toolbarMode'];
        }

        if (typeof context['linkNoopener'] !== 'undefined') {
            properties['link_noopener'] = context['linkNoopener'];
        }

        if (typeof context['linkNoreferrer'] !== 'undefined') {
            properties['link_noreferrer'] = context['linkNoreferrer'];
        }

        if (typeof context['targetBlank'] !== 'undefined') {
            properties['target_blank'] = context['targetBlank'];
        }

        if (typeof context['linkCollections'] !== 'undefined') {
            properties['link_collections'] = context['linkCollections'];
        }

        if (typeof context['readingTime'] !== 'undefined') {
            properties['reading_time'] = context['readingTime'];
        }

        if (typeof context['fullscreen'] !== 'undefined') {
            properties['fullscreen'] = context['fullscreen'];
        }

        if (typeof context['allowSource'] !== 'undefined') {
            properties['allow_source'] = context['allowSource'];
        }

        if (typeof context['enableInputRules'] !== 'undefined') {
            properties['enable_input_rules'] = context['enableInputRules'];
        }

        if (typeof context['enablePasteRules'] !== 'undefined') {
            properties['enable_paste_rules'] = context['enablePasteRules'];
        }

        if (typeof context['antlers'] !== 'undefined') {
            properties['antlers'] = context['antlers'];
        }

        if (typeof context['removeEmptyNodes'] !== 'undefined') {
            properties['remove_empty_nodes'] = context['removeEmptyNodes'];
        }

    }    if (contextType == 'replicator') {

        if (typeof context['collapse'] !== 'undefined') {
            properties['collapse'] = context['collapse'];
        }

        if (typeof context['previews'] !== 'undefined') {
            properties['previews'] = context['previews'];
        }

        if (typeof context['maxSets'] !== 'undefined') {
            properties['max_sets'] = context['maxSets'];
        }

    }    if (contextType == 'bard_buttons_setting') {

    }    if (contextType == 'button_group') {

        if (typeof context['options'] !== 'undefined') {
            properties['options'] = context['options'];
        }

        if (typeof context['default'] !== 'undefined') {
            properties['default'] = context['default'];
        }

    }    if (contextType == 'checkboxes') {

        if (typeof context['inline'] !== 'undefined') {
            properties['inline'] = context['inline'];
        }

        if (typeof context['options'] !== 'undefined') {
            properties['options'] = context['options'];
        }

        if (typeof context['default'] !== 'undefined') {
            properties['default'] = context['default'];
        }

    }    if (contextType == 'code') {

        if (typeof context['theme'] !== 'undefined') {
            properties['theme'] = context['theme'];
        }

        if (typeof context['mode'] !== 'undefined') {
            properties['mode'] = context['mode'];
        }

        if (typeof context['modeSelectable'] !== 'undefined') {
            properties['mode_selectable'] = context['modeSelectable'];
        }

        if (typeof context['indentType'] !== 'undefined') {
            properties['indent_type'] = context['indentType'];
        }

        if (typeof context['indentSize'] !== 'undefined') {
            properties['indent_size'] = context['indentSize'];
        }

        if (typeof context['keyMap'] !== 'undefined') {
            properties['key_map'] = context['keyMap'];
        }

        if (typeof context['lineNumbers'] !== 'undefined') {
            properties['line_numbers'] = context['lineNumbers'];
        }

        if (typeof context['lineWrapping'] !== 'undefined') {
            properties['line_wrapping'] = context['lineWrapping'];
        }

    }    if (contextType == 'collection_routes') {

    }    if (contextType == 'collection_title_formats') {

    }    if (contextType == 'collections') {

        if (typeof context['maxItems'] !== 'undefined') {
            properties['max_items'] = context['maxItems'];
        }

        if (typeof context['mode'] !== 'undefined') {
            properties['mode'] = context['mode'];
        }

    }    if (contextType == 'color') {

        if (typeof context['swatches'] !== 'undefined') {
            properties['swatches'] = context['swatches'];
        }

        if (typeof context['theme'] !== 'undefined') {
            properties['theme'] = context['theme'];
        }

        if (typeof context['lockOpacity'] !== 'undefined') {
            properties['lock_opacity'] = context['lockOpacity'];
        }

        if (typeof context['defaultColorMode'] !== 'undefined') {
            properties['default_color_mode'] = context['defaultColorMode'];
        }

        if (typeof context['colorModes'] !== 'undefined') {
            properties['color_modes'] = context['colorModes'];
        }

    }    if (contextType == 'date') {

        if (typeof context['mode'] !== 'undefined') {
            properties['mode'] = context['mode'];
        }

        if (typeof context['format'] !== 'undefined') {
            properties['format'] = context['format'];
        }

        if (typeof context['earliestDate'] !== 'undefined') {
            properties['earliest_date'] = context['earliestDate'];
        }

        if (typeof context['latestDate'] !== 'undefined') {
            properties['latest_date'] = context['latestDate'];
        }

        if (typeof context['timeEnabled'] !== 'undefined') {
            properties['time_enabled'] = context['timeEnabled'];
        }

        if (typeof context['timeSecondsEnabled'] !== 'undefined') {
            properties['time_seconds_enabled'] = context['timeSecondsEnabled'];
        }

        if (typeof context['fullWidth'] !== 'undefined') {
            properties['full_width'] = context['fullWidth'];
        }

        if (typeof context['inline'] !== 'undefined') {
            properties['inline'] = context['inline'];
        }

        if (typeof context['columns'] !== 'undefined') {
            properties['columns'] = context['columns'];
        }

        if (typeof context['rows'] !== 'undefined') {
            properties['rows'] = context['rows'];
        }

    }    if (contextType == 'entries') {

        if (typeof context['maxItems'] !== 'undefined') {
            properties['max_items'] = context['maxItems'];
        }

        if (typeof context['mode'] !== 'undefined') {
            properties['mode'] = context['mode'];
        }

        if (typeof context['create'] !== 'undefined') {
            properties['create'] = context['create'];
        }

        if (typeof context['collections'] !== 'undefined') {
            properties['collections'] = context['collections'];
        }

    }    if (contextType == 'files') {

        if (typeof context['maxFiles'] !== 'undefined') {
            properties['max_files'] = context['maxFiles'];
        }

    }    if (contextType == 'float') {

        if (typeof context['default'] !== 'undefined') {
            properties['default'] = context['default'];
        }

    }    if (contextType == 'global_set_sites') {

    }    if (contextType == 'grid') {

        if (typeof context['mode'] !== 'undefined') {
            properties['mode'] = context['mode'];
        }

        if (typeof context['maxRows'] !== 'undefined') {
            properties['max_rows'] = context['maxRows'];
        }

        if (typeof context['minRows'] !== 'undefined') {
            properties['min_rows'] = context['minRows'];
        }

        if (typeof context['addRow'] !== 'undefined') {
            properties['add_row'] = context['addRow'];
        }

        if (typeof context['reorderable'] !== 'undefined') {
            properties['reorderable'] = context['reorderable'];
        }

    }    if (contextType == 'hidden') {

        if (typeof context['default'] !== 'undefined') {
            properties['default'] = context['default'];
        }

    }    if (contextType == 'html') {

        if (typeof context['html'] !== 'undefined') {
            properties['html'] = context['html'];
        }

    }    if (contextType == 'integer') {

        if (typeof context['default'] !== 'undefined') {
            properties['default'] = context['default'];
        }

    }    if (contextType == 'link') {

        if (typeof context['collections'] !== 'undefined') {
            properties['collections'] = context['collections'];
        }

        if (typeof context['container'] !== 'undefined') {
            properties['container'] = context['container'];
        }

    }    if (contextType == 'list') {

        if (typeof context['default'] !== 'undefined') {
            properties['default'] = context['default'];
        }

    }    if (contextType == 'markdown') {

        if (typeof context['container'] !== 'undefined') {
            properties['container'] = context['container'];
        }

        if (typeof context['folder'] !== 'undefined') {
            properties['folder'] = context['folder'];
        }

        if (typeof context['restrict'] !== 'undefined') {
            properties['restrict'] = context['restrict'];
        }

        if (typeof context['automaticLineBreaks'] !== 'undefined') {
            properties['automatic_line_breaks'] = context['automaticLineBreaks'];
        }

        if (typeof context['automaticLinks'] !== 'undefined') {
            properties['automatic_links'] = context['automaticLinks'];
        }

        if (typeof context['escapeMarkup'] !== 'undefined') {
            properties['escape_markup'] = context['escapeMarkup'];
        }

        if (typeof context['smartypants'] !== 'undefined') {
            properties['smartypants'] = context['smartypants'];
        }

        if (typeof context['parser'] !== 'undefined') {
            properties['parser'] = context['parser'];
        }

        if (typeof context['antlers'] !== 'undefined') {
            properties['antlers'] = context['antlers'];
        }

        if (typeof context['default'] !== 'undefined') {
            properties['default'] = context['default'];
        }

    }    if (contextType == 'fields') {

    }    if (contextType == 'radio') {

        if (typeof context['options'] !== 'undefined') {
            properties['options'] = context['options'];
        }

        if (typeof context['inline'] !== 'undefined') {
            properties['inline'] = context['inline'];
        }

        if (typeof context['castBooleans'] !== 'undefined') {
            properties['cast_booleans'] = context['castBooleans'];
        }

        if (typeof context['default'] !== 'undefined') {
            properties['default'] = context['default'];
        }

    }    if (contextType == 'range') {

        if (typeof context['hidden'] !== 'undefined') {
            properties['hidden'] = context['hidden'];
        }

        if (typeof context['min'] !== 'undefined') {
            properties['min'] = context['min'];
        }

        if (typeof context['max'] !== 'undefined') {
            properties['max'] = context['max'];
        }

        if (typeof context['step'] !== 'undefined') {
            properties['step'] = context['step'];
        }

        if (typeof context['default'] !== 'undefined') {
            properties['default'] = context['default'];
        }

        if (typeof context['prepend'] !== 'undefined') {
            properties['prepend'] = context['prepend'];
        }

        if (typeof context['append'] !== 'undefined') {
            properties['append'] = context['append'];
        }

    }    if (contextType == 'revealer') {

        if (typeof context['mode'] !== 'undefined') {
            properties['mode'] = context['mode'];
        }

        if (typeof context['inputLabel'] !== 'undefined') {
            properties['input_label'] = context['inputLabel'];
        }

    }    if (contextType == 'section') {

    }    if (contextType == 'select') {

        if (typeof context['placeholder'] !== 'undefined') {
            properties['placeholder'] = context['placeholder'];
        }

        if (typeof context['options'] !== 'undefined') {
            properties['options'] = context['options'];
        }

        if (typeof context['multiple'] !== 'undefined') {
            properties['multiple'] = context['multiple'];
        }

        if (typeof context['maxItems'] !== 'undefined') {
            properties['max_items'] = context['maxItems'];
        }

        if (typeof context['clearable'] !== 'undefined') {
            properties['clearable'] = context['clearable'];
        }

        if (typeof context['searchable'] !== 'undefined') {
            properties['searchable'] = context['searchable'];
        }

        if (typeof context['taggable'] !== 'undefined') {
            properties['taggable'] = context['taggable'];
        }

        if (typeof context['pushTags'] !== 'undefined') {
            properties['push_tags'] = context['pushTags'];
        }

        if (typeof context['castBooleans'] !== 'undefined') {
            properties['cast_booleans'] = context['castBooleans'];
        }

        if (typeof context['default'] !== 'undefined') {
            properties['default'] = context['default'];
        }

    }    if (contextType == 'sets') {

    }    if (contextType == 'sites') {

        if (typeof context['maxItems'] !== 'undefined') {
            properties['max_items'] = context['maxItems'];
        }

        if (typeof context['mode'] !== 'undefined') {
            properties['mode'] = context['mode'];
        }

    }    if (contextType == 'structures') {

        if (typeof context['maxItems'] !== 'undefined') {
            properties['max_items'] = context['maxItems'];
        }

        if (typeof context['mode'] !== 'undefined') {
            properties['mode'] = context['mode'];
        }

    }    if (contextType == 'slug') {

        if (typeof context['from'] !== 'undefined') {
            properties['from'] = context['from'];
        }

        if (typeof context['generate'] !== 'undefined') {
            properties['generate'] = context['generate'];
        }

    }    if (contextType == 'text') {

        if (typeof context['placeholder'] !== 'undefined') {
            properties['placeholder'] = context['placeholder'];
        }

        if (typeof context['inputType'] !== 'undefined') {
            properties['input_type'] = context['inputType'];
        }

        if (typeof context['characterLimit'] !== 'undefined') {
            properties['character_limit'] = context['characterLimit'];
        }

        if (typeof context['prepend'] !== 'undefined') {
            properties['prepend'] = context['prepend'];
        }

        if (typeof context['append'] !== 'undefined') {
            properties['append'] = context['append'];
        }

        if (typeof context['antlers'] !== 'undefined') {
            properties['antlers'] = context['antlers'];
        }

        if (typeof context['default'] !== 'undefined') {
            properties['default'] = context['default'];
        }

    }    if (contextType == 'table') {

    }    if (contextType == 'taggable') {

        if (typeof context['placeholder'] !== 'undefined') {
            properties['placeholder'] = context['placeholder'];
        }

    }    if (contextType == 'terms') {

        if (typeof context['maxItems'] !== 'undefined') {
            properties['max_items'] = context['maxItems'];
        }

        if (typeof context['mode'] !== 'undefined') {
            properties['mode'] = context['mode'];
        }

        if (typeof context['create'] !== 'undefined') {
            properties['create'] = context['create'];
        }

        if (typeof context['taxonomies'] !== 'undefined') {
            properties['taxonomies'] = context['taxonomies'];
        }

    }    if (contextType == 'taxonomies') {

        if (typeof context['maxItems'] !== 'undefined') {
            properties['max_items'] = context['maxItems'];
        }

        if (typeof context['mode'] !== 'undefined') {
            properties['mode'] = context['mode'];
        }

    }    if (contextType == 'template') {

        if (typeof context['hidePartials'] !== 'undefined') {
            properties['hide_partials'] = context['hidePartials'];
        }

        if (typeof context['blueprint'] !== 'undefined') {
            properties['blueprint'] = context['blueprint'];
        }

        if (typeof context['folder'] !== 'undefined') {
            properties['folder'] = context['folder'];
        }

    }    if (contextType == 'template_folder') {

        if (typeof context['maxItems'] !== 'undefined') {
            properties['max_items'] = context['maxItems'];
        }

        if (typeof context['mode'] !== 'undefined') {
            properties['mode'] = context['mode'];
        }

    }    if (contextType == 'textarea') {

        if (typeof context['placeholder'] !== 'undefined') {
            properties['placeholder'] = context['placeholder'];
        }

        if (typeof context['characterLimit'] !== 'undefined') {
            properties['character_limit'] = context['characterLimit'];
        }

        if (typeof context['antlers'] !== 'undefined') {
            properties['antlers'] = context['antlers'];
        }

        if (typeof context['default'] !== 'undefined') {
            properties['default'] = context['default'];
        }

    }    if (contextType == 'time') {

        if (typeof context['secondsEnabled'] !== 'undefined') {
            properties['seconds_enabled'] = context['secondsEnabled'];
        }

        if (typeof context['default'] !== 'undefined') {
            properties['default'] = context['default'];
        }

    }    if (contextType == 'toggle') {

        if (typeof context['inlineLabel'] !== 'undefined') {
            properties['inline_label'] = context['inlineLabel'];
        }

        if (typeof context['default'] !== 'undefined') {
            properties['default'] = context['default'];
        }

    }    if (contextType == 'user_groups') {

        if (typeof context['maxItems'] !== 'undefined') {
            properties['max_items'] = context['maxItems'];
        }

        if (typeof context['mode'] !== 'undefined') {
            properties['mode'] = context['mode'];
        }

    }    if (contextType == 'user_roles') {

        if (typeof context['maxItems'] !== 'undefined') {
            properties['max_items'] = context['maxItems'];
        }

        if (typeof context['mode'] !== 'undefined') {
            properties['mode'] = context['mode'];
        }

    }    if (contextType == 'users') {

        if (typeof context['maxItems'] !== 'undefined') {
            properties['max_items'] = context['maxItems'];
        }

        if (typeof context['mode'] !== 'undefined') {
            properties['mode'] = context['mode'];
        }

    }    if (contextType == 'video') {

        if (typeof context['default'] !== 'undefined') {
            properties['default'] = context['default'];
        }

        if (typeof context['placeholder'] !== 'undefined') {
            properties['placeholder'] = context['placeholder'];
        }

    }    if (contextType == 'yaml') {

        if (typeof context['default'] !== 'undefined') {
            properties['default'] = context['default'];
        }

    }    if (contextType == 'form') {

        if (typeof context['placeholder'] !== 'undefined') {
            properties['placeholder'] = context['placeholder'];
        }

        if (typeof context['maxItems'] !== 'undefined') {
            properties['max_items'] = context['maxItems'];
        }

    }

    return properties;
}class FieldParser {
    private fieldSets: Map<string, IParsedFieldset> = new Map();

    setFieldSets(fieldSets: Map<string, IParsedFieldset>) {
        this.fieldSets = fieldSets;
    }_parseArrayFieldType(context: any): IArrayFieldType {
    let _parsedMode = fetchDynamic<string>(context['field'], 'mode', 'dynamic');
    let _parsedKeys = fetchDynamic<string[] | null>(context['field'], 'keys', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        mode: _parsedMode,
        keys: _parsedKeys,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'array',
    };
}

_parseAssetContainerFieldType(context: any): IAssetContainerFieldType {
    let _parsedMaxItems = fetchDynamic<number | null>(context['field'], 'max_items', null);
    let _parsedMode = fetchDynamic<string>(context['field'], 'mode', 'default');

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        maxItems: _parsedMaxItems,
        mode: _parsedMode,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'asset_container',
    };
}

_parseAssetFolderFieldType(context: any): IAssetFolderFieldType {
    let _parsedMaxItems = fetchDynamic<number | null>(context['field'], 'max_items', null);
    let _parsedMode = fetchDynamic<string>(context['field'], 'mode', 'default');

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        maxItems: _parsedMaxItems,
        mode: _parsedMode,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'asset_folder',
    };
}

_parseAssetsFieldType(context: any): IAssetsFieldType {
    let _parsedMode = fetchDynamic<string>(context['field'], 'mode', 'list');
    let _parsedContainer = fetchDynamic<string>(context['field'], 'container', 'assets');
    let _parsedFolder = fetchDynamic<IAssetFolderFieldType | null>(context['field'], 'folder', null);
    let _parsedRestrict = fetchDynamic<boolean | null>(context['field'], 'restrict', null);
    let _parsedAllowUploads = fetchDynamic<boolean>(context['field'], 'allow_uploads', true);
    let _parsedShowFilename = fetchDynamic<boolean>(context['field'], 'show_filename', true);
    let _parsedMaxFiles = fetchDynamic<number | null>(context['field'], 'max_files', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        mode: _parsedMode,
        container: _parsedContainer,
        folder: _parsedFolder,
        restrict: _parsedRestrict,
        allowUploads: _parsedAllowUploads,
        showFilename: _parsedShowFilename,
        maxFiles: _parsedMaxFiles,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'assets',
    };
}

_parseBardFieldType(context: any): IBardFieldType {
    let _parsedCollapse = fetchDynamic<string | null>(context['field'], 'collapse', null);
    let _parsedAlwaysShowSetButton = fetchDynamic<boolean | null>(context['field'], 'always_show_set_button', null);
    let _parsedPreviews = fetchDynamic<boolean>(context['field'], 'previews', true);
    let _parsedButtons = fetchDynamic<any[]>(context['field'], 'buttons', ['h2', 'h3', 'bold', 'italic', 'unorderedlist', 'orderedlist', 'removeformat', 'quote', 'anchor', 'image', 'table', ]);
    let _parsedContainer = fetchDynamic<string | null>(context['field'], 'container', null);
    let _parsedSaveHtml = fetchDynamic<boolean | null>(context['field'], 'save_html', null);
    let _parsedToolbarMode = fetchDynamic<string>(context['field'], 'toolbar_mode', 'fixed');
    let _parsedLinkNoopener = fetchDynamic<boolean | null>(context['field'], 'link_noopener', null);
    let _parsedLinkNoreferrer = fetchDynamic<boolean | null>(context['field'], 'link_noreferrer', null);
    let _parsedTargetBlank = fetchDynamic<boolean | null>(context['field'], 'target_blank', null);
    let _parsedLinkCollections = fetchDynamic<string[] | null>(context['field'], 'link_collections', null);
    let _parsedReadingTime = fetchDynamic<boolean | null>(context['field'], 'reading_time', null);
    let _parsedFullscreen = fetchDynamic<boolean>(context['field'], 'fullscreen', true);
    let _parsedAllowSource = fetchDynamic<boolean>(context['field'], 'allow_source', true);
    let _parsedEnableInputRules = fetchDynamic<boolean>(context['field'], 'enable_input_rules', true);
    let _parsedEnablePasteRules = fetchDynamic<boolean>(context['field'], 'enable_paste_rules', true);
    let _parsedAntlers = fetchDynamic<boolean | null>(context['field'], 'antlers', null);
    let _parsedRemoveEmptyNodes = fetchDynamic<string>(context['field'], 'remove_empty_nodes', 'false');

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        collapse: _parsedCollapse,
        alwaysShowSetButton: _parsedAlwaysShowSetButton,
        previews: _parsedPreviews,
        buttons: _parsedButtons,
        container: _parsedContainer,
        saveHtml: _parsedSaveHtml,
        toolbarMode: _parsedToolbarMode,
        linkNoopener: _parsedLinkNoopener,
        linkNoreferrer: _parsedLinkNoreferrer,
        targetBlank: _parsedTargetBlank,
        linkCollections: _parsedLinkCollections,
        readingTime: _parsedReadingTime,
        fullscreen: _parsedFullscreen,
        allowSource: _parsedAllowSource,
        enableInputRules: _parsedEnableInputRules,
        enablePasteRules: _parsedEnablePasteRules,
        antlers: _parsedAntlers,
        removeEmptyNodes: _parsedRemoveEmptyNodes,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'bard',
    };
}

_parseReplicatorFieldType(context: any): IReplicatorFieldType {
    let _parsedCollapse = fetchDynamic<string | null>(context['field'], 'collapse', null);
    let _parsedPreviews = fetchDynamic<boolean>(context['field'], 'previews', true);
    let _parsedMaxSets = fetchDynamic<number | null>(context['field'], 'max_sets', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        collapse: _parsedCollapse,
        previews: _parsedPreviews,
        maxSets: _parsedMaxSets,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'replicator',
    };
}

_parseBardButtonsSettingFieldType(context: any): IBardButtonsSettingFieldType {

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'bard_buttons_setting',
    };
}

_parseButtonGroupFieldType(context: any): IButtonGroupFieldType {
    let _parsedOptions = fetchDynamic<string[] | null>(context['field'], 'options', null);
    let _parsedDefault = fetchDynamic<string | null>(context['field'], 'default', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        options: _parsedOptions,
        default: _parsedDefault,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'button_group',
    };
}

_parseCheckboxesFieldType(context: any): ICheckboxesFieldType {
    let _parsedInline = fetchDynamic<boolean | null>(context['field'], 'inline', null);
    let _parsedOptions = fetchDynamic<string[] | null>(context['field'], 'options', null);
    let _parsedDefault = fetchDynamic<string | null>(context['field'], 'default', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        inline: _parsedInline,
        options: _parsedOptions,
        default: _parsedDefault,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'checkboxes',
    };
}

_parseCodeFieldType(context: any): ICodeFieldType {
    let _parsedTheme = fetchDynamic<string>(context['field'], 'theme', 'material');
    let _parsedMode = fetchDynamic<string>(context['field'], 'mode', 'htmlmixed');
    let _parsedModeSelectable = fetchDynamic<boolean | null>(context['field'], 'mode_selectable', null);
    let _parsedIndentType = fetchDynamic<string>(context['field'], 'indent_type', 'tabs');
    let _parsedIndentSize = fetchDynamic<number>(context['field'], 'indent_size', 4);
    let _parsedKeyMap = fetchDynamic<string>(context['field'], 'key_map', 'default');
    let _parsedLineNumbers = fetchDynamic<boolean>(context['field'], 'line_numbers', true);
    let _parsedLineWrapping = fetchDynamic<boolean>(context['field'], 'line_wrapping', true);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        theme: _parsedTheme,
        mode: _parsedMode,
        modeSelectable: _parsedModeSelectable,
        indentType: _parsedIndentType,
        indentSize: _parsedIndentSize,
        keyMap: _parsedKeyMap,
        lineNumbers: _parsedLineNumbers,
        lineWrapping: _parsedLineWrapping,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'code',
    };
}

_parseCollectionRoutesFieldType(context: any): ICollectionRoutesFieldType {

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'collection_routes',
    };
}

_parseCollectionTitleFormatsFieldType(context: any): ICollectionTitleFormatsFieldType {

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'collection_title_formats',
    };
}

_parseCollectionsFieldType(context: any): ICollectionsFieldType {
    let _parsedMaxItems = fetchDynamic<number | null>(context['field'], 'max_items', null);
    let _parsedMode = fetchDynamic<string>(context['field'], 'mode', 'default');

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        maxItems: _parsedMaxItems,
        mode: _parsedMode,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'collections',
    };
}

_parseColorFieldType(context: any): IColorFieldType {
    let _parsedSwatches = fetchDynamic<string[] | null>(context['field'], 'swatches', null);
    let _parsedTheme = fetchDynamic<string>(context['field'], 'theme', 'classic');
    let _parsedLockOpacity = fetchDynamic<boolean | null>(context['field'], 'lock_opacity', null);
    let _parsedDefaultColorMode = fetchDynamic<string>(context['field'], 'default_color_mode', 'HEXA');
    let _parsedColorModes = fetchDynamic<string[]>(context['field'], 'color_modes', ['HEXA', 'RGBA', 'HSLA', 'HSVA', 'CMYK', ]);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        swatches: _parsedSwatches,
        theme: _parsedTheme,
        lockOpacity: _parsedLockOpacity,
        defaultColorMode: _parsedDefaultColorMode,
        colorModes: _parsedColorModes,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'color',
    };
}

_parseDateFieldType(context: any): IDateFieldType {
    let _parsedMode = fetchDynamic<string>(context['field'], 'mode', 'single');
    let _parsedFormat = fetchDynamic<string | null>(context['field'], 'format', null);
    let _parsedEarliestDate = fetchDynamic<string | null>(context['field'], 'earliest_date', null);
    let _parsedLatestDate = fetchDynamic<string | null>(context['field'], 'latest_date', null);
    let _parsedTimeEnabled = fetchDynamic<boolean | null>(context['field'], 'time_enabled', null);
    let _parsedTimeSecondsEnabled = fetchDynamic<boolean | null>(context['field'], 'time_seconds_enabled', null);
    let _parsedFullWidth = fetchDynamic<boolean | null>(context['field'], 'full_width', null);
    let _parsedInline = fetchDynamic<boolean | null>(context['field'], 'inline', null);
    let _parsedColumns = fetchDynamic<number>(context['field'], 'columns', 1);
    let _parsedRows = fetchDynamic<number>(context['field'], 'rows', 1);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        mode: _parsedMode,
        format: _parsedFormat,
        earliestDate: _parsedEarliestDate,
        latestDate: _parsedLatestDate,
        timeEnabled: _parsedTimeEnabled,
        timeSecondsEnabled: _parsedTimeSecondsEnabled,
        fullWidth: _parsedFullWidth,
        inline: _parsedInline,
        columns: _parsedColumns,
        rows: _parsedRows,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'date',
    };
}

_parseEntriesFieldType(context: any): IEntriesFieldType {
    let _parsedMaxItems = fetchDynamic<number | null>(context['field'], 'max_items', null);
    let _parsedMode = fetchDynamic<string>(context['field'], 'mode', 'default');
    let _parsedCreate = fetchDynamic<boolean>(context['field'], 'create', true);
    let _parsedCollections = fetchDynamic<string[] | null>(context['field'], 'collections', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        maxItems: _parsedMaxItems,
        mode: _parsedMode,
        create: _parsedCreate,
        collections: _parsedCollections,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'entries',
    };
}

_parseFilesFieldType(context: any): IFilesFieldType {
    let _parsedMaxFiles = fetchDynamic<number | null>(context['field'], 'max_files', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        maxFiles: _parsedMaxFiles,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'files',
    };
}

_parseFloatFieldType(context: any): IFloatFieldType {
    let _parsedDefault = fetchDynamic<string | null>(context['field'], 'default', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        default: _parsedDefault,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'float',
    };
}

_parseGlobalSetSitesFieldType(context: any): IGlobalSetSitesFieldType {

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'global_set_sites',
    };
}

_parseGridFieldType(context: any): IGridFieldType {
    let _parsedMode = fetchDynamic<string>(context['field'], 'mode', 'table');
    let _parsedMaxRows = fetchDynamic<number | null>(context['field'], 'max_rows', null);
    let _parsedMinRows = fetchDynamic<number | null>(context['field'], 'min_rows', null);
    let _parsedAddRow = fetchDynamic<string | null>(context['field'], 'add_row', null);
    let _parsedReorderable = fetchDynamic<boolean>(context['field'], 'reorderable', true);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        mode: _parsedMode,
        maxRows: _parsedMaxRows,
        minRows: _parsedMinRows,
        addRow: _parsedAddRow,
        reorderable: _parsedReorderable,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'grid',
    };
}

_parseHiddenFieldType(context: any): IHiddenFieldType {
    let _parsedDefault = fetchDynamic<string | null>(context['field'], 'default', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        default: _parsedDefault,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'hidden',
    };
}

_parseHtmlFieldType(context: any): IHtmlFieldType {
    let _parsedHtml = fetchDynamic<string | null>(context['field'], 'html', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        html: _parsedHtml,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'html',
    };
}

_parseIntegerFieldType(context: any): IIntegerFieldType {
    let _parsedDefault = fetchDynamic<string | null>(context['field'], 'default', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        default: _parsedDefault,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'integer',
    };
}

_parseLinkFieldType(context: any): ILinkFieldType {
    let _parsedCollections = fetchDynamic<string[] | null>(context['field'], 'collections', null);
    let _parsedContainer = fetchDynamic<string | null>(context['field'], 'container', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        collections: _parsedCollections,
        container: _parsedContainer,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'link',
    };
}

_parseListFieldType(context: any): IListFieldType {
    let _parsedDefault = fetchDynamic<string[] | null>(context['field'], 'default', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        default: _parsedDefault,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'list',
    };
}

_parseMarkdownFieldType(context: any): IMarkdownFieldType {
    let _parsedContainer = fetchDynamic<string | null>(context['field'], 'container', null);
    let _parsedFolder = fetchDynamic<IAssetFolderFieldType | null>(context['field'], 'folder', null);
    let _parsedRestrict = fetchDynamic<boolean | null>(context['field'], 'restrict', null);
    let _parsedAutomaticLineBreaks = fetchDynamic<boolean>(context['field'], 'automatic_line_breaks', true);
    let _parsedAutomaticLinks = fetchDynamic<boolean | null>(context['field'], 'automatic_links', null);
    let _parsedEscapeMarkup = fetchDynamic<boolean | null>(context['field'], 'escape_markup', null);
    let _parsedSmartypants = fetchDynamic<boolean | null>(context['field'], 'smartypants', null);
    let _parsedParser = fetchDynamic<string | null>(context['field'], 'parser', null);
    let _parsedAntlers = fetchDynamic<boolean | null>(context['field'], 'antlers', null);
    let _parsedDefault = fetchDynamic<string | null>(context['field'], 'default', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        container: _parsedContainer,
        folder: _parsedFolder,
        restrict: _parsedRestrict,
        automaticLineBreaks: _parsedAutomaticLineBreaks,
        automaticLinks: _parsedAutomaticLinks,
        escapeMarkup: _parsedEscapeMarkup,
        smartypants: _parsedSmartypants,
        parser: _parsedParser,
        antlers: _parsedAntlers,
        default: _parsedDefault,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'markdown',
    };
}

_parseFieldsFieldType(context: any): IFieldsFieldType {

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'fields',
    };
}

_parseRadioFieldType(context: any): IRadioFieldType {
    let _parsedOptions = fetchDynamic<string[] | null>(context['field'], 'options', null);
    let _parsedInline = fetchDynamic<boolean | null>(context['field'], 'inline', null);
    let _parsedCastBooleans = fetchDynamic<boolean | null>(context['field'], 'cast_booleans', null);
    let _parsedDefault = fetchDynamic<string | null>(context['field'], 'default', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        options: _parsedOptions,
        inline: _parsedInline,
        castBooleans: _parsedCastBooleans,
        default: _parsedDefault,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'radio',
    };
}

_parseRangeFieldType(context: any): IRangeFieldType {
    let _parsedHidden = fetchDynamic<string | null>(context['field'], 'hidden', null);
    let _parsedMin = fetchDynamic<number | null>(context['field'], 'min', null);
    let _parsedMax = fetchDynamic<number>(context['field'], 'max', 100);
    let _parsedStep = fetchDynamic<number>(context['field'], 'step', 1);
    let _parsedDefault = fetchDynamic<string | null>(context['field'], 'default', null);
    let _parsedPrepend = fetchDynamic<string | null>(context['field'], 'prepend', null);
    let _parsedAppend = fetchDynamic<string | null>(context['field'], 'append', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        hidden: _parsedHidden,
        min: _parsedMin,
        max: _parsedMax,
        step: _parsedStep,
        default: _parsedDefault,
        prepend: _parsedPrepend,
        append: _parsedAppend,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'range',
    };
}

_parseRevealerFieldType(context: any): IRevealerFieldType {
    let _parsedMode = fetchDynamic<string>(context['field'], 'mode', 'button');
    let _parsedInputLabel = fetchDynamic<string>(context['field'], 'input_label', '');

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        mode: _parsedMode,
        inputLabel: _parsedInputLabel,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'revealer',
    };
}

_parseSectionFieldType(context: any): ISectionFieldType {

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'section',
    };
}

_parseSelectFieldType(context: any): ISelectFieldType {
    let _parsedPlaceholder = fetchDynamic<string>(context['field'], 'placeholder', '');
    let _parsedOptions = fetchDynamic<string[] | null>(context['field'], 'options', null);
    let _parsedMultiple = fetchDynamic<boolean | null>(context['field'], 'multiple', null);
    let _parsedMaxItems = fetchDynamic<number | null>(context['field'], 'max_items', null);
    let _parsedClearable = fetchDynamic<boolean | null>(context['field'], 'clearable', null);
    let _parsedSearchable = fetchDynamic<boolean>(context['field'], 'searchable', true);
    let _parsedTaggable = fetchDynamic<boolean | null>(context['field'], 'taggable', null);
    let _parsedPushTags = fetchDynamic<boolean | null>(context['field'], 'push_tags', null);
    let _parsedCastBooleans = fetchDynamic<boolean | null>(context['field'], 'cast_booleans', null);
    let _parsedDefault = fetchDynamic<string | null>(context['field'], 'default', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        placeholder: _parsedPlaceholder,
        options: _parsedOptions,
        multiple: _parsedMultiple,
        maxItems: _parsedMaxItems,
        clearable: _parsedClearable,
        searchable: _parsedSearchable,
        taggable: _parsedTaggable,
        pushTags: _parsedPushTags,
        castBooleans: _parsedCastBooleans,
        default: _parsedDefault,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'select',
    };
}

_parseSetsFieldType(context: any): ISetsFieldType {

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'sets',
    };
}

_parseSitesFieldType(context: any): ISitesFieldType {
    let _parsedMaxItems = fetchDynamic<number | null>(context['field'], 'max_items', null);
    let _parsedMode = fetchDynamic<string>(context['field'], 'mode', 'default');

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        maxItems: _parsedMaxItems,
        mode: _parsedMode,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'sites',
    };
}

_parseStructuresFieldType(context: any): IStructuresFieldType {
    let _parsedMaxItems = fetchDynamic<number | null>(context['field'], 'max_items', null);
    let _parsedMode = fetchDynamic<string>(context['field'], 'mode', 'default');

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        maxItems: _parsedMaxItems,
        mode: _parsedMode,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'structures',
    };
}

_parseSlugFieldType(context: any): ISlugFieldType {
    let _parsedFrom = fetchDynamic<string>(context['field'], 'from', 'title');
    let _parsedGenerate = fetchDynamic<boolean>(context['field'], 'generate', true);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        from: _parsedFrom,
        generate: _parsedGenerate,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'slug',
    };
}

_parseTextFieldType(context: any): ITextFieldType {
    let _parsedPlaceholder = fetchDynamic<string | null>(context['field'], 'placeholder', null);
    let _parsedInputType = fetchDynamic<string>(context['field'], 'input_type', 'text');
    let _parsedCharacterLimit = fetchDynamic<number | null>(context['field'], 'character_limit', null);
    let _parsedPrepend = fetchDynamic<string | null>(context['field'], 'prepend', null);
    let _parsedAppend = fetchDynamic<string | null>(context['field'], 'append', null);
    let _parsedAntlers = fetchDynamic<boolean | null>(context['field'], 'antlers', null);
    let _parsedDefault = fetchDynamic<string | null>(context['field'], 'default', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        placeholder: _parsedPlaceholder,
        inputType: _parsedInputType,
        characterLimit: _parsedCharacterLimit,
        prepend: _parsedPrepend,
        append: _parsedAppend,
        antlers: _parsedAntlers,
        default: _parsedDefault,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'text',
    };
}

_parseTableFieldType(context: any): ITableFieldType {

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'table',
    };
}

_parseTaggableFieldType(context: any): ITaggableFieldType {
    let _parsedPlaceholder = fetchDynamic<string>(context['field'], 'placeholder', '');

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        placeholder: _parsedPlaceholder,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'tags',
    };
}

_parseTermsFieldType(context: any): ITermsFieldType {
    let _parsedMaxItems = fetchDynamic<number | null>(context['field'], 'max_items', null);
    let _parsedMode = fetchDynamic<string>(context['field'], 'mode', 'default');
    let _parsedCreate = fetchDynamic<boolean>(context['field'], 'create', true);
    let _parsedTaxonomies = fetchDynamic<string[] | null>(context['field'], 'taxonomies', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        maxItems: _parsedMaxItems,
        mode: _parsedMode,
        create: _parsedCreate,
        taxonomies: _parsedTaxonomies,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'taxonomy',
    };
}

_parseTaxonomiesFieldType(context: any): ITaxonomiesFieldType {
    let _parsedMaxItems = fetchDynamic<number | null>(context['field'], 'max_items', null);
    let _parsedMode = fetchDynamic<string>(context['field'], 'mode', 'default');

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        maxItems: _parsedMaxItems,
        mode: _parsedMode,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'taxonomy',
    };
}

_parseTemplateFieldType(context: any): ITemplateFieldType {
    let _parsedHidePartials = fetchDynamic<boolean>(context['field'], 'hide_partials', true);
    let _parsedBlueprint = fetchDynamic<boolean | null>(context['field'], 'blueprint', null);
    let _parsedFolder = fetchDynamic<string | null>(context['field'], 'folder', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        hidePartials: _parsedHidePartials,
        blueprint: _parsedBlueprint,
        folder: _parsedFolder,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'template',
    };
}

_parseTemplateFolderFieldType(context: any): ITemplateFolderFieldType {
    let _parsedMaxItems = fetchDynamic<number | null>(context['field'], 'max_items', null);
    let _parsedMode = fetchDynamic<string>(context['field'], 'mode', 'default');

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        maxItems: _parsedMaxItems,
        mode: _parsedMode,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'template_folder',
    };
}

_parseTextareaFieldType(context: any): ITextareaFieldType {
    let _parsedPlaceholder = fetchDynamic<string | null>(context['field'], 'placeholder', null);
    let _parsedCharacterLimit = fetchDynamic<string | null>(context['field'], 'character_limit', null);
    let _parsedAntlers = fetchDynamic<boolean | null>(context['field'], 'antlers', null);
    let _parsedDefault = fetchDynamic<string | null>(context['field'], 'default', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        placeholder: _parsedPlaceholder,
        characterLimit: _parsedCharacterLimit,
        antlers: _parsedAntlers,
        default: _parsedDefault,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'textarea',
    };
}

_parseTimeFieldType(context: any): ITimeFieldType {
    let _parsedSecondsEnabled = fetchDynamic<boolean | null>(context['field'], 'seconds_enabled', null);
    let _parsedDefault = fetchDynamic<string | null>(context['field'], 'default', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        secondsEnabled: _parsedSecondsEnabled,
        default: _parsedDefault,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'time',
    };
}

_parseToggleFieldType(context: any): IToggleFieldType {
    let _parsedInlineLabel = fetchDynamic<string>(context['field'], 'inline_label', '');
    let _parsedDefault = fetchDynamic<boolean | null>(context['field'], 'default', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        inlineLabel: _parsedInlineLabel,
        default: _parsedDefault,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'toggle',
    };
}

_parseUserGroupsFieldType(context: any): IUserGroupsFieldType {
    let _parsedMaxItems = fetchDynamic<number | null>(context['field'], 'max_items', null);
    let _parsedMode = fetchDynamic<string>(context['field'], 'mode', 'default');

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        maxItems: _parsedMaxItems,
        mode: _parsedMode,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'user_groups',
    };
}

_parseUserRolesFieldType(context: any): IUserRolesFieldType {
    let _parsedMaxItems = fetchDynamic<number | null>(context['field'], 'max_items', null);
    let _parsedMode = fetchDynamic<string>(context['field'], 'mode', 'default');

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        maxItems: _parsedMaxItems,
        mode: _parsedMode,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'user_roles',
    };
}

_parseUsersFieldType(context: any): IUsersFieldType {
    let _parsedMaxItems = fetchDynamic<number | null>(context['field'], 'max_items', null);
    let _parsedMode = fetchDynamic<string>(context['field'], 'mode', 'select');

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        maxItems: _parsedMaxItems,
        mode: _parsedMode,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'users',
    };
}

_parseVideoFieldType(context: any): IVideoFieldType {
    let _parsedDefault = fetchDynamic<string | null>(context['field'], 'default', null);
    let _parsedPlaceholder = fetchDynamic<string | null>(context['field'], 'placeholder', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        default: _parsedDefault,
        placeholder: _parsedPlaceholder,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'video',
    };
}

_parseYamlFieldType(context: any): IYamlFieldType {
    let _parsedDefault = fetchDynamic<string | null>(context['field'], 'default', null);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        default: _parsedDefault,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'yaml',
    };
}

_parseFormFieldType(context: any): IFormFieldType {
    let _parsedPlaceholder = fetchDynamic<string | null>(context['field'], 'placeholder', null);
    let _parsedMaxItems = fetchDynamic<number>(context['field'], 'max_items', 1);

        let _tSets: ISet[] = [];
        let _tFields: IFieldDetails[] = [];
        if (typeof context['field'] !== 'undefined' && typeof context['field']['sets'] !== 'undefined') {
            _tSets = this.parseSets(context['field']['sets']);
        }
        
        if (typeof context['field'] !== 'undefined' && typeof context['field']['fields'] !== 'undefined') {
            _tFields = this.parseFields(context['field']);
        }

    const isRequired: boolean = fetchDynamic<boolean>(context['field'], 'required', false),
        type: string = fetchDynamic<string>(context['field'], 'type', 'text'),
        unlessArray:string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
        validateArray:string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
        display:string = fetchDynamic<string>(context['field'], 'display', ''),
        developerDocumentation:string = fetchDynamic<string>(context['field'], '__documentation', ''),
        instructionText:string = fetchDynamic<string>(context['field'], 'instructions', '');
    return {
        placeholder: _parsedPlaceholder,
        maxItems: _parsedMaxItems,
        required: isRequired,
        type: type,
        validate: validateArray,
        unless: unlessArray,
        display: display,
        handle: 'temp_handle',
        sets: _tSets,
        fields: _tFields,
        isLinked: false,
        linkedFrom: '',
        developerDocumentation: developerDocumentation,
        instructionText: instructionText,
        internalIcon: 'form',
    };
}

    parse(context:any) : IFieldDetails | null {    const fields:IFieldDetails[] = [];
if (typeof context.field !== 'undefined' && typeof context.field.type !== 'undefined') {
    const fType = context.field.type as string;
if (fType == 'array') {
    fields.push(this._parseArrayFieldType(context));
}
if (fType == 'asset_container') {
    fields.push(this._parseAssetContainerFieldType(context));
}
if (fType == 'asset_folder') {
    fields.push(this._parseAssetFolderFieldType(context));
}
if (fType == 'assets') {
    fields.push(this._parseAssetsFieldType(context));
}
if (fType == 'bard') {
    fields.push(this._parseBardFieldType(context));
}
if (fType == 'replicator') {
    fields.push(this._parseReplicatorFieldType(context));
}
if (fType == 'bard_buttons_setting') {
    fields.push(this._parseBardButtonsSettingFieldType(context));
}
if (fType == 'button_group') {
    fields.push(this._parseButtonGroupFieldType(context));
}
if (fType == 'checkboxes') {
    fields.push(this._parseCheckboxesFieldType(context));
}
if (fType == 'code') {
    fields.push(this._parseCodeFieldType(context));
}
if (fType == 'collection_routes') {
    fields.push(this._parseCollectionRoutesFieldType(context));
}
if (fType == 'collection_title_formats') {
    fields.push(this._parseCollectionTitleFormatsFieldType(context));
}
if (fType == 'collections') {
    fields.push(this._parseCollectionsFieldType(context));
}
if (fType == 'color') {
    fields.push(this._parseColorFieldType(context));
}
if (fType == 'date') {
    fields.push(this._parseDateFieldType(context));
}
if (fType == 'entries') {
    fields.push(this._parseEntriesFieldType(context));
}
if (fType == 'files') {
    fields.push(this._parseFilesFieldType(context));
}
if (fType == 'float') {
    fields.push(this._parseFloatFieldType(context));
}
if (fType == 'global_set_sites') {
    fields.push(this._parseGlobalSetSitesFieldType(context));
}
if (fType == 'grid') {
    fields.push(this._parseGridFieldType(context));
}
if (fType == 'hidden') {
    fields.push(this._parseHiddenFieldType(context));
}
if (fType == 'html') {
    fields.push(this._parseHtmlFieldType(context));
}
if (fType == 'integer') {
    fields.push(this._parseIntegerFieldType(context));
}
if (fType == 'link') {
    fields.push(this._parseLinkFieldType(context));
}
if (fType == 'list') {
    fields.push(this._parseListFieldType(context));
}
if (fType == 'markdown') {
    fields.push(this._parseMarkdownFieldType(context));
}
if (fType == 'fields') {
    fields.push(this._parseFieldsFieldType(context));
}
if (fType == 'radio') {
    fields.push(this._parseRadioFieldType(context));
}
if (fType == 'range') {
    fields.push(this._parseRangeFieldType(context));
}
if (fType == 'revealer') {
    fields.push(this._parseRevealerFieldType(context));
}
if (fType == 'section') {
    fields.push(this._parseSectionFieldType(context));
}
if (fType == 'select') {
    fields.push(this._parseSelectFieldType(context));
}
if (fType == 'sets') {
    fields.push(this._parseSetsFieldType(context));
}
if (fType == 'sites') {
    fields.push(this._parseSitesFieldType(context));
}
if (fType == 'structures') {
    fields.push(this._parseStructuresFieldType(context));
}
if (fType == 'slug') {
    fields.push(this._parseSlugFieldType(context));
}
if (fType == 'text') {
    fields.push(this._parseTextFieldType(context));
}
if (fType == 'table') {
    fields.push(this._parseTableFieldType(context));
}
if (fType == 'taggable') {
    fields.push(this._parseTaggableFieldType(context));
}
if (fType == 'terms') {
    fields.push(this._parseTermsFieldType(context));
}
if (fType == 'taxonomies') {
    fields.push(this._parseTaxonomiesFieldType(context));
}
if (fType == 'template') {
    fields.push(this._parseTemplateFieldType(context));
}
if (fType == 'template_folder') {
    fields.push(this._parseTemplateFolderFieldType(context));
}
if (fType == 'textarea') {
    fields.push(this._parseTextareaFieldType(context));
}
if (fType == 'time') {
    fields.push(this._parseTimeFieldType(context));
}
if (fType == 'toggle') {
    fields.push(this._parseToggleFieldType(context));
}
if (fType == 'user_groups') {
    fields.push(this._parseUserGroupsFieldType(context));
}
if (fType == 'user_roles') {
    fields.push(this._parseUserRolesFieldType(context));
}
if (fType == 'users') {
    fields.push(this._parseUsersFieldType(context));
}
if (fType == 'video') {
    fields.push(this._parseVideoFieldType(context));
}
if (fType == 'yaml') {
    fields.push(this._parseYamlFieldType(context));
}
if (fType == 'form') {
    fields.push(this._parseFormFieldType(context));
}
}
    if (fields.length == 1) { return fields[0]; }    return null;


}    parseFields(context: any): IFieldDetails[] {
        const fields: IFieldDetails[] = [];

        if (typeof context['fields'] === 'undefined' || context['fields'] == null) {
            return fields;
        }
        
        if (typeof context['fields'] === 'object' && !Array.isArray(context['fields'])) {
            return fields;
        }

        const contextFields = context.fields as [];

        contextFields.forEach((field) => {
            try {
                if (typeof field['field'] === 'string') {
                    const fsName = this.getFieldsetName(field['field']);
    
                    if (fsName == null || ! this.fieldSets.has(fsName)) { return; }
                    const _tFs = this.fieldSets.get(fsName) as IParsedFieldset;
                    const fsField = locateField(this.getFieldName(field['field']), _tFs);
    
                    if (fsField == null) { return; }
                    const targetHandle = field['handle'] as string;
                    const newField: IFieldDetails = {
                        ...fsField,
                        handle: targetHandle,
                        isLinked: true,
                        linkedFrom: field['field'] as string
                    };
                    
                    fields.push(newField);
                    return;
                }
    
                if (typeof field['import'] === 'string') {
                    if (this.fieldSets.has(field['import']) == false) { return; }
                    const _tFs = this.fieldSets.get(field['import']) as IParsedFieldset;
                    let importPrefix: string|null = null;
    
                    if (typeof field['prefix'] === 'string') {
                        const _tImportPrefix = field['prefix'] as string;
    
                        if (_tImportPrefix.trim().length > 0) {
                            importPrefix = _tImportPrefix.trim();
                        }
                    }
    
                    const _tFields = fetchFields(importPrefix, _tFs);
                    
                    if (_tFields.length > 0) {
                        try {
                            _tFields.forEach((importedField) => {
                                fields.push(importedField);
                            });
                        } catch (nestedE) { }
                    }
    
                    return;
                }
    
                const parsedField = this.parse(field);
    
                if (parsedField != null) {
                    parsedField.handle = field['handle'];
                    fields.push(parsedField);
                }
            } catch (e) { }
        });

        return fields;
    }

    private getFieldsetName(path: string): string | null {
        if (path.includes('.') == false) { return null; }
        const parts = path.split('.') as string[];
        
        return parts[0];
    }

    private getFieldName(path: string): string {
        if (path.includes('.') == false) { return path; }
        const parts = path.split('.') as string[];

        return parts[1];
    }

    parseSets(context: any): ISet[] {
        const sets: ISet[] = [];

        const handles = Object.keys(context);

        handles.forEach((setName) => {
            try {
                const _tSet = context[setName];
                let _tSetFields = this.parseFields(_tSet);
    
                sets.push({
                    display: _tSet['display'] ?? '',
                    handle: setName,
                    fields: _tSetFields
                });
            } catch (e) { }
        });

        return sets;
    }
}
export interface IParsedSection {
    display: string;
    handle: string;
    fields: IFieldDetails[]
}

export interface IParsedBlueprint {
    title: string,
    handle: string,
    collection: string,
    sections: IParsedSection[],
    allFields: IFieldDetails[]
    fields: IFieldDetails[],
    type: string,
    fileName?: string,
    contents?: string
}

export interface IProjectFields {
    assets: IParsedBlueprint[];
    collections: IParsedBlueprint[];
    taxonomies: IParsedBlueprint[];
    navigations: IParsedBlueprint[];
    forms: IParsedBlueprint[];
    general: IParsedBlueprint[];
    globals: IParsedBlueprint[];
    fieldsets: IParsedFieldset[];
}

export class BlueprintParser {
    private fieldParser:FieldParser = new FieldParser();
    private parsedBlueprints:IParsedBlueprint[] = [];

    setParsedFieldSet(fieldSets: Map<string, IParsedFieldset>) {
        this.fieldParser.setFieldSets(fieldSets);
    }

    parseSections(context: any) :IParsedSection[] {
        const sections:IParsedSection[] = [],
            sectionNames = Object.keys(context);

        sectionNames.forEach((sectionHandle) => {
            try {
                const _tSectionContext = context[sectionHandle];
                const _tSectionDisplay = _tSectionContext['display'] ?? '';
                const _tSectionFields = this.fieldParser.parseFields(_tSectionContext);
    
                sections.push({
                    display: _tSectionDisplay,
                    handle: sectionHandle,
                    fields: _tSectionFields
                });
            } catch (e) { }
        });

        return sections;
    }

    parseBlueprint(context: any, handle: string, blueprintType: string, collectionName: string, filePath?:string, contents?:string): IParsedBlueprint | null {
        const title = context['title'] ?? '';
        let _tSections: IParsedSection[] = [];
        let _tFields:IFieldDetails[] = [];
        let _tAllFields:IFieldDetails[] = [];
        if (typeof context['sections'] !== 'undefined') {
            _tSections = this.parseSections(context['sections']);
        }
        if (typeof context['fields'] !== 'undefined') {
            _tFields = this.fieldParser.parseFields(context);
        }
        _tAllFields = _tFields.concat([]);

        _tSections.forEach((section) => {
            try {
                _tAllFields = _tAllFields.concat(section.fields);
            } catch (e) { }
        });

        const parsedBlueprint:IParsedBlueprint = {
            allFields: _tAllFields,
            fields: _tFields,
            handle: handle,
            collection: collectionName,
            sections: _tSections,
            title: title,
            type: blueprintType,
            fileName: filePath,
            contents: contents
        };

        this.parsedBlueprints.push(parsedBlueprint);

        return parsedBlueprint;
    }

    getBlueprints(): IParsedBlueprint[] {
        return this.parsedBlueprints;
    }
}

export interface IPrefixedField {
    prefixedHandle: string;
    field: IFieldDetails;
}

export interface IParsedFieldset extends IParsedBlueprint {
    prefixedFields: IPrefixedField[];
}

export class FieldSetParser {
    private blueprintParser: BlueprintParser = new BlueprintParser();
    private parsedFieldsets: Map<string, IParsedFieldset> = new Map();
    private fieldsetArray:IParsedFieldset[] = [];

    parseFieldset(context: any, handle: string): IParsedFieldset | null {
        let _blueprint = this.blueprintParser.parseBlueprint(context, handle, '', '');

        if (_blueprint == null) { return null; }

        let prefixedFields:IPrefixedField[] = [];

        _blueprint.allFields.forEach((field) => {
            try {
                prefixedFields.push({
                    field: field,
                    prefixedHandle: handle + '.' + field.handle
                });
            } catch (e) { }
        });

        const parsedFieldset = {
            ..._blueprint,
            prefixedFields: prefixedFields
        };

        if (this.parsedFieldsets.has(handle) == false) {
            this.parsedFieldsets.set(handle, parsedFieldset);
            this.fieldsetArray.push(parsedFieldset);
        }

        return parsedFieldset;
    }

    getFieldsets(): Map<string, IParsedFieldset> {
        return this.parsedFieldsets;
    }

    getParsedFieldsets(): IParsedFieldset[] {
        return this.fieldsetArray;
    }
}

