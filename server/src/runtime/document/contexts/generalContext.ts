import { AntlersNode, AbstractNode } from '../../nodes/abstractNode';
import { Position } from '../../nodes/position';
import { LanguageParser } from '../../parser/languageParser';

export class GeneralContext {
    public isRightOfOperator = false;
    public isLeftOfOperator = false;

    static resolveContext(position: Position, node: AntlersNode, feature: AbstractNode | null): GeneralContext {
        const context = new GeneralContext();

        if (feature != null) {
            if (feature.prev != null && LanguageParser.isOperatorType(feature.prev)) {
                context.isRightOfOperator = true;
            }

            if (feature.next != null && LanguageParser.isOperatorType(feature.next)) {
                context.isLeftOfOperator = true;
            }
        }

        return context;
    }
}