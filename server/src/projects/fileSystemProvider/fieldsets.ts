import YAML from "yaml";
import * as fs from "fs";
import { getFields } from "./blueprints.js";
import { IFieldsetField } from '../fieldsets/fieldset.js';
import { ISet } from '../blueprints/fields.js';

export function getFieldsetFields(fileName: string, fieldsetName: string): IFieldsetField[] {
    const returnFields: IFieldsetField[] = [];

    try {
        const contents = fs.readFileSync(fileName, { encoding: "utf8" });
        const document = YAML.parse(contents);

        if (typeof document === "undefined" || document === null) {
            return [];
        }

        if (typeof document.fields !== "undefined") {
            for (const fieldIndex of Object.keys(document.fields)) {
                const field = document.fields[fieldIndex];
                const handle = field.handle;
                let name = "",
                    instructions = "",
                    type = "",
                    maxItems: number | null = null,
                    sets: ISet[] | null = null,
                    importFields: string | null = null;

                if (typeof field.import !== "undefined") {
                    importFields = field.import;
                }

                if (typeof field.field !== "undefined") {
                    if (typeof field.field.display !== "undefined") {
                        name = field.field.display;
                    }

                    if (typeof field.field.type !== "undefined") {
                        type = field.field.type;
                    }

                    if (typeof field.field.instructions !== "undefined") {
                        instructions = field.field.instructions;
                    }

                    if (typeof field.field.max_items !== "undefined") {
                        maxItems = field.field.max_items;
                    }

                    if (typeof field.field.sets !== "undefined") {
                        sets = [];

                        for (const setIndex of Object.keys(field.field.sets)) {
                            const setContainer = field.field.sets[setIndex],
                                setFields = getFields(
                                    setContainer,
                                    fieldsetName,
                                    "fields",
                                    "set:" + setIndex,
                                    new Map()
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

                returnFields.push({
                    handle: handle,
                    instructionText: instructions,
                    name: name,
                    type: type,
                    maxItems: maxItems,
                    sets: sets,
                    import: importFields,
                });
            }
        }
    } catch (err) {
        // Don't let fieldset YAML parsing crash the language server.
    }

    return returnFields;
}
