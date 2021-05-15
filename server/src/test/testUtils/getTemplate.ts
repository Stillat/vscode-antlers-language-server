const fs = require('fs');

export function getTemplateContent(name: string): string {
	return fs.readFileSync('./server/src/test/testTemplates/' + name + '.antlers.html', { encoding: 'utf8' });
}
