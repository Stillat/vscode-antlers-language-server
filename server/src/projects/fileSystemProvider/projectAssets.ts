import * as path from "path";
import * as fs from "fs";
import * as YAML from "yaml";
import { IAssets } from '../assets/asset.js';

export function getProjectAssets(assetPath: string): IAssets {
    const handle = path.basename(assetPath).split(".").slice(0, -1).join(".");
    let title = handle,
        diskName = "";

    try {
        const contents = fs.readFileSync(assetPath, { encoding: "utf8" }),
            document = YAML.parse(contents);

        if (typeof document !== "undefined" && document !== null) {
            if (typeof document.title !== "undefined" && document.title !== null) {
                title = document.title;
            }

            if (typeof document.disk !== "undefined" && document.disk !== null) {
                diskName = document.disk;
            }
        }
    } catch (err) {
        console.error(err);
    }

    return {
        handle: handle,
        title: title,
        diskName: diskName,
    };
}
