import * as yaml from 'js-yaml';

export class FrontMatterFormatter {
	static formatFrontMatter(contents:string) {
		try {
			const docFrontMatter = yaml.load(contents, {});
			
			let temp = yaml.dump(docFrontMatter, {
				indent: 2,
				noArrayIndent: false,
				condenseFlow: false,
				forceQuotes: true,
				noRefs: true,
				skipInvalid: true,
			});

			if (temp.endsWith("\n")) {
				temp = temp.trimEnd();
			}

			return temp;
		} catch (err) {
			return contents;
		}
	}

}