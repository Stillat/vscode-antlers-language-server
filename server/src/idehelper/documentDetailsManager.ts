import { IEnvironmentHelper } from './parser';

export class DocumentDetailsManager {
	static documentDetails: Map<string, IEnvironmentHelper> = new Map();


	static registerDetails(documentUri: string, details: IEnvironmentHelper) {
		this.documentDetails.set(documentUri, details);
	}

	static hasDetails(documentUri: string): boolean {
		return this.documentDetails.has(documentUri);
	}

}
