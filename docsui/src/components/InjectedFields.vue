<script lang="ts">
import type { DataGrid } from '@microsoft/fast-foundation';
import { provideVSCodeDesignSystem, vsCodeDataGrid, vsCodeDataGridCell, vsCodeDataGridRow } from "@vscode/webview-ui-toolkit";
import { toRaw } from 'vue';
import type { IInjectedField } from '../documentation/types';

provideVSCodeDesignSystem().register(vsCodeDataGrid(), vsCodeDataGridCell(), vsCodeDataGridRow());

export default {
    props: {
        fields: {
            type: Object() as () => IInjectedField[],
            required: true
        }
    },
    mounted() {
        const context = (this as any),
            dataGridView = context.$refs.gridView as DataGrid,
            injectedDetails = toRaw(context.fields);

        dataGridView.rowsData = injectedDetails;
        dataGridView.columnDefinitions = [
            { columnDataKey: 'name', title: 'Field Name' },
            { columnDataKey: 'type', title: 'Data Type' }
        ];
    }
}
</script>

<template>
    <vscode-data-grid ref="gridView"></vscode-data-grid>
</template>