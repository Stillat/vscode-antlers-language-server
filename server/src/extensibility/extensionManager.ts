import * as fs from 'fs';
import * as path from 'path';
import { CompletionItem, Hover } from 'vscode-languageserver-types';
import { IModifier } from '../antlers/modifierManager';
import { IScopeVariable } from '../antlers/scope/engine';
import { IAntlersParameter, IAntlersTag } from '../antlers/tagManager';
import { IDiagnosticsHandler } from '../diagnostics/diagnosticsManager';
import { ISuggestionRequest } from '../suggestions/suggestionManager';
import { trimLeft, trimRight } from '../utils/strings';
import { ExtensionContext } from './extensionContext';
import { ExtensionHost } from './extensionHost';

export interface SuggestionHandler {
	(params: ISuggestionRequest): CompletionItem[]
}

export interface GeneralHoverHandler {
	(params: ISuggestionRequest): Hover | null
}

export interface ModifierHoverHandler {
	(modifier: IModifier, params: ISuggestionRequest): Hover | null
}

export interface TagHoverHandler {
	(tag: IAntlersTag, params: ISuggestionRequest): Hover | null
}

export interface ParameterHoverHandler {
	(parameter: IAntlersParameter, params: ISuggestionRequest): Hover | null
}

export interface ScopeVariableHoverHandler {
	(variable: IScopeVariable, params: ISuggestionRequest): Hover | null
}

export interface ParameterSuggestionHandler {
	(parameter: IAntlersParameter, params: ISuggestionRequest): CompletionItem[]
}

export interface TagSuggestionHandler {
	(tag: IAntlersTag, params: ISuggestionRequest): CompletionItem[]
}

export class ExtensionManager {
	static extensions: Map<string, ExtensionHost> = new Map();
	static extensionContexts: ExtensionContext[] = [];
	static bootedExtensions: string[] = [];

	static loadAddons(extensionDirectory: string) {
		if (extensionDirectory.endsWith('package.json')) {
			const packageJsonPath = extensionDirectory,
				packageContents = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' })),
				modulePath = trimRight(path.dirname(packageJsonPath), '\\/') + trimLeft(trimRight(packageContents.main, '.'), '.');

			this.loadAddon(packageJsonPath, modulePath, packageContents);
		} else {
			const directories = fs.readdirSync(extensionDirectory);

			for (let i = 0; i < directories.length; i++) {
				const packageJsonPath = extensionDirectory + directories[i] + '/package.json',
					packageContents = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' })),
					modulePath = extensionDirectory + directories[i] + trimLeft(trimRight(packageContents.main, '.'), '.');

				this.loadAddon(packageJsonPath, modulePath, packageContents);
			}
		}
	}

	private static loadAddon(packageJsonPath: string, modulePath: string, packageContents: any) {
		if (fs.existsSync(packageJsonPath)) {

			if (typeof packageContents.engines !== 'undefined' && typeof packageContents.engines.antlers !== 'undefined') {
				if (typeof packageContents.name !== 'undefined' && typeof packageContents.main !== 'undefined') {

					if (this.extensions.has(packageContents.name) == false) {
						this.extensions.set(packageContents.name, new ExtensionHost(modulePath, parseInt(packageContents.engines.antlers), packageContents));
					}
				}
			}
		}
	}

	static getAllRegisteredTags(): IAntlersTag[] {
		let allTags: IAntlersTag[] = [];

		this.extensionContexts.forEach((context: ExtensionContext) => {
			allTags = allTags.concat(context.getRegisteredTags());
		});

		return allTags;
	}

	static getAllRegisteredModifiers(): IModifier[] {
		let allModifiers: IModifier[] = [];

		this.extensionContexts.forEach((context: ExtensionContext) => {
			allModifiers = allModifiers.concat(context.getRegisteredModifiers());
		});

		return allModifiers;
	}

