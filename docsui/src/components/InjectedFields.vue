<script lang="ts">
import { provideVSCodeDesignSystem, vsCodeDataGrid, vsCodeDataGridCell, vsCodeDataGridRow } from "@vscode/webview-ui-toolkit";
import type { IInjectedField } from '../documentation/types';

provideVSCodeDesignSystem().register(vsCodeDataGrid(), vsCodeDataGridCell(), vsCodeDataGridRow());

export default {
    props: {
        fields: {
            type: Object() as () => IInjectedField[],
            required: true
        }
    }
}
</script>

<template>
    <vscode-data-grid>
        <vscode-data-grid-row row-type="header">
            <vscode-data-grid-cell cell-type="columnheader" grid-column="1">Name</vscode-data-grid-cell>
            <vscode-data-grid-cell cell-type="columnheader" grid-column="2">Type</vscode-data-grid-cell>
            <vscode-data-grid-cell cell-type="columnheader" grid-column="3">Description</vscode-data-grid-cell>
        </vscode-data-grid-row>
        <vscode-data-grid-row v-for="field in fields">
            <vscode-data-grid-cell grid-column="1">{{ field.name }}</vscode-data-grid-cell>
            <vscode-data-grid-cell grid-column="2">{{ field.type }}</vscode-data-grid-cell>
            <vscode-data-grid-cell grid-column="3">{{ field.description }}</vscode-data-grid-cell>
        </vscode-data-grid-row>
    </vscode-data-grid>
</template>