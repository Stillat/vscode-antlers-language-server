import * as path from "path";
import * as fs from "fs";
import * as YAML from "yaml";
import { ICollection } from '../collections/collection.js';
import { IStructure } from '../structures/structure.js';

export function getCollectionDetails(collectionPath: string): ICollection {
    const handle = path
        .basename(collectionPath)
        .split(".")
        .slice(0, -1)
        .join("."),
        contents = fs.readFileSync(collectionPath, { encoding: "utf8" });

    let title = "",
        template = "",
        layout = "",
        isStructure = false,
        taxonomyNames: string[] = [],
        structure: IStructure | null = null,
        viewModel: string | null = null;
    const injectFields: string[] = [];

    try {
        const document = YAML.parse(contents);

        if (typeof document !== "undefined" && document !== null) {
            if (typeof document.title !== "undefined" && document.title !== null) {
                title = document.title;
            }

            if (typeof document.inject !== "undefined" && document.inject !== null) {
                const injectNames = Object.keys(document.inject);

                for (let i = 0; i < injectNames.length; i++) {
                    const thisName = injectNames[i];

                    if (thisName == "view_model") {
                        viewModel = document.inject["view_model"];
                    } else {
                        injectFields.push(thisName);
                    }
                }
            }

            if (typeof document.template !== "undefined" &&
                document.template !== null) {
                template = document.template;
            }

            if (typeof document.layout !== "undefined" && document.layout !== null) {
                layout = document.layout;
            }

            if (typeof document.taxonomies !== "undefined" &&
                document.taxonomies !== null) {
                taxonomyNames = Object.keys(document.taxonomies);
            }

            if (typeof document.structure !== "undefined" &&
                document.structure !== null) {
                isStructure = true;

                const tempStructure = document.structure;
                let maxDepth = -1,
                    root = false;

                if (typeof tempStructure.root !== "undefined" &&
                    tempStructure.root !== null) {
                    root = tempStructure.root;
                }

                if (typeof tempStructure.max_depth !== "undefined" &&
                    tempStructure.max_depth !== null) {
                    maxDepth = tempStructure.max_depth;
                }

                structure = {
                    root: root,
                    maxDepth: maxDepth,
                };
            }
        }
    } catch (err) {
        console.error(err);
    }

    return {
        handle: handle,
        title: title,
        template: template,
        layout: layout,
        taxonomies: taxonomyNames,
        isStructure: isStructure,
        structure: structure,
        viewModel: viewModel,
        injectFields: injectFields,
    };
}
