import { IProjectDetailsProvider } from '../../projects/projectDetailsProvider';
import { Scope } from '../scope/scope';
import { IScopeVariable } from '../scope/types';

export function getSiteData(project: IProjectDetailsProvider): Scope {
    const siteScope = new Scope(project);

    siteScope.addVariable({ dataType: 'string', name: 'handle', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    siteScope.addVariable({ dataType: 'string', name: 'name', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    siteScope.addVariable({ dataType: 'string', name: 'locale', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    siteScope.addVariable({ dataType: 'string', name: 'short_locale', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    siteScope.addVariable({ dataType: 'string', name: 'url', sourceField: null, sourceName: '*internal.system', introducedBy: null });

    return siteScope;
}

export function getSystemVariables(): IScopeVariable[] {
    const systemVariables: IScopeVariable[] = [];

    systemVariables.push({ dataType: 'number', name: 'response_code', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'string', name: 'csrf_field', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'string', name: 'csrf_token', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'string', name: 'environment', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'string', name: 'template', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'string', name: 'xml_header', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'string', name: 'last_segment', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'string', name: 'homepage', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'string', name: 'current_uri', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'string', name: 'current_url', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'string', name: 'amp_url', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'string', name: 'api_url', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'string', name: 'current_full_url', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'string', name: 'current_template', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'boolean', name: 'logged_in', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'boolean', name: 'logged_out', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'boolean', name: 'is_homepage', sourceField: null, sourceName: '*internal.system', introducedBy: null });

    /* Waiting to see what https://github.com/statamic/cms/pull/5109 looks like once its ready. */
    /*systemVariables.push({ dataType: 'boolean', name: 'is_live_previewing', sourceField: null, sourceName: '*internal.system', introducedBy: null });*/

    systemVariables.push({ dataType: 'date', name: 'now', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'date', name: 'today', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'date', name: 'current_date', sourceField: null, sourceName: '*internal.system', introducedBy: null });

    systemVariables.push({ dataType: 'array', name: 'get', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'array', name: 'get_post', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'array', name: 'post', sourceField: null, sourceName: '*internal.system', introducedBy: null });
    systemVariables.push({ dataType: 'array', name: 'old', sourceField: null, sourceName: '*internal.system', introducedBy: null });

    return systemVariables;
}
