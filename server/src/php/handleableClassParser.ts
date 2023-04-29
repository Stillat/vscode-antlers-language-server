import { StringUtilities } from '../runtime/utilities/stringUtilities';
import { extractCommentDescription } from './phpUtils';

const engine = require('php-parser');

export interface IHandledClass {
    className: string | undefined,
    handle: string | undefined,
    description: string
}
export class HandleableClassParser {
    static parsePhp(code: string): IHandledClass {
        let className: string | undefined,
            staticHandle: string | undefined,
            description = '';
        const parser = new engine({
            // some options :
            parser: {
                extractDoc: true,
                php7: true,
            },
            ast: {
                withPositions: true,
            },
        });

        const ast = parser.parseCode(code);

        ast.children.forEach((node: any) => {
            if (node.kind === 'namespace') {
                node.children.forEach((childNode: any) => {
                    if (childNode.kind === 'class') {
                        className = childNode.name.name;
                        description = extractCommentDescription(childNode);

                        childNode.body.forEach((grandchildNode: any) => {
                            if (grandchildNode.kind === 'propertystatement' && grandchildNode.isStatic) {
                                if (grandchildNode.properties.length > 0) {
                                    if (grandchildNode.properties[0].name?.name === 'handle') {
                                        staticHandle = grandchildNode.properties[0].value?.value;
                                    }
                                }
                            }
                          });
                    }
                });
            }
        });

        if (typeof staticHandle === 'undefined' && typeof className !== 'undefined') {
            staticHandle = StringUtilities.snakeCase(className);
        }

        return {
            className: className,
            handle: staticHandle,
            description: description
        };
    }
}