import { MarkupKind, ParameterInformation, SignatureHelp, SignatureHelpParams, SignatureInformation } from 'vscode-languageserver-protocol';
import { getActiveModifier } from '../antlers/modifierAnalyzer';
import { makeProviderRequest } from '../providers/providerParameters';

const EmptySignatureHelp: SignatureHelp = {
	activeSignature: null,
	activeParameter: null,
	signatures: []
};

export function handleSignatureHelpRequest(params: SignatureHelpParams): SignatureHelp {
	const docPath = decodeURIComponent(params.textDocument.uri),
		providerRequest = makeProviderRequest(params.position, docPath);

	if (providerRequest.symbolsInScope.length > 0) {
		const lastSymbolInScope = providerRequest.symbolsInScope[providerRequest.symbolsInScope.length - 1];

		if (lastSymbolInScope.modifiers != null) {
			const activeModifer = getActiveModifier(lastSymbolInScope, params.position);

			if (activeModifer != null && activeModifer.modifier.modifier != null) {
				const modifierParameters: ParameterInformation[] = [];
				let activeParam: number | null = activeModifer.activeParam ?? 0;

				for (let i = 0; i < activeModifer.modifier.modifier.parameters.length; i++) {
					const thisParam = activeModifer.modifier.modifier.parameters[i];

					modifierParameters.push({
						label: thisParam.name,
						documentation: thisParam.description
					});
				}

				if (activeParam > modifierParameters.length) {
					activeParam = modifierParameters.length - 1;
				}

				if (activeParam < 0 || modifierParameters.length == 0) {
					activeParam = null;
				}

				const sigActiveParam: number | undefined = activeParam as any as number | undefined;

				return {
					signatures: [
						{
							label: activeModifer.modifier.modifier.name,
							documentation: {
								kind: MarkupKind.Markdown,
								value: activeModifer.modifier.modifier.description
							},
							parameters: modifierParameters,
							activeParameter: sigActiveParam
						}
					],
					activeParameter: activeParam,
					activeSignature: 0
				};

			}
		}
	}

	return EmptySignatureHelp;
}
