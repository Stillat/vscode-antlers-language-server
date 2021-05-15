import { ISymbol } from '../antlers/types';
import { DocumentDetailsManager } from './documentDetailsManager';

export interface IEnvironmentHelper {
	documentName: string,
	documentDescription: string,
	collectionInjections: string[],
	blueprints: string[],
	variableHelper: IVariableHelper | null
}

export interface IVariableHelper {
	variableName: string,
	collectionName: string,
	fieldHandle: string,
	setHandle: string
}

const EmptyEnvironmentHelper: IEnvironmentHelper = {
	documentDescription: '',
	documentName: '',
	collectionInjections: [],
	blueprints: [],
	variableHelper: null
};

export { EmptyEnvironmentHelper };

const DocumentName = '@name';
const DocumentDescription = '@description';
const DocDescriptionShort = '@desc';
const EntryPrefix = '@entry';
const CollectionPrefix = '@collection';
const BlueprintPrefix = '@blueprint';
const VariablePrefix = '@var';
const SetPrefix = '@set';

export function parseIdeHelper(documentUri: string, symbol: ISymbol): IEnvironmentHelper {
	if (symbol == null || symbol.isComment == false) {
		return EmptyEnvironmentHelper;
	}

	const commentLines: string[] = symbol.content.replace(/(\r\n|\n|\r)/gm, "\n").split("\n").map(r => r.trim());

	let documentName = '',
		documentDescription = '',
		collectionNames: string[] = [],
		blueprintNames: string[] = [],
		varReference = '',
		variableHelper: IVariableHelper | null = null,
		isParsingDescription = false;

	for (let i = 0; i < commentLines.length; i++) {
		const thisLine = commentLines[i];

		if (thisLine.startsWith(EntryPrefix)) {
			collectionNames = collectionNames.concat(thisLine.slice(EntryPrefix.length).split(',').map(f => f.trim()));
			isParsingDescription = false;
		} else if (thisLine.startsWith(CollectionPrefix)) {
			collectionNames = collectionNames.concat(thisLine.slice(CollectionPrefix.length).split(',').map(f => f.trim()));
			isParsingDescription = false;
		} else if (thisLine.startsWith(BlueprintPrefix)) {
			blueprintNames = blueprintNames.concat(thisLine.slice(BlueprintPrefix.length).split(',').map(f => f.trim()));
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
			varReference = '@page ' + thisLine.slice(SetPrefix.length).trim();
			isParsingDescription = false;
		} else {
			if (isParsingDescription) {
				documentDescription += "\n" + thisLine.trim();
			}
		}
	}

	if (varReference.length > 0) {
		const varNameParts = varReference.split(' ');

		if (varNameParts.length == 2) {
			const varName = varNameParts[0],
				fieldPath = varNameParts[1];

			if (fieldPath.includes('.')) {
				const refParts = fieldPath.split('.');

				if (refParts.length == 2) {
					const collectionName = refParts[0],
						fieldHandle = refParts[1];

					variableHelper = {
						variableName: varName,
						collectionName: collectionName,
						fieldHandle: fieldHandle,
						setHandle: ''
					};
				} else if (refParts.length == 3) {
					const collectionName = refParts[0],
						fieldHandle = refParts[1],
						setHandle = refParts[2];

					variableHelper = {
						variableName: varName,
						collectionName: collectionName,
						fieldHandle: fieldHandle,
						setHandle: setHandle
					};
				}
			} else {
				variableHelper = {
					variableName: varName,
					setHandle: '',
					collectionName: '',
					fieldHandle: fieldPath
				};
			}
		}
	}

	const ideHelper: IEnvironmentHelper = {
		documentName: documentName,
		documentDescription: documentDescription,
		collectionInjections: collectionNames,
		blueprints: blueprintNames,
		variableHelper: variableHelper
	};

	if (symbol.startLine == 0) {
		DocumentDetailsManager.registerDetails(documentUri, ideHelper);
	}

	return ideHelper;
}
