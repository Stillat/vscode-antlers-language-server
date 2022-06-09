import { IAntlersParameter } from "../antlers/tagManager";
import ProjectManager from '../projects/projectManager';
import { AntlersNode } from '../runtime/nodes/abstractNode';
import { DocumentDetailsManager } from "./documentDetailsManager";

export interface IEnvironmentHelper {
    documentName: string;
    documentDescription: string;
    collectionInjections: string[];
    blueprints: string[];
    variableHelper: IVariableHelper | null;
    injectsParameters: IAntlersParameter[];
    varReferenceNames: Map<string, string>;
    formatterEnabled: boolean;
}

export interface IVariableHelper {
    variableName: string;
    collectionName: string;
    fieldHandle: string;
    setHandle: string;
}

const EmptyEnvironmentHelper: IEnvironmentHelper = {
    documentDescription: "",
    documentName: "",
    collectionInjections: [],
    blueprints: [],
    variableHelper: null,
    injectsParameters: [],
    varReferenceNames: new Map(),
    formatterEnabled: true
};

export { EmptyEnvironmentHelper };

const DocumentName = "@name";
const DocumentDescription = "@description";
const DocDescriptionShort = "@desc";
const EntryPrefix = "@entry";
const CollectionPrefix = "@collection";
const BlueprintPrefix = "@blueprint";
const VariablePrefix = "@var";
const SetPrefix = "@set";
const ParamPrefix = "@param";
const RequiredParamPrefix = "@param*";
const ParamFromViewDataDirective = "@front";
const FormatterPrefix = '@format';

