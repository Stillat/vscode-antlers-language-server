import {
    MarkupKind,
    ParameterInformation,
    SignatureHelp,
    SignatureHelpParams
} from "vscode-languageserver-protocol";
import ModifierManager from '../antlers/modifierManager';
import { IModifier } from '../antlers/modifierTypes';
import { makeProviderRequest } from "../providers/providerParameters";

const EmptySignatureHelp: SignatureHelp = {
    activeSignature: null,
    activeParameter: null,
    signatures: [],
};

export function handleSignatureHelpRequest(params: SignatureHelpParams): SignatureHelp {
    const docPath = decodeURIComponent(params.textDocument.uri),
        providerRequest = makeProviderRequest(params.position, docPath);

    if (providerRequest != null && providerRequest.context != null) {
        if (providerRequest.context.modifierContext != null) {
            if (ModifierManager.instance?.hasModifier(providerRequest.context.modifierContext.name)) {
                const modifierName = providerRequest.context.modifierContext.name,
                    modifierRef = ModifierManager.instance.getModifier(modifierName) as IModifier,
                    sigParameters: ParameterInformation[] = [];

                if (modifierRef != null) {
                    modifierRef.parameters.forEach((param) => {
                        sigParameters.push({
                            label: param.name,
                            documentation: param.description
                        });
                    });
                }

                let modifierParamIndex = providerRequest.context.modifierContext.activeValueIndex;

                if (modifierParamIndex > sigParameters.length) {
                    modifierParamIndex = sigParameters.length - 1;
                }

                if (modifierParamIndex < 0 || sigParameters.length == 0) {
                    modifierParamIndex = 0;
                }

                return {
                    signatures: [
                        {
                            label: modifierRef.name,
                            documentation: {
                                kind: MarkupKind.Markdown,
                                value: modifierRef.description,
                            },
                            parameters: sigParameters,
                            activeParameter: modifierParamIndex,
                        },
                    ],
                    activeParameter: modifierParamIndex,
                    activeSignature: 0,
                };
            }
        }
    }

    return EmptySignatureHelp;
}
