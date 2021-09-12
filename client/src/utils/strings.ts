export function replaceAllInString(value: string, oldString: string, newString: string): string {
	return value.replace(new RegExp(oldString, 'g'), newString);
}