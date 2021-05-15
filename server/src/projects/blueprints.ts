import { IScopeVariable } from '../antlers/scope/engine';
import { IFieldsetField } from './fieldsets';
import * as YAML from 'yaml';
import * as fs from 'fs';

const SetFieldTypes: string[] = [
	'replicator', 'bard'
];

export interface IBlueprintField {
	/**
	 * The name of the blueprint or collection introducing the field.
	 */
	blueprintName: string,
	/**
	 * The name of the field.
	 */
	name: string,
	/**
	 * A user-friendly name for the field, if any.
	 */
	displayName: string | null,
	/**
	 * Optional instruction text that is displayed to the end-user.
	 * 
	 * This typically is displayed to authors in the Statamic Control Panel.
	 * This information may also be displayed in completion suggestions.
	 */
	instructionText: string | null,
	/**
	 * The maximum number of allowable items for list-type fields.
	 */
	maxItems: number | null,
	/**
	 * The field type.
	 */
	type: string,
	/**
	 * A reference to the known fieldset instance, if available.
	 */
	refFieldSetField: IFieldsetField | null,
	/**
	 * A list of sets contained within the field.
	 * 
	 * Common examples are the Replicator and Bard fieldtypes.
	 */
	sets: ISet[] | null,
	import: string | null
}

export interface ISet {
	/**
	 * The set's handle.
	 */
	handle: string,
	/**
	 * A user-friendly name for the set of fields.
	 */
	displayName: string,
	/**
	 * The fields contained within the set.
	 */
	fields: IBlueprintField[]
}

export function blueprintFieldFromScopeVariable(variable: IScopeVariable): IBlueprintField {
	return {
		blueprintName: variable.sourceName,
		displayName: variable.name,
		instructionText: '',
		maxItems: -1,
		name: variable.name,
		refFieldSetField: null,
		type: variable.dataType,
		sets: null,
		import: null
	};
}

export function variablesToBlueprintFields(variables: IScopeVariable[]): IBlueprintField[] {
	const fields: IBlueprintField[] = [];

	for (let i = 0; i < variables.length; i++) {
		fields.push(blueprintFieldFromScopeVariable(variables[i]));
	}

	return fields;
}

function blueprintFieldFromFieldSet(field: IFieldsetField): IBlueprintField {
	const fieldToReturn: IBlueprintField = {
		blueprintName: 'fieldset',
		displayName: field.name,
		instructionText: field.instructionText,
		maxItems: field.maxItems,
		name: field.handle,
		type: field.type,
		refFieldSetField: field,
		sets: field.sets,
		import: field.import
	};

	return fieldToReturn;
}

export function blueprintFieldsFromFieldset(fields: IFieldsetField[]): IBlueprintField[] {
	const blueprintFields: IBlueprintField[] = [];

	for (let i = 0; i < fields.length; i++) {
		blueprintFields.push(blueprintFieldFromFieldSet(fields[i]));
	}

	return blueprintFields;
}

function adjustFieldType(fieldType: string, field: any, maxItems: number): string {
	if (fieldType == 'select') {
		if (typeof field.field.multiple !== 'undefined' && field.field.multiple === true) {
			fieldType = 'select_multiple';
		}
	}

	if (typeof field.field.multiple === 'undefined' || maxItems > 1) {
		if (fieldType == 'form') {
			fieldType = 'form_multiple';
		} else if (fieldType == 'sites') {
			fieldType = 'sites_multiple';
		} else if (fieldType == 'taxonomies') {
			fieldType = 'taxonomies_multiple';
		} else if (fieldType == 'user_groups') {
			fieldType = 'user_groups_multiple';
		} else if (fieldType == 'user_roles') {
			fieldType = 'user_roles_multiple';
		} else if (fieldType == 'terms') {
			fieldType = 'terms_multiple';
		} else if (fieldType == 'users') {
			fieldType = 'users_multiple';
		} else if (fieldType == 'structures') {
			fieldType = 'structures_multiple';
		}
	}

	return fieldType;
}

export function getFields(container: any, outerblueprintName: string, fieldSetName: string, path: string, fieldsets: Map<string, IFieldsetField[]>): IBlueprintField[] {
	const foundFields: IBlueprintField[] = [];
	const includedHandles: string[] = [];

	for (const fieldIndex of Object.keys(container[fieldSetName])) {
		const field = container[fieldSetName][fieldIndex];
		let fieldType = '',
			displayName = '',
			instructionText = '',
			maxItems = null,
			sets: ISet[] | null = null,
			importFields: string | null = null;

		// Here we are going to merge in the fieldset fields.
		if (typeof field.import !== 'undefined' && fieldsets.has(field.import)) {
			const fieldsetFields: IFieldsetField[] = fieldsets.get(field.import) as IFieldsetField[];

			for (let i = 0; i < fieldsetFields.length; i++) {
				if (includedHandles.includes(fieldsetFields[i].handle) == false) {
					foundFields.push(blueprintFieldFromFieldSet(fieldsetFields[i]));
					includedHandles.push(fieldsetFields[i].handle);
				}
			}

			continue;
		}

		if (typeof field.import !== 'undefined') {
			importFields = field.import;
		}

		if (typeof field.field !== 'undefined') {
			if (typeof field.field.type !== 'undefined') {
				fieldType = field.field.type;
			}

			if (typeof field.field.display !== 'undefined') {
				displayName = field.field.display;
			}

			if (typeof field.field.instructions !== 'undefined') {
				instructionText = field.field.instructions;
			}

			if (typeof field.field.max_items !== 'undefined') {
				maxItems = field.field.max_items;
			}

			fieldType = adjustFieldType(fieldType, field, maxItems);

			if (SetFieldTypes.includes(fieldType) && typeof field.field.sets !== 'undefined') {
				sets = [];

				for (const setIndex of Object.keys(field.field.sets)) {
					const setContainer = field.field.sets[setIndex],
						setFields = getFields(setContainer, outerblueprintName, 'fields', 'set:' + setIndex, fieldsets);
					let displayName = '';

					if (typeof setContainer.display !== 'undefined') {
						displayName = setContainer.display;
					}

					sets.push({
						handle: setIndex,
						displayName: displayName,
						fields: setFields
					});
				}

			}
		}

		foundFields.push({
			blueprintName: outerblueprintName,
			name: field.handle,
			type: fieldType,
			displayName: displayName,
			instructionText: instructionText,
			maxItems,
			refFieldSetField: null,
			sets: sets,
			import: importFields
		});
	}

	return foundFields;
}

export function getBlueprintFields(fileName: string, blueprintName: string, fieldsets: Map<string, IFieldsetField[]>): IBlueprintField[] {
	const contents = fs.readFileSync(fileName, { encoding: 'utf8' }),
		document = YAML.parse(contents),
		sections = document.sections;
	let fields: IBlueprintField[] = [];

	if (typeof sections !== 'undefined') {
		for (const sectionName of Object.keys(sections)) {
			const section = sections[sectionName];

			if (typeof section.fields !== 'undefined') {
				const sectionFields = getFields(section, blueprintName, 'fields', blueprintName, fieldsets);

				if (sectionFields.length > 0) {
					fields = fields.concat(sectionFields);
				}
			}
		}
	} else {
		if (typeof document.fields !== 'undefined') {
			const documentFields = getFields(document, blueprintName, 'fields', blueprintName, fieldsets);

			if (documentFields.length > 0) {
				fields = fields.concat(documentFields);
			}
		}
	}

	return fields;
}
