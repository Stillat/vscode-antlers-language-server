import { IProjectFields, ITableFieldType } from '../../../projects/structuredFieldTypes/types';
import { AugmentationTypes } from '../augmentationTypes';
import { OfficialDocumentationLinkProvider } from '../providers/officialDocumentationLinkProvider';
import { IDocumentationProperty, IDocumentationProvider, IDocumentationResult, IDocumentationSnippet, IInjectedField } from '../types';

export class TableDocumentationProvider implements IDocumentationProvider {
    resolve(table: ITableFieldType, currentProject: IProjectFields): IDocumentationResult {
        const docLink = OfficialDocumentationLinkProvider.getDocLink(table.type),
            injectedFields: IInjectedField[] = [],
            overviewProperties: IDocumentationProperty[] = [];

        let rawReturns: AugmentationTypes = AugmentationTypes.Array,
            augmentsTo: AugmentationTypes = AugmentationTypes.Array,
            overviewSnippets: IDocumentationSnippet[] = [];

        overviewSnippets.push({
            overview: `Using the table modifier to conver the ${table.handle} to HTML`,
            snippet: `{{ ${table.handle} | table /}}`
        });

        overviewSnippets.push({
            overview: 'Iterating the table and render the contents',
            snippet: `<table>
  {{ ${table.handle} }}
    <tr>
      {{ cells }}
        <td>{{ value /}}</td>
      {{ /cells }}
    </tr>
  {{ /${table.handle} }}
</table>`
        });

        overviewSnippets.push({
            overview: 'Using the "as" modifier to access individual rows',
            snippet: `{{ ${table.handle} as="rows" }}
    <thead>
        <tr>
        {{ rows.0.cells }}
            <th>{{ value /}}</th>
        {{ /rows.0.cells }}
        </tr>
    </thead>
    <tbody>
    {{ rows offset="1" }}
        <tr>
        {{ cells }}
            <td>{{ value /}}</td>
        {{ /cells }}
        </tr>
    {{ /rows }}
    </tbody>
{{ /${table.handle} }}`
        });

        overviewSnippets.push({
            overview: 'Using a variable to conditionally render a table header element',
            snippet: `<table>
  {{ ${table.handle} }}
    {{ if first && first_row_headers }}
      <thead>
        <tr>
          {{ cells }}
            <th>{{ value /}}</th>
          {{ /cells }}
        </tr>
      </thead>
      <tbody>
    {{ /if }}
    {{ if !first && first_row_headers || !first_row_headers }}
      {{ if first }}
        <tbody>
      {{ /if }}
        <tr>
          {{ cells }}
            <td>{{ value /}}</td>
          {{ /cells }}
        </tr>
      {{ if last }}
        </tbody>
      {{ /if }}
    {{ /if }}
  {{ /${table.handle} }}
</table>`,
        });

        overviewSnippets.push({
            overview: 'Using a variable to conditionally render a table header element; using ternary conditions to render the body',
            snippet: `<table>
  {{ ${table.handle} }}
    {{ if first && first_row_headers }}
      <thead>
        <tr>
          {{ cells }}
            <th>{{ value /}}</th>
          {{ /cells }}
        </tr>
      </thead>
      <tbody>
    {{ /if }}
    {{ if !first && first_row_headers || !first_row_headers }}
      {{ first ?= '<tbody>' }}
      <tr>
          {{ cells }}
          <td>{{ value /}}</td>
          {{ /cells }}
      </tr>      
      {{ last ?= '</tbody>' }}
    {{ /if }}
  {{ /${table.handle} }}
</table>`,
        });

        return {
            resolved: true,
            documentation: {
                handle: table.type,
                field: table,
                injects: injectedFields,
                stringable: false,
                rawReturns: rawReturns,
                augmentsTo: augmentsTo,
                canBeTagPair: true,
                exampleSnippets: [],
                overviewSnippets: overviewSnippets,
                officialDocumentation: docLink,
                overviewProperties: overviewProperties,
                stringableReturns: '',
                modifiers: []
            }
        };
    }
}