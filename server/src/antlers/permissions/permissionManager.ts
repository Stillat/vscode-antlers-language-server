import { NativePermissions } from './nativePermissions';

export interface IUserPermission {
	handle: string
}

export class PermissionsManager {
	static contextItems: Map<string, string[]> = new Map();
	static triggerNames: string[] = [];

	static collectionTriggers: string[] = [];
	static collectionTriggerCaps: string[] = [];

	static globalTriggers: string[] = [];
	static globalTriggerCaps: string[] = [];

	static formTriggers: string[] = [];
	static formTriggerCaps: string[] = [];

	static structureTriggers: string[] = [];
	static structureTriggerCaps: string[] = [];

	static assetTriggers: string[] = [];
	static assetTriggerCaps: string[] = [];

	static loadCorePermissions() {
		this.registerPermissions(NativePermissions);
	}

	static getTriggerNames(): string[] {
		return this.triggerNames;
	}

	static isCollectionTrigger(trigger: string): boolean {
		return this.collectionTriggers.includes(trigger);
	}

	static isGlobalTrigger(trigger: string): boolean {
		return this.globalTriggers.includes(trigger);
	}

	static isFormTrigger(trigger: string): boolean {
		return this.formTriggers.includes(trigger);
	}

	static isStructureTrigger(trigger: string): boolean {
		return this.structureTriggers.includes(trigger);
	}

	static isAssetTrigger(trigger: string): boolean {
		return this.assetTriggers.includes(trigger);
	}

	static getTriggerContextItems(trigger: string): string[] {
		if (this.contextItems.has(trigger)) {
			return this.contextItems.get(trigger) as string[];
		}

		return [];
	}

	static registerSpecialTrigger(trigger: string, specialTrigger: string, context: string) {
		if (specialTrigger == '{collection}') {
			if (this.collectionTriggerCaps.includes(context) == false) {
				this.collectionTriggerCaps.push(context);
			}

			if (this.collectionTriggers.includes(trigger) == false) {
				this.collectionTriggers.push(trigger);
			}
		} else if (specialTrigger == '{structure}') {
			if (this.structureTriggerCaps.includes(context) == false) {
				this.structureTriggerCaps.push(context);
			}

			if (this.structureTriggers.includes(trigger) == false) {
				this.structureTriggers.push(trigger);
			}
		} else if (specialTrigger == '{container}') {
			if (this.assetTriggerCaps.includes(context) == false) {
				this.assetTriggerCaps.push(context);
			}

			if (this.assetTriggers.includes(trigger) == false) {
				this.assetTriggers.push(trigger);
			}
		} else if (specialTrigger == '{global}') {
			if (this.globalTriggerCaps.includes(context) == false) {
				this.globalTriggerCaps.push(context);
			}

			if (this.globalTriggers.includes(trigger) == false) {
				this.globalTriggers.push(trigger);
			}
		} else if (specialTrigger == '{form}') {
			if (this.formTriggerCaps.includes(context) == false) {
				this.formTriggerCaps.push(context);
			}

			if (this.formTriggers.includes(trigger) == false) {
				this.formTriggers.push(trigger);
			}
		}
	}

	static addContextToTrigger(trigger: string, context: string) {
		if (this.triggerNames.includes(trigger) == false) {
			this.triggerNames.push(trigger);
		}

		if (this.contextItems.has(trigger) == false) {
			this.contextItems.set(trigger, [context]);
		} else {
			this.contextItems.get(trigger)?.push(context);
		}
	}

	static registerPermissions(permissions: IUserPermission[]) {
		for (let i = 0; i < permissions.length; i++) {
			const thisPermission = permissions[i];
			let triggers: string[] = [],
				specialTrigger = '',
				contextItem = '';

			if (thisPermission.handle.includes('[') && thisPermission.handle.includes(']')) {
				const openBracket = thisPermission.handle.indexOf('['),
					closeBracket = thisPermission.handle.indexOf(']'),
					len = closeBracket - openBracket,
					nestedTriggers = thisPermission.handle.substr(openBracket + 1, len - 1).split(' ').filter(n => n.trim().length > 0),
					additionalPieces = thisPermission.handle.substr(closeBracket + 1).split(' ').filter(n => n.trim().length > 0);

				triggers = nestedTriggers;

				if (additionalPieces.length == 2) {
					specialTrigger = additionalPieces[0];
					contextItem = additionalPieces[1];
				} else if (additionalPieces.length == 1) {
					specialTrigger = '';
					contextItem = additionalPieces[0];
				}
			} else {
				const pieces = thisPermission.handle.split(' ').filter(n => n.trim().length > 0);

				if (pieces.length == 2) {
					triggers = [pieces[0]];
					contextItem = pieces[1];
				}
			}

			for (let j = 0; j < triggers.length; j++) {
				const thisTrigger = triggers[j];

				if (specialTrigger.trim().length > 0) {
					this.registerSpecialTrigger(thisTrigger, specialTrigger, contextItem);
				} else {
					this.addContextToTrigger(thisTrigger, contextItem);
				}
			}
		}
	}

}
