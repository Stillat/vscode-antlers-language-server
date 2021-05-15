export class ContextManager {
	static providedTagMapping: Map<string, string[]> = new Map();
	static tagExtensionMap: Map<string, string[]> = new Map();

	static providedModifierMapping: Map<string, string[]> = new Map();
	static modifierExtensionMap: Map<string, string[]> = new Map();

	static registerTagMapping(extensionName: string, tagName: string) {
		if (this.providedTagMapping.has(extensionName) == false) {
			this.providedTagMapping.set(extensionName, []);
		}

		if (this.tagExtensionMap.has(tagName) == false) {
			this.tagExtensionMap.set(tagName, []);
		}

		this.providedTagMapping.get(extensionName)?.push(tagName);
		this.tagExtensionMap.get(tagName)?.push(extensionName);
	}

	static registerModifierMapping(extensionName: string, modifierName: string) {
		if (this.providedModifierMapping.has(extensionName) == false) {
			this.providedModifierMapping.set(extensionName, []);
		}

		if (this.modifierExtensionMap.has(modifierName) == false) {
			{
				this.modifierExtensionMap.set(modifierName, []);
			}
		}

		this.providedModifierMapping.get(extensionName)?.push(modifierName);
		this.modifierExtensionMap.get(modifierName)?.push(extensionName);
	}

	static getExtensionsForTag(tagName: string): string[] {
		if (this.tagExtensionMap.has(tagName) == false) {
			return [];
		}

		const tagExtensions = this.tagExtensionMap.get(tagName) as string[];

		return [... new Set(tagExtensions)];
	}

	static getExtensionsForModifier(modifierName: string): string[] {
		if (this.modifierExtensionMap.has(modifierName) == false) {
			return [];
		}

		const modifierExtensions = this.modifierExtensionMap.get(modifierName) as string[];

		return [... new Set(modifierExtensions)];
	}

}
