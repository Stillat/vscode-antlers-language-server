
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
}

export interface ISet {
    handle: string;
    display: string;
    fields: IFieldDetails[];
}

function locateField(fieldName: string, fieldSet: IParsedFieldset): IFieldDetails | null {
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
    });

    return returnFields;
}

function fetchDynamic<T>(context: any, field: string, defaultValue: T): T {
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

}

export interface IYamlFieldType extends IFieldDetails {
    default: string | null;

}

export interface IFormFieldType extends IFieldDetails {
    maxItems: number;

}



class FieldParser {
    private fieldSets: Map<string, IParsedFieldset> = new Map();

    setFieldSets(fieldSets: Map<string, IParsedFieldset>) {
        this.fieldSets = fieldSets;
    } _parseArrayFieldType(context: any): IArrayFieldType {
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
        };
    }

    _parseBardFieldType(context: any): IBardFieldType {
        let _parsedCollapse = fetchDynamic<string | null>(context['field'], 'collapse', null);
        let _parsedAlwaysShowSetButton = fetchDynamic<boolean | null>(context['field'], 'always_show_set_button', null);
        let _parsedPreviews = fetchDynamic<boolean>(context['field'], 'previews', true);
        let _parsedButtons = fetchDynamic<any[]>(context['field'], 'buttons', ['h2', 'h3', 'bold', 'italic', 'unorderedlist', 'orderedlist', 'removeformat', 'quote', 'anchor', 'image', 'table',]);
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
        };
    }

    _parseColorFieldType(context: any): IColorFieldType {
        let _parsedSwatches = fetchDynamic<string[] | null>(context['field'], 'swatches', null);
        let _parsedTheme = fetchDynamic<string>(context['field'], 'theme', 'classic');
        let _parsedLockOpacity = fetchDynamic<boolean | null>(context['field'], 'lock_opacity', null);
        let _parsedDefaultColorMode = fetchDynamic<string>(context['field'], 'default_color_mode', 'HEXA');
        let _parsedColorModes = fetchDynamic<string[]>(context['field'], 'color_modes', ['HEXA', 'RGBA', 'HSLA', 'HSVA', 'CMYK',]);

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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
        };
    }

    _parseSelectFieldType(context: any): ISelectFieldType {
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
        return {
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
        };
    }

    _parseTextFieldType(context: any): ITextFieldType {
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
        return {
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
        };
    }

    _parseTaggableFieldType(context: any): ITaggableFieldType {

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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
        };
    }

    _parseTextareaFieldType(context: any): ITextareaFieldType {
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
        return {
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
        };
    }

    _parseVideoFieldType(context: any): IVideoFieldType {
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
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
            linkedFrom: ''
        };
    }

    _parseFormFieldType(context: any): IFormFieldType {
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
            unlessArray: string[] = fetchDynamic<string[]>(context['field'], 'unless', []),
            validateArray: string[] = fetchDynamic<string[]>(context['field'], 'validate', []),
            display: string = fetchDynamic<string>(context['field'], 'display', '');
        return {
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
            linkedFrom: ''
        };
    }

    parse(context: any): IFieldDetails | null {
        const fields: IFieldDetails[] = [];
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
        if (fields.length == 1) { return fields[0]; } return null;


    } parseFields(context: any): IFieldDetails[] {
        const fields: IFieldDetails[] = [];

        if (typeof context['fields'] === 'undefined') {
            return fields;
        }

        const contextFields = context.fields as [];

        contextFields.forEach((field) => {
            if (typeof field['field'] === 'string') {
                const fsName = this.getFieldsetName(field['field']);

                if (fsName == null || !this.fieldSets.has(fsName)) { return; }
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
                let importPrefix: string | null = null;

                if (typeof field['prefix'] === 'string') {
                    const _tImportPrefix = field['prefix'] as string;

                    if (_tImportPrefix.trim().length > 0) {
                        importPrefix = _tImportPrefix.trim();
                    }
                }

                const _tFields = fetchFields(importPrefix, _tFs);

                if (_tFields.length > 0) {
                    _tFields.forEach((importedField) => {
                        fields.push(importedField);
                    });
                }

                return;
            }

            const parsedField = this.parse(field);

            if (parsedField != null) {
                parsedField.handle = field['handle'];
                fields.push(parsedField);
            }
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
            const _tSet = context[setName];
            let _tSetFields = this.parseFields(_tSet);

            sets.push({
                display: _tSet['display'] ?? '',
                handle: setName,
                fields: _tSetFields
            });
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
    sections: IParsedSection[],
    allFields: IFieldDetails[]
    fields: IFieldDetails[],
    type: string,
}

export class BlueprintParser {
    private fieldParser: FieldParser = new FieldParser();

    setParsedFieldSet(fieldSets: Map<string, IParsedFieldset>) {
        this.fieldParser.setFieldSets(fieldSets);
    }

    parseSections(context: any): IParsedSection[] {
        const sections: IParsedSection[] = [],
            sectionNames = Object.keys(context);

        sectionNames.forEach((sectionHandle) => {
            const _tSectionContext = context[sectionHandle];
            const _tSectionDisplay = context['display'] ?? '';
            const _tSectionFields = this.fieldParser.parseFields(_tSectionContext);

            sections.push({
                display: _tSectionDisplay,
                handle: sectionHandle,
                fields: _tSectionFields
            })
        });

        return sections;
    }

    parseBlueprint(context: any, handle: string, blueprintType: string): IParsedBlueprint | null {
        const title = context['title'] ?? '';
        let _tSections: IParsedSection[] = [];
        let _tFields: IFieldDetails[] = [];
        let _tAllFields: IFieldDetails[] = [];
        if (typeof context['sections'] !== 'undefined') {
            _tSections = this.parseSections(context['sections']);
        }
        if (typeof context['fields'] !== 'undefined') {
            _tFields = this.fieldParser.parseFields(context);
        }
        _tAllFields = _tFields.concat([]);

        _tSections.forEach((section) => {
            _tAllFields = _tAllFields.concat(section.fields);
        });

        return {
            allFields: _tAllFields,
            fields: _tFields,
            handle: handle,
            sections: _tSections,
            title: title,
            type: blueprintType
        };
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

    parseFieldset(context: any, handle: string): IParsedFieldset | null {
        let _blueprint = this.blueprintParser.parseBlueprint(context, handle, '');

        if (_blueprint == null) { return null; }

        let prefixedFields: IPrefixedField[] = [];

        _blueprint.allFields.forEach((field) => {
            prefixedFields.push({
                field: field,
                prefixedHandle: handle + '.' + field.handle
            });
        });

        const parsedFieldset = {
            ..._blueprint,
            prefixedFields: prefixedFields
        };

        if (this.parsedFieldsets.has(handle) == false) {
            this.parsedFieldsets.set(handle, parsedFieldset);
        }

        return parsedFieldset;
    }

    getFieldsets(): Map<string, IParsedFieldset> {
        return this.parsedFieldsets;
    }
}
