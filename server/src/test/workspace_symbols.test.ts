import assert from "assert";
import { CancellationToken, WorkspaceSymbolParams } from "vscode-languageserver";
import { ProjectManager } from "../projects/projectManager.js";
import { IProjectDetailsProvider } from "../projects/projectDetailsProvider.js";
import { IProjectFields } from "../projects/structuredFieldTypes/types.js";
import { buildWorkspaceSymbols } from "../services/workspaceSymbols.js";

const emptyProject: IProjectFields = {
    assets: [],
    collections: [],
    taxonomies: [],
    navigations: [],
    forms: [],
    general: [],
    globals: [],
    fieldsets: []
};

function params(query: string): WorkspaceSymbolParams {
    return { query };
}

suite("Workspace Symbols", () => {
    test("it returns cached views, blueprints, globals, fieldsets, and fields", () => {
        const manager = new ProjectManager();
        const project = {
            getViews: () => [{
                relativeDisplayName: "partials/card",
                templateName: "partials.card",
                isPartial: true,
                originalDocumentUri: "file:///project/resources/views/partials/_card.antlers.html"
            }]
        } as IProjectDetailsProvider;
        const structured: IProjectFields = {
            ...emptyProject,
            globals: [{
                title: "Company",
                handle: "company",
                collection: "company",
                tabs: [],
                fields: [],
                allFields: [{
                    required: false,
                    type: "text",
                    display: "Phone Number",
                    validate: [],
                    unless: [],
                    handle: "phone_number",
                    fields: [],
                    sets: [],
                    isLinked: false,
                    linkedFrom: "",
                    internalIcon: "",
                    instructionText: "",
                    developerDocumentation: ""
                }],
                type: "global",
                fileName: "C:/project/resources/blueprints/globals/company.yaml"
            }],
            fieldsets: [{
                title: "SEO",
                handle: "seo",
                collection: "",
                tabs: [],
                fields: [],
                allFields: [],
                type: "",
                prefixedFields: [],
                fileName: "C:/project/resources/fieldsets/seo.yaml"
            }]
        };

        manager.setActiveProject(project);
        manager.setStructuredProject(structured);

        const symbols = buildWorkspaceSymbols(params(""), manager);

        assert.deepStrictEqual(
            symbols.map((symbol) => symbol.name),
            ["partials/card", "company", "phone_number", "seo"]
        );
    });

    test("it filters case-insensitively across field metadata", () => {
        const manager = new ProjectManager();
        manager.setActiveProject({ getViews: () => [] } as unknown as IProjectDetailsProvider);
        manager.setStructuredProject({
            ...emptyProject,
            collections: [{
                title: "Articles",
                handle: "articles",
                collection: "articles",
                tabs: [],
                fields: [],
                allFields: [{
                    required: false,
                    type: "text",
                    display: "Hero Heading",
                    validate: [],
                    unless: [],
                    handle: "hero_heading",
                    fields: [],
                    sets: [],
                    isLinked: false,
                    linkedFrom: "",
                    internalIcon: "",
                    instructionText: "",
                    developerDocumentation: ""
                }],
                type: "collection",
                fileName: "C:/project/resources/blueprints/collections/articles/article.yaml"
            }]
        });

        const symbols = buildWorkspaceSymbols(params("HERO text"), manager);

        assert.deepStrictEqual(symbols.map((symbol) => symbol.name), ["hero_heading"]);
    });

    test("it honors cancellation and caps large result sets", () => {
        const manager = new ProjectManager();
        manager.setActiveProject({
            getViews: () => Array.from({ length: 300 }, (_, index) => ({
                relativeDisplayName: `views/example-${index}`,
                templateName: `views.example-${index}`,
                isPartial: false,
                originalDocumentUri: `file:///project/resources/views/example-${index}.antlers.html`
            }))
        } as IProjectDetailsProvider);

        assert.strictEqual(buildWorkspaceSymbols(params(""), manager).length, 250);
        assert.deepStrictEqual(
            buildWorkspaceSymbols(params(""), manager, CancellationToken.Cancelled),
            []
        );
    });
});
