import ModifierManager from "../../antlers/modifierManager.js";
import TagManager from "../../antlers/tagManagerInstance.js";

export default class EnvironmentDetails {
    private tagNames: string[] = [];
    private modifierNames: string[] = [];

    public static readonly alwaysLikeTag: string[] = [
        "if",
        "endif",
        "elseif",
        "else",
        "unless",
        "elseunless",
    ];

    getModifierNames() {
        return this.modifierNames.concat(
            ModifierManager.instance?.getModifierNames() ?? []
        );
    }

    getTagNames() {
        return this.tagNames.concat(TagManager.instance?.getTagNames() ?? []);
    }

    setTagNames(tagNames: string[]) {
        this.tagNames = tagNames;
    }

    setModifierNames(modifierNames: string[]) {
        this.modifierNames = modifierNames;
    }

    isTag(value: string) {
        if (EnvironmentDetails.alwaysLikeTag.includes(value)) {
            return true;
        }

        if (TagManager.instance?.isKnownTag(value)) {
            return true;
        }

        return this.tagNames.includes(value);
    }

    isModifier(value: string) {
        if (ModifierManager.instance?.hasModifier(value)) {
            return true;
        }

        return this.modifierNames.includes(value);
    }
}
