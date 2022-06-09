import { getViewName } from '../../antlers/tags/core/partials/partialUtilities';
import ProjectManager from '../../projects/projectManager';
import { AntlersDocument } from '../../runtime/document/antlersDocument';
import { AntlersError, ErrrorLevel } from '../../runtime/errors/antlersError';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes';
import { IDocumentDiagnosticsHandler } from '../documentHandler';

const PartialRecursionHandler: IDocumentDiagnosticsHandler = {
    checkDocument(document: AntlersDocument) {
        const errors: AntlersError[] = [];

        document.getAllAntlersNodes().forEach((node) => {
            if (node.isTagNode && node.name != null && node.getTagName() == 'partial') {
                const viewName = getViewName(node);

                if (viewName == null) { return; }

                const viewRef = ProjectManager.instance?.getStructure()?.findRelativeView(viewName);

                if (typeof viewRef == 'undefined' || viewRef == null) { return ; }

                if (viewRef.documentUri == document.documentUri) {
                    const conditionalParent = node.findParentOfType(['if', 'elseif', 'else']);
                    
                    if (conditionalParent == null) {
                        errors.push(AntlersError.makeSyntaxError(
                            AntlersErrorCodes.LINT_POSSIBLE_PARTIAL_RECURSION,
                            node,
                            "Possible partial recursion detected",
                            ErrrorLevel.Warning
                        ));
                    }
                }
            }
        });

        return errors;
    }
};

export default PartialRecursionHandler;
