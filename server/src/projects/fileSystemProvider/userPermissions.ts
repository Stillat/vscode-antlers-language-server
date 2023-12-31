import * as path from "path";
import * as fs from "fs";
import * as YAML from "yaml";
import { IUserRole, IUserGroup } from '../users/users.js';

export function getUserRoles(path: string): IUserRole[] {
    const roles: IUserRole[] = [],
        contents = fs.readFileSync(path, { encoding: "utf8" });

    try {
        const document = YAML.parse(contents);

        if (typeof document === "undefined" || document === null) {
            return [];
        }

        const documentRoles = Object.keys(document);

        for (let i = 0; i < documentRoles.length; i++) {
            const roleHandle = documentRoles[i],
                roleDetails = document[roleHandle];
            let roleTitle = roleHandle;

            if (typeof roleDetails !== "undefined" && roleDetails !== null) {
                if (
                    typeof roleDetails.title !== "undefined" &&
                    roleDetails.title !== null
                ) {
                    roleTitle = roleDetails.title;
                }
            }

            roles.push({
                handle: roleHandle,
                title: roleTitle,
            });
        }
    } catch (e) {
        console.error(e);
    }

    return roles;
}

export function getUserGroups(path: string): IUserGroup[] {
    const groups: IUserGroup[] = [],
        contents = fs.readFileSync(path, { encoding: "utf8" });

    try {
        const document = YAML.parse(contents);

        if (typeof document === "undefined" || document === null) {
            return [];
        }

        const documentGroups = Object.keys(document);

        for (let i = 0; i < documentGroups.length; i++) {
            const groupHandle = documentGroups[i],
                groupDetails = document[groupHandle];
            let groupTitle = groupHandle;

            if (typeof groupDetails !== "undefined" && groupDetails !== null) {
                if (
                    typeof groupDetails.title !== "undefined" &&
                    groupDetails.title !== null
                ) {
                    groupTitle = groupDetails.title;
                }
            }

            groups.push({
                handle: groupHandle,
                title: groupTitle,
            });
        }
    } catch (e) {
        console.error(e);
    }

    return groups;
}
