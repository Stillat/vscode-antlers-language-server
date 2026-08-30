import assert from "assert";
import { sessionDocuments } from "../languageService/documents.js";
import { IBlueprintField } from "../projects/blueprints/fields.js";
import { IProjectDetailsProvider } from "../projects/projectDetailsProvider.js";
import { ProjectManager } from "../projects/projectManager.js";
import { buildFieldTypeInlayHints } from "../services/fieldTypeInlayHints.js";

suite("Field Type Inlay Hints", () => {
    test("it is opt-in and uses cached project fields", () => {
        const uri = "file:///field-hints.antlers.html";
        sessionDocuments.createOrUpdate(uri, "{{ title }} {{ unknown }}");

        const manager = new ProjectManager();
        manager.setActiveProject({
            findAnyBlueprintField(name: string) {
                if (name !== "title") {
                    return null;
                }

                return {
                    name: "title",
                    displayName: "Title",
                    type: "text"
                } as unknown as IBlueprintField;
            }
        } as unknown as IProjectDetailsProvider);

        const params = {
            textDocument: { uri },
            range: {
                start: { line: 0, character: 0 },
                end: { line: 0, character: 30 }
            }
        };

        assert.deepStrictEqual(
            buildFieldTypeInlayHints(params, false, manager),
            []
        );
        assert.deepStrictEqual(
            buildFieldTypeInlayHints(params, true, manager),
            [{
                position: { line: 0, character: 8 },
                label: ": text",
                kind: 1,
                paddingLeft: true,
                tooltip: "Title (title)"
            }]
        );
        assert.deepStrictEqual(
            buildFieldTypeInlayHints({
                ...params,
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: 0, character: 8 }
                }
            }, true, manager),
            []
        );
    });
});
