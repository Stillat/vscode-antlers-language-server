import { IDocumentationSnippet } from '../types';

export class PipedTagSnippetProvider {
    static generate(tagName: string, parameterName: string, handle: string): IDocumentationSnippet {
        return {
            overview: `Use the values of the ${handle} field to retrieve items using the ${tagName} tag`,
            snippet: `{{ ${tagName} ${parameterName}="{${handle}|piped}" }}

{{ /${tagName} }}`
        };
    }

    static generateSingle(tagName: string, parameterName: string, handle: string) {
        return {
            overview: `Use the value of the ${handle} field to retrieve items using the ${tagName} tag`,
            snippet: `{{ ${tagName} :${parameterName}="${handle}.handle" }}

{{ /${tagName} }}`
        };
    }

    static generateCondition(tagName: string, parameterName: string, handle: string) {
        return {
            overview: `Use the values of the ${handle} field with the ${tagName} tag in a condition`,
            snippet: `{{ if {${tagName} ${parameterName}="{${handle}|piped}"} }}

{{ /if }}`
        };
    }

    static generateSingleCondition(tagName: string, parameterName: string, handle: string) {
        return {
            overview: `Use the value of the ${handle} field with the ${tagName} tag in a condition`,
            snippet: `{{ if {${tagName} :${parameterName}="${handle}.handle"} }}

{{ /if }}`
        };
    }
}