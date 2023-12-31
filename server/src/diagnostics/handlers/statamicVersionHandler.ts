import TagManager from '../../antlers/tagManagerInstance.js';
import ProjectManager from '../../projects/projectManager.js';
import { AntlersError, ErrorLevel } from '../../runtime/errors/antlersError.js';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes.js';
import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { IDiagnosticsHandler } from '../diagnosticsHandler.js';
import * as semver from 'semver';

const StatamicVersionHandler: IDiagnosticsHandler = {
    checkNode(node: AntlersNode) {
        const errors: AntlersError[] = [];

        if (node.isOpenedBy != null) { return errors; }

        if (!ProjectManager.instance?.hasStructure()) { return errors; }

        const currentVersion = ProjectManager.instance.getStructure().getStatamicVersion();

        if (currentVersion == null || currentVersion.trim().length == 0) { return errors; }

        if (!TagManager.instance?.isKnownTag(node.runtimeName())) { return errors; }

        const tagRef = TagManager.instance?.findTag(node.runtimeName());

        if (tagRef?.introducedIn == null) { return errors; }

        try {
            if (semver.lt(currentVersion, tagRef.introducedIn)) {
                errors.push(AntlersError.makeSyntaxError(
                    AntlersErrorCodes.LINT_VERSION_NOT_COMPATIBLE,
                    node,
                    node.runtimeName() + ' requires at least Statamic ' + tagRef.introducedIn + '. Current project version: ' + currentVersion,
                    ErrorLevel.Warning
                ));
            }
        } catch (err) {
            // Ignore the invalid version to prevent things crashing.
        }

        return errors;
    }
};

export default StatamicVersionHandler;
