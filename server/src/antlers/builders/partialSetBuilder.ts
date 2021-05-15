import { trimLeft, trimRight } from '../../utils/strings';

export function makePartialSetStatements(setNames: string[]): string {
	const sortedItems = setNames.sort();
	let statements = "";

	for (let i = 0; i < sortedItems.length; i++) {
		let prefix = "{{ ";

		if (i == 0) {
			prefix = "{{";
		}

		statements += prefix + sortedItems[i] + " }}\n    {{ partial src=\"${1:sets}/{type}\" }}\n{{ /" + sortedItems[i] + " }}\n\n";
	}

	statements = trimLeft(statements, '{');
	statements = trimRight(statements, "\n");
	statements = trimRight(statements, '}');

	return statements;
}