	static getAllRegisteredDiagnosticsHandlers(): IDiagnosticsHandler[] {
		let allHandlers: IDiagnosticsHandler[] = [];

		this.extensionContexts.forEach((context: ExtensionContext) => {
			allHandlers = allHandlers.concat(context.getRegisteredDiagnosticsHandlers());
		});

		return allHandlers;
	}

	static bootAddons() {
		this.extensions.forEach((extension: ExtensionHost) => {
			if (this.bootedExtensions.includes(extension.getExtensionName()) == false) {
				const extensionContext = new ExtensionContext(extension);

				this.extensionContexts.push(extensionContext);
				extension.boot(extensionContext);
				this.bootedExtensions.push(extension.getExtensionName());
			}
		});
	}

	static collectModifierCompletionLists(params: ISuggestionRequest): CompletionItem[] {
		let allItems: CompletionItem[] = [];

		this.extensionContexts.forEach((context) => {
			const handler = context.getModifierCompletionSuggestionsHandler();

			if (handler != null) {
				allItems = allItems.concat(handler(params));
			}
		});

		return allItems;
	}

	static collectParameterCompletionLists(parameter: IAntlersParameter, params: ISuggestionRequest): CompletionItem[] {
		let allItems: CompletionItem[] = [];

		this.extensionContexts.forEach((context) => {
			const handler = context.getParameterCompletionSuggestionHandler();

			if (handler != null) {
				allItems = allItems.concat(handler(parameter, params));
			}
		});

		return allItems;
	}

	static collectGenericSuggetionLists(params: ISuggestionRequest): CompletionItem[] {
		let allItems: CompletionItem[] = [];

		this.extensionContexts.forEach((context) => {
			const handler = context.getCompletionsSuggestionHandler();

			if (handler != null) {
				allItems = allItems.concat(handler(params));
			}
		});

		return allItems;
	}

	static collectTagSuggestionLists(tag: IAntlersTag, params: ISuggestionRequest): CompletionItem[] {
		let allItems: CompletionItem[] = [];

		this.extensionContexts.forEach((context) => {
			const handler = context.getTagCompletionSuggestionHandler();

			if (handler != null) {
				allItems = allItems.concat(handler(tag, params));
			}
		});

		return allItems;
	}

	static collectGeneralHover(params: ISuggestionRequest): Hover | null {
		this.extensionContexts.forEach((context) => {
			const handler = context.getGeneralHoverHandler();

			if (handler != null) {
				const extensionResult = handler(params);

				if (extensionResult != null) {
					return extensionResult;
				}
			}
		});

		return null;
	}

	static collectScopeVariableHover(variable: IScopeVariable, params: ISuggestionRequest): Hover | null {
		this.extensionContexts.forEach((context) => {
			const handler = context.getScopeVariableHoverHandler();

			if (handler != null) {
				const extensionResult = handler(variable, params);

				if (extensionResult != null) {
					return extensionResult;
				}
			}
		});

		return null;
	}

	static collectModifierHover(modifier: IModifier, params: ISuggestionRequest): Hover | null {
		this.extensionContexts.forEach((context) => {
			const handler = context.getModifierHoverHandler();

			if (handler != null) {
				const extensionResult = handler(modifier, params);

				if (extensionResult != null) {
					return extensionResult;
				}
			}
		});

		return null;
	}

	static collectParameterHover(parameter: IAntlersParameter, params: ISuggestionRequest): Hover | null {
		this.extensionContexts.forEach((context) => {
			const handler = context.getParameterHoverHandler();

			if (handler != null) {
				const extensionResult = handler(parameter, params);

				if (extensionResult != null) {
					return extensionResult;
				}
			}
		});

		return null;
	}

	static collectTagHover(tag: IAntlersTag, params: ISuggestionRequest): Hover | null {
		this.extensionContexts.forEach((context) => {
			const handler = context.getTagHoverHandler();

			if (handler != null) {
				const extensionResult = handler(tag, params);

				if (extensionResult != null) {
					return extensionResult;
				}
			}
		});

		return null;
	}

}
