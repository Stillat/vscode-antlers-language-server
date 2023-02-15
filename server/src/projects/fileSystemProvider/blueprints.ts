import * as YAML from "yaml";
import * as fs from "fs";
import { IBlueprintField, ISet, blueprintFieldFromFieldSet, adjustFieldType, SetFieldTypes, IBlueprint } from '../blueprints/fields';
import {IFieldsetField } from '../fieldsets/fieldset';

export function getFields(container: any, outerblueprintName: string, fieldSetName: string, path: string, fieldsets: Map<string, IFieldsetField[]>): IBlueprintField[] {
    const foundFields: IBlueprintField[] = [];
    const includedHandles: string[] = [];

    for (const fieldIndex of Object.keys(container[fieldSetName])) {
        const field = container[fieldSetName][fieldIndex];
        let fieldType = "",
            displayName = "",
            instructionText = "",
            fieldsetPrefix = "",
            maxItems = null,
            sets: ISet[] | null = null,
            importFields: string | null = null;

        if (typeof field.prefix !== "undefined" && field.prefix !== null) {
            fieldsetPrefix = field.prefix;
        }

        // Here we are going to merge in the fieldset fields.
        if (typeof field.import !== "undefined" && fieldsets.has(field.import)) {
            const fieldsetFields: IFieldsetField[] = fieldsets.get(
                field.import
            ) as IFieldsetField[];

            for (let i = 0; i < fieldsetFields.length; i++) {
                if (includedHandles.includes(fieldsetFields[i].handle) == false) {
                    foundFields.push(
                        blueprintFieldFromFieldSet(fieldsetFields[i], fieldsetPrefix)
                    );
                    includedHandles.push(fieldsetFields[i].handle);
                }
            }

            continue;
        }

        if (typeof field.import !== "undefined") {
            importFields = field.import;
        }

        if (typeof field.field !== "undefined") {
            if (typeof field.field.type !== "undefined") {
                fieldType = field.field.type;
            }

            if (typeof field.field.display !== "undefined") {
                displayName = field.field.display;
            }

            if (typeof field.field.instructions !== "undefined") {
                instructionText = field.field.instructions;
            }

            if (typeof field.field.max_items !== "undefined") {
                maxItems = field.field.max_items;
            }

            fieldType = adjustFieldType(fieldType, field, maxItems);

            if (
                SetFieldTypes.includes(fieldType) &&
                typeof field.field.sets !== "undefined"
            ) {
                sets = [];

                for (const setIndex of Object.keys(field.field.sets)) {
                    const setContainer = field.field.sets[setIndex],
                        setFields = getFields(
                            setContainer,
                            outerblueprintName,
                            "fields",
                            "set:" + setIndex,
                            fieldsets
                        );
                    let displayName = "";

                    if (typeof setContainer.display !== "undefined") {
                        displayName = setContainer.display;
                    }

                    sets.push({
                        handle: setIndex,
                        displayName: displayName,
                        fields: setFields,
                    });
                }
            }
        }

        foundFields.push({
            blueprintName: outerblueprintName,
            name: field.handle,
            type: fieldType,
            displayName: displayName,
            instructionText: instructionText,
            maxItems,
            refFieldSetField: null,
            sets: sets,
            import: importFields,
        });
    }

    return foundFields;
}

export function getBlueprintFields(fileName: string, blueprintName: string, blueprintType: string, fieldsets: Map<string, IFieldsetField[]>): IBlueprint {
    let fields: IBlueprintField[] = [];
    const newBlueprint:IBlueprint = {
        fields: [],
        handle: '',
        title: '',
        filePath: '',
        type: blueprintType
    }
    try {
        const contents = fs.readFileSync(fileName, { encoding: "utf8" }),
            document = YAML.parse(contents),
            sections = document.sections,
            tabs = document.tabs;

        newBlueprint.filePath = fileName;
        newBlueprint.handle = blueprintName;
        newBlueprint.title = blueprintName;

        if (typeof document['title'] !== 'undefined') {
            newBlueprint.title = document.title as string;
        }

        if (typeof tabs !== 'undefined') {
            // Statamic 4
            for (const tabName of Object.keys(tabs)) {
                const tab = tabs[tabName];

                if (typeof tab.fields !== "undefined") {
                    const tabFields = getFields(
                        tab,
                        blueprintName,
                        "fields",
                        blueprintName,
                        fieldsets
                    );

                    if (tabFields.length > 0) {
                        fields = fields.concat(tabFields);
                    }
                }
            }
        } else if (typeof sections !== "undefined") {
            // Statamic 3
            for (const sectionName of Object.keys(sections)) {
                const section = sections[sectionName];

                if (typeof section.fields !== "undefined") {
                    const sectionFields = getFields(
                        section,
                        blueprintName,
                        "fields",
                        blueprintName,
                        fieldsets
                    );

                    if (sectionFields.length > 0) {
                        fields = fields.concat(sectionFields);
                    }
                }
            }
        } else {
            if (typeof document.fields !== "undefined") {
                const documentFields = getFields(
                    document,
                    blueprintName,
                    "fields",
                    blueprintName,
                    fieldsets
                );

                if (documentFields.length > 0) {
                    fields = fields.concat(documentFields);
                }
            }
        }
    } catch (err) {
        // Don't let blueprint parsing crash the server.
    }

    newBlueprint.fields = fields;

    return newBlueprint;
}
