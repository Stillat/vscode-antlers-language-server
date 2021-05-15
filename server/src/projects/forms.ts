import { IBlueprintField } from './blueprints';

export interface IForm {
	title: string,
	fields: Map<string, IBlueprintField[]>
}
