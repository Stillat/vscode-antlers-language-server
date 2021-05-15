var fs = require('fs');
var builtInRules = fs.readFileSync('client/syntaxes/rules/builtin.txt').toString().split("\n");
var yamlStructureFile = fs.readFileSync('client/syntaxes/antlers.source.yaml').toString();


var builtInRegex = builtInRules.join('|');


var outputStructure = yamlStructureFile.replace('<!BUILTIN_RULES>', builtInRegex);

fs.writeFileSync('client/syntaxes/antlers.yaml', outputStructure);