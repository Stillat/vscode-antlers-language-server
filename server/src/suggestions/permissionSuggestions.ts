import {
    CompletionItem,
    CompletionItemKind,
} from "vscode-languageserver-types";
import PermissionsManager from "../antlers/permissions/permissionManager.js";
import { ISuggestionRequest } from './suggestionRequest.js';

export function getPermissionSuggestions(
    currentValue: string,
    params: ISuggestionRequest
): CompletionItem[] {
    const items: CompletionItem[] = [];

    if (currentValue.trim().length == 0) {
        const baseTriggerNames =
            PermissionsManager.instance?.getTriggerNames() ?? [];

        for (let i = 0; i < baseTriggerNames.length; i++) {
            items.push({
                label: baseTriggerNames[i],
                kind: CompletionItemKind.Value,
            });
        }
    } else {
        const currentParts = currentValue
            .split(" ")
            .filter((n) => n.trim().length > 0),
            currentTrigger = currentParts[0],
            allContextualItems =
                PermissionsManager.instance?.getTriggerContextItems(currentTrigger) ??
                [],
            isCollectionTrigger =
                PermissionsManager.instance?.isCollectionTrigger(currentTrigger),
            isGlobalTrigger =
                PermissionsManager.instance?.isGlobalTrigger(currentTrigger),
            isFormTrigger =
                PermissionsManager.instance?.isFormTrigger(currentTrigger),
            isStructureTrigger =
                PermissionsManager.instance?.isStructureTrigger(currentTrigger),
            isAssetTrigger =
                PermissionsManager.instance?.isAssetTrigger(currentTrigger);
        let candidateItems: string[] = [];

        if (currentParts.length <= 2) {
            if (isCollectionTrigger) {
                candidateItems = candidateItems.concat(
                    params.project.getUniqueCollectionNames()
                );
            } else if (isGlobalTrigger) {
                candidateItems = candidateItems.concat(
                    params.project.getUniqueGlobalsNames()
                );
            } else if (isFormTrigger) {
                candidateItems = candidateItems.concat(
                    params.project.getUniqueFormNames()
                );
            } else if (isStructureTrigger) {
                candidateItems = candidateItems.concat(
                    params.project.getUniqueNavigationMenuNames()
                );
            } else if (isAssetTrigger) {
                candidateItems = candidateItems.concat(
                    params.project.getUniqueAssetNames()
                );
            }

            if (allContextualItems.length > 0) {
                candidateItems = candidateItems.concat(allContextualItems);
            }

            candidateItems = [...new Set(candidateItems)];

            for (let i = 0; i < candidateItems.length; i++) {
                items.push({
                    label: candidateItems[i],
                    kind: CompletionItemKind.Value,
                });
            }
        } else {
            let capCandidates: string[] = [];

            if (isCollectionTrigger) {
                capCandidates = capCandidates.concat(
                    PermissionsManager.instance?.getCollectionTriggerCaps() ?? []
                );
            } else if (isGlobalTrigger) {
                capCandidates = capCandidates.concat(
                    PermissionsManager.instance?.getGlobalTriggerCaps() ?? []
                );
            } else if (isFormTrigger) {
                capCandidates = capCandidates.concat(
                    PermissionsManager.instance?.getFormTriggerCaps() ?? []
                );
            } else if (isStructureTrigger) {
                capCandidates = capCandidates.concat(
                    PermissionsManager.instance?.getStructureTriggerCaps() ?? []
                );
            } else if (isAssetTrigger) {
                capCandidates = capCandidates.concat(
                    PermissionsManager.instance?.getAssetTriggerCaps() ?? []
                );
            }

            capCandidates = [...new Set(capCandidates)];

            for (let i = 0; i < capCandidates.length; i++) {
                items.push({
                    label: capCandidates[i],
                    kind: CompletionItemKind.Value,
                });
            }
        }
    }

    return items;
}
