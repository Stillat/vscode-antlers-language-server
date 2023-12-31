import { Position } from 'vscode-languageserver';;
import ProjectManager from '../../projects/projectManager.js';
import { DynamicClassAnalyzer } from '../../runtime/analyzers/dynamicClassAnalyzer.js';
import { AntlersDocument } from '../../runtime/document/antlersDocument.js';
import { AntlersError, ErrorLevel } from '../../runtime/errors/antlersError.js';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes.js';
import { AntlersNode, ConditionNode } from '../../runtime/nodes/abstractNode.js';
import { antlersPositionToVsCode } from '../../utils/conversions.js';
import { IDocumentDiagnosticsHandler } from '../documentHandler.js';
import * as fs from 'fs';
import { AntlersSettings } from '../../antlersSettings.js';

const DynamicClassNameHandler: IDocumentDiagnosticsHandler = {
    checkDocument(document: AntlersDocument, settings: AntlersSettings) {
        if (settings.diagnostics.warnOnDynamicCssClassNames == false) {
            return [];
        }

        const errors: AntlersError[] = [],
            results = (new DynamicClassAnalyzer()).analyze(document);

        if (results.length == 0) { return errors; }

        let configuredClassCheckContent = '';

        if (ProjectManager.instance?.hasStructure()) {
            const rootPath = ProjectManager.instance.getStructure().getProjectRoot(),
                possibleConfigPaths:string[] = [];

            possibleConfigPaths.push(rootPath + 'tailwind.config.js');
            possibleConfigPaths.push(rootPath + 'webpack.mix.js');
            possibleConfigPaths.push(rootPath + 'webpack.config.js');

            for (let i = 0; i < possibleConfigPaths.length; i++) {
                if (fs.existsSync(possibleConfigPaths[i])) {
                    configuredClassCheckContent = fs.readFileSync(possibleConfigPaths[i], { encoding: 'utf8' });
                    break;
                }
            }
        }

        results.forEach((result) => {
            const allNames = result.classNames.concat(result.patterns),
                error = AntlersError.makeSyntaxError(
                    AntlersErrorCodes.LINT_DYNAMIC_CLASS_NAMES_POSSIBLE_PURGE,
                    result.node,
                    `Dynamic CSS class name generation detected. Some build tools, like PurgeCSS, may not be able to find these classes. It is recommended to use full class names, or configure a class safelist.
    
Possible Classes: ${allNames.join(', ')}`,
                    ErrorLevel.Warning
                );

            let doCreate = true;

            if (configuredClassCheckContent.trim().length > 0) {
                doCreate = false;

                for (let i = 0; i < allNames.length; i++) {
                    if (configuredClassCheckContent.includes(allNames[i]) == false) {
                        doCreate = true;break;
                    }
                }
            }

            if (!doCreate) {
                return;
            }

            let start: Position = antlersPositionToVsCode(result.node.startPosition),
                end: Position = antlersPositionToVsCode(result.node.endPosition);

            if (result.node instanceof ConditionNode) {
                if (result.node.logicBranches.length > 0) {
                    const firstBranch = result.node.logicBranches[0],
                        lastBranch = result.node.logicBranches[result.node.logicBranches.length - 1];

                    if (firstBranch.head != null && lastBranch.head != null && lastBranch.head.isClosedBy != null) {
                        start = antlersPositionToVsCode(firstBranch.head.startPosition);
                        end = antlersPositionToVsCode(lastBranch.head.isClosedBy.endPosition);
                    }
                }
            } else if (result.node instanceof AntlersNode) {
                start = antlersPositionToVsCode(result.node.startPosition);
                end = antlersPositionToVsCode(result.node.endPosition);
            }


            start.character = start.character - result.prefix.length - 1;
            end.character = end.character + result.suffix.length;
            error.lsRange = { start: start, end: end };
            error.data = result;

            errors.push(error);
        });

        return errors;
    }
}

export default DynamicClassNameHandler;