export function parseIdeHelper(documentUri: string, symbol: AntlersNode): IEnvironmentHelper {
    if (symbol == null || symbol.isComment == false) {
        return EmptyEnvironmentHelper;
    }

    const commentLines: string[] = symbol.content
        .replace(/(\r\n|\n|\r)/gm, "\n")
        .split("\n")
        .map((r) => r.trim()),
        injectsParameters: IAntlersParameter[] = [],
        varReferenceNames: Map<string, string> = new Map();

    let documentName = "",
        documentDescription = "",
        collectionNames: string[] = [],
        blueprintNames: string[] = [],
        varReference = "",
        variableHelper: IVariableHelper | null = null,
        isParsingDescription = false,
        formatterEnabled = true;

    for (let i = 0; i < commentLines.length; i++) {
        const thisLine = commentLines[i];

        if (thisLine.startsWith(EntryPrefix)) {
            collectionNames = collectionNames.concat(
                thisLine
                    .slice(EntryPrefix.length)
                    .split(",")
                    .map((f) => f.trim())
            );
            isParsingDescription = false;
        } else if (thisLine.startsWith(CollectionPrefix)) {
            collectionNames = collectionNames.concat(
                thisLine
                    .slice(CollectionPrefix.length)
                    .split(",")
                    .map((f) => f.trim())
            );
            isParsingDescription = false;
        } else if (thisLine.startsWith(BlueprintPrefix)) {
            blueprintNames = blueprintNames.concat(
                thisLine
                    .slice(BlueprintPrefix.length)
                    .split(",")
                    .map((f) => f.trim())
            );
            isParsingDescription = false;
        } else if (thisLine.startsWith(DocumentName)) {
            documentName = thisLine.slice(DocumentName.length).trim();
            isParsingDescription = false;
        } else if (thisLine.startsWith(DocumentDescription)) {
            documentDescription = thisLine.slice(DocumentDescription.length).trim();
            isParsingDescription = true;
        } else if (thisLine.startsWith(DocDescriptionShort)) {
            documentDescription = thisLine.slice(DocDescriptionShort.length).trim();
            isParsingDescription = true;
        } else if (thisLine.startsWith(VariablePrefix)) {
            varReference = thisLine.slice(VariablePrefix.length).trim();
            isParsingDescription = false;
        } else if (thisLine.startsWith(SetPrefix)) {
            varReference = "@page " + thisLine.slice(SetPrefix.length).trim();
            isParsingDescription = false;
        } else if (thisLine.startsWith(ParamPrefix)) {
            let sliceLen = ParamPrefix.length,
                paramRequired = false;

            if (thisLine.startsWith(RequiredParamPrefix)) {
                sliceLen = RequiredParamPrefix.length;
                paramRequired = true;
            }

            const directiveDetails = thisLine.slice(sliceLen).trim();

            const directiveParts = directiveDetails.split(" ");

            if (directiveParts.length > 0) {
                if (
                    directiveParts[0] == ParamFromViewDataDirective &&
                    directiveParts.length >= 4
                ) {
                    directiveParts.shift();

                    const varName = directiveParts.shift() as string,
                        paramName = directiveParts.shift() as string,
                        paramDesc = directiveParts.join(" ") as string;

                    injectsParameters.push({
                        acceptsVariableInterpolation: true,
                        aliases: [],
                        allowsVariableReference: true,
                        description: paramDesc,
                        expectsTypes: ["*"],
                        isDynamic: true,
                        isRequired: paramRequired,
                        name: paramName,
                    });

                    varReferenceNames.set(paramName, varName);
                } else {
                    const paramName = directiveParts.shift() as string,
                        paramDesc = directiveParts.join(" ") as string;

                    injectsParameters.push({
                        acceptsVariableInterpolation: true,
                        aliases: [],
                        allowsVariableReference: true,
                        description: paramDesc,
                        expectsTypes: ["*"],
                        isDynamic: true,
                        isRequired: paramRequired,
                        name: paramName,
                    });
                }
            }
        } else if (thisLine.startsWith(FormatterPrefix)) {
            const formatterDetails = thisLine.slice(FormatterPrefix.length).trim().toLowerCase();

            if (formatterDetails == 'true') {
                formatterEnabled = true;
            } else {
                formatterEnabled = false;
            }
        } else {
            if (isParsingDescription) {
                documentDescription += "\n" + thisLine.trim();
            }
        }
    }

    if (varReference.length > 0) {
        const varNameParts = varReference.split(" ");

        if (varNameParts.length == 2) {
            const varName = varNameParts[0],
                fieldPath = varNameParts[1];

            if (fieldPath.includes(".")) {
                const refParts = fieldPath.split(".");

                if (refParts.length == 2) {
                    const collectionName = refParts[0],
                        fieldHandle = refParts[1];

                    variableHelper = {
                        variableName: varName,
                        collectionName: collectionName,
                        fieldHandle: fieldHandle,
                        setHandle: "",
                    };
                } else if (refParts.length == 3) {
                    const collectionName = refParts[0],
                        fieldHandle = refParts[1],
                        setHandle = refParts[2];

                    variableHelper = {
                        variableName: varName,
                        collectionName: collectionName,
                        fieldHandle: fieldHandle,
                        setHandle: setHandle,
                    };
                }
            } else {
                variableHelper = {
                    variableName: varName,
                    setHandle: "",
                    collectionName: "",
                    fieldHandle: fieldPath,
                };
            }
        }
    }

    if (documentUri.trim().length > 0 && ProjectManager.instance != null && ProjectManager.instance.hasStructure()) {
        const projectView = ProjectManager.instance.getStructure().findView(documentUri);

        if (projectView != null) {
            projectView.injectsParameters = injectsParameters;
            projectView.varReferenceNames = varReferenceNames;
        }
    }

    const ideHelper: IEnvironmentHelper = {
        documentName: documentName,
        documentDescription: documentDescription,
        collectionInjections: collectionNames,
        blueprints: blueprintNames,
        variableHelper: variableHelper,
        injectsParameters: injectsParameters,
        varReferenceNames: varReferenceNames,
        formatterEnabled: formatterEnabled
    };

    if (documentUri.trim().length > 0 && symbol.startPosition != null) {
        if (symbol.startPosition.line <= 1 || symbol.index <= 1) {
            DocumentDetailsManager.registerDetails(documentUri, ideHelper);
        }
    }

    return ideHelper;
}
