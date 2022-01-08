import * as YAML from "yaml";
import { Pair, Node, YAMLMap, Scalar } from 'yaml/types';
import { Scope } from '../../../antlers/scope/scope';
import { IProjectDetailsProvider } from '../../../projects/projectDetailsProvider';

export class FrontMatterParser {
	private readonly project: IProjectDetailsProvider;
	private documentScope: Scope | null = null;

	constructor(projectProvider: IProjectDetailsProvider) {
		this.project = projectProvider;
	}

	private getKeyValue(node: Node): string {
		if (node instanceof Scalar) {
			return node.value;
		}

		return '';
	}

	private getNodeValue(node: Node) {
		if (node instanceof Scalar) {
			return node.value;
		} else if (node instanceof YAMLMap) {
			return this.analyzeDocument(node.items);
		}

		return '';
	}

	private getScalarRuntimeType(value: string): string {
		if (parseFloat(value).toString() == value || parseInt(value).toString() == value) {
			return 'number';
		}

		return 'string';
	}

	private analyzeDocument(items: Node[]) {
		const nestedScope = new Scope(this.project);


		items.forEach((item) => {
			if (item instanceof Pair) {
				const varName = this.getKeyValue(item.key),
					varValue = this.getNodeValue(item.value);

				if (item.value instanceof Scalar) {
					nestedScope.addVariable({
						dataType: this.getScalarRuntimeType(varValue),
						introducedBy: null,
						name: varName,
						sourceField: null,
						sourceName: '*frontmatter'
					});
				} else {
					nestedScope.addScopeList(varName, varValue);
				}
			}
		});

		return nestedScope;
	}

	parse(text: string) {
		const docs = YAML.parseDocument(text);

		try {

			if (docs.contents instanceof YAMLMap) {
				this.documentScope = this.analyzeDocument(docs.contents.items);
			}
		} catch (err) {
			// Prevent YAML errors from breaking the extension.
			this.documentScope = null;
		}
	}

	hasScope(): boolean {
		if (this.documentScope == null) {
			return false;
		}

		return true;
	}

	getScope(): Scope | null {
		return this.documentScope;
	}

}