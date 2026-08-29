import assert from "assert";
import { NotificationType } from "vscode-languageserver/node";
import {
    notifyProjectDetails,
    ProjectDetailsAvailableNotification,
    ProjectDetailsParams
} from "../protocol/projectDetailsNotification.js";
import { IProjectFields } from "../projects/structuredFieldTypes/types.js";

const projectDetails: IProjectFields = {
    assets: [],
    collections: [],
    taxonomies: [],
    navigations: [],
    forms: [],
    general: [],
    globals: [],
    fieldsets: []
};

suite("Project Details Notification", () => {
    test("it publishes project details as a notification", () => {
        const sent: {
            type?: NotificationType<ProjectDetailsParams>,
            params?: ProjectDetailsParams
        } = {};

        notifyProjectDetails({
            sendNotification(type, params) {
                sent.type = type;
                sent.params = params;
            }
        }, projectDetails);

        assert.strictEqual(sent.type, ProjectDetailsAvailableNotification);
        assert.strictEqual(sent.type?.method, "antlers/projectDetailsAvailable");
        assert.strictEqual(sent.params?.content, projectDetails);
    });
});
