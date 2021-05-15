export interface IIfTree {
	variableName: string,
	checkTerms: string[]
}

export function makeIfStatementTree(tree: IIfTree): string {
	const sortedItems = tree.checkTerms.sort();
	let statements = "";

	if (sortedItems.length == 0) {
		return statements;
	} else if (sortedItems.length == 1) {
		statements = "if " + tree.variableName + " == '" + sortedItems[0] + "' }}\n    $1\n\n{{ /if ";
	} else {
		const firstItem = sortedItems.shift() as string;

		statements = "if " + tree.variableName + " == '" + firstItem + "' }}\n    $1";

		for (let i = 0; i < sortedItems.length; i++) {
			statements += "\n{{ elseif " + tree.variableName + " == '" + sortedItems[i] + "' }}\n    ";
		}

		statements += "\n{{ /if ";
	}

	return statements;
}
