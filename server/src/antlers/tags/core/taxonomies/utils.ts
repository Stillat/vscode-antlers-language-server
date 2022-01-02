import {
    CompletionItem,
    CompletionItemKind,
} from "vscode-languageserver-types";
import { IProjectDetailsProvider } from '../../../../projects/projectDetailsProvider';
import { AntlersNode } from '../../../../runtime/nodes/abstractNode';
import {
    ExcludeTaxonomyParams,
    SourceTaxonomyParams,
} from "./resolveTaxonomyParameterCompletions";

export function getTaxonomyNames(symbol: AntlersNode, statamicProject: IProjectDetailsProvider): string[] {
    let taxonomyNames: string[] = [];

    if (symbol.hasMethodPart()) {
        taxonomyNames.push(symbol.getMethodNameValue());

        return taxonomyNames;
    }

    const fromParam = symbol.findAnyParameter(SourceTaxonomyParams),
        restrictParam = symbol.findAnyParameter(ExcludeTaxonomyParams);
    let fromList: string[] = [],
        notInList: string[] = [];

    if (typeof fromParam !== "undefined" && fromParam !== null) {
        if (fromParam.value.trim() === "*") {
            fromList = statamicProject.getUniqueTaxonomyNames();

            if (typeof restrictParam !== "undefined" && restrictParam !== null) {
                if (
                    restrictParam.isVariableReference == false &&
                    restrictParam.hasInterpolations() == false
                ) {
                    notInList = restrictParam.getArrayValue();
                }
            }
        } else {
            if (
                fromParam.isVariableReference == false &&
                fromParam.hasInterpolations() == false
            ) {
                fromList = fromParam.getArrayValue();
            }
        }
    }

    if (notInList.length > 0) {
        taxonomyNames = fromList.filter(function (n) {
            return notInList.includes(n) == false;
        });
    } else {
        taxonomyNames = fromList;
    }

    return taxonomyNames;
}

export function makeTaxonomyNameSuggestions(
    existingValues: string[],
    project: IProjectDetailsProvider
): CompletionItem[] {
    const items: CompletionItem[] = [],
        taxonomyNames = project
            .getUniqueTaxonomyNames()
            .filter((e) => !existingValues.includes(e));

    for (let i = 0; i < taxonomyNames.length; i++) {
        items.push({
            label: taxonomyNames[i],
            kind: CompletionItemKind.Variable,
        });
    }

    return items;
}
