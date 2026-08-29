import { NotificationType } from "vscode-languageserver/node.js";
import { IProjectFields } from "../projects/structuredFieldTypes/types.js";

export interface ProjectDetailsParams {
    content: IProjectFields;
}

export const ProjectDetailsAvailableNotification =
    new NotificationType<ProjectDetailsParams>("antlers/projectDetailsAvailable");

interface ProjectDetailsNotificationSender {
    sendNotification(
        type: NotificationType<ProjectDetailsParams>,
        params: ProjectDetailsParams
    ): void;
}

export function notifyProjectDetails(
    sender: ProjectDetailsNotificationSender,
    contents: IProjectFields
): void {
    sender.sendNotification(ProjectDetailsAvailableNotification, {
        content: contents
    });
}
