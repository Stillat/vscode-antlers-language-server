import { IProjectDetailsProvider } from '../../../../projects/projectDetailsProvider';
import { AntlersNode } from '../../../../runtime/nodes/abstractNode';
import { getScopeName } from "../../../tags";
import {
    ICollectionContext,
    ISpecialResolverResults
} from "../../../types";
import {
    CollectionRestrictionParams,
    CollectionSourceParams,
} from "./parameters";

function getAliasName(node: AntlersNode): string | null {
    return node.findParameterValueOrNull('as');
}

const BuiltInCollectionMethods: string[] = ["count", "next", "previous"];

function getCollectionName(node: AntlersNode, statamicProject: IProjectDetailsProvider): string[] | null {
    let collectionNames: string[] = [];

    if (node.hasMethodPart()) {
        const methodNameValue = node.getMethodNameValue();

        if (BuiltInCollectionMethods.includes(methodNameValue) == false) {
            collectionNames.push(methodNameValue);

            return collectionNames;
        }
    }

    const fromParam = node.findAnyParameter(CollectionSourceParams),
        restrictParam = node.findAnyParameter(CollectionRestrictionParams);
    let fromList: string[] = [],
        notInList: string[] = [];

    if (typeof fromParam !== "undefined" && fromParam !== null) {
        if (fromParam.value.trim() === "*") {
            fromList = statamicProject.getUniqueCollectionNames();

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
        collectionNames = fromList.filter(function (n) {
            return notInList.includes(n) == false;
        });
    } else {
        collectionNames = fromList;
    }

    return collectionNames;
}

export function resolveCollectionScope(symbol: AntlersNode, project: IProjectDetailsProvider): ISpecialResolverResults {
    const collectionNames = getCollectionName(symbol, project);
    let isAliased = false,
        isPaginated = false,
        isScoped = false,
        scopeName = null,
        aliasName = "";

    if (symbol.isClosingTag == false) {
        const alias = getAliasName(symbol),
            scope = getScopeName(symbol);

        if (alias != null) {
            isAliased = true;
            aliasName = alias;
        }

        if (scope != null) {
            isScoped = true;
            scopeName = scope;
        }

        isPaginated = symbol.hasParameter('paginate');
    }

    const collectionScope: ICollectionContext = {
        collectionNames: collectionNames ?? [],
        endPosition: symbol.endPosition?.char ?? 0,
        aliasName: aliasName,
        isAliased: isAliased,
        isScoped: isScoped,
        scopeName: scopeName,
        isStartOfScope: !symbol.isClosingTag,
        line: symbol.startPosition?.line ?? 0,
        startPosition: symbol.startPosition?.char ?? 0,
        isPaginated: isPaginated,
        excludeCollections: [],
        includeCollections: [],
    };

    return {
        context: collectionScope,
        issues: [],
    };
}
