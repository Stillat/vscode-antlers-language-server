import { ExtensionContext } from 'vscode';
import { WorkspaceFolder, DebugConfiguration, ProviderResult, CancellationToken } from 'vscode';
import * as vscode from 'vscode';
import { AntlersDebugSession } from './antlersDebug';
import { getRootProjectPath } from '../utils/project';
import { getLaravelRoot } from '../utils/io';

class AntlersConfigurationPropvider implements vscode.DebugConfigurationProvider {
	resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration> {

		// if launch.json is missing or empty
		if (!config.type && !config.request && !config.name) {
			const editor = vscode.window.activeTextEditor;
			if (editor && editor.document.languageId === 'antlers') {
				config.type = 'antlers';
				config.name = 'Launch';
				config.request = 'launch';
				config.program = '${file}';
				config.stopOnEntry = true;
			}
		}

		if (!config.program) {
			return vscode.window.showInformationMessage("Cannot find a program to debug").then(_ => {
				return undefined;	// abort launch
			});
		}

		return config;
	}

}

export function activateAntlersDebug(context: ExtensionContext) {

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.antlersLanguageServer.debugEditorContents', (resource: vscode.Uri) => {
			let targetResource = resource;
			if (!targetResource && vscode.window.activeTextEditor) {
				targetResource = vscode.window.activeTextEditor.document.uri;
			}
			if (targetResource) {
				vscode.debug.startDebugging(undefined, {
					type: 'antlers',
					name: 'Debug Antlers',
					request: 'launch',
					program: targetResource.fsPath,
					stopOnEntry: true
				});
			}
		})
	);

	const provider = new AntlersConfigurationPropvider();
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('antlers', provider));

	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('antlers', {
		provideDebugConfigurations(folder: WorkspaceFolder | undefined): ProviderResult<DebugConfiguration[]> {
			return [
				{
					name: "Launch Antlers Debugger",
					request: "launch",
					type: "antlers",
					program: "${file}"
				}
			];
		}
	}, vscode.DebugConfigurationProviderTriggerKind.Dynamic));

	const factory = new InlineDebugAdapterFactory();
	context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('antlers', factory));
}

/**
 * Breaks the provided path down to resolve the Antlers debug directory.
 * 
 * @param path 
 * @returns 
 */
function getDebugRoot(path: string): string {
	return getLaravelRoot(getRootProjectPath(path)) + 'storage/';
}

class InlineDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {

	createDebugAdapterDescriptor(_session: vscode.DebugSession): ProviderResult<vscode.DebugAdapterDescriptor> {
		const debugPath = _session.configuration.program,
			debugRoot = getDebugRoot(debugPath);

		return new vscode.DebugAdapterInlineImplementation(new AntlersDebugSession(debugRoot, getRootProjectPath(debugPath)));
	}

}