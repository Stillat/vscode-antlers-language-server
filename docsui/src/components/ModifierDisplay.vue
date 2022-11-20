<script lang="ts">
import {
    provideVSCodeDesignSystem, vsCodeButton, vsCodePanelTab,
    vsCodeDataGrid, vsCodeDataGridCell, vsCodeDataGridRow, vsCodeTextArea, vsCodeTextField,
    vsCodePanels, vsCodePanelView, vsCodeBadge
} from "@vscode/webview-ui-toolkit";
import type { IDocumentationModifier, IFieldtypeDocumentationOverview } from '../documentation/types';
import { ModifierGenerator } from '../documentation/modifierGenerator';
import type { DataGrid } from '@microsoft/fast-foundation';
import { toRaw } from 'vue';
import { vscode } from '@/utilities/vscode';
import { marked } from 'marked';

provideVSCodeDesignSystem().register(
    vsCodeButton(), vsCodeTextField(), vsCodePanelTab(),
    vsCodePanels(), vsCodeDataGrid(), vsCodeDataGridCell(),
    vsCodeDataGridRow(), vsCodePanelView(), vsCodeBadge()
);

export default {
    props: {
        modifier: {
            type: Object() as () => IDocumentationModifier,
            required: true
        },
        field: {
            type: Object() as () => IFieldtypeDocumentationOverview,
            required: true
        }
    },
    computed: {
        lines(): string[] {
            return (this as any).code.replace(/\r?\n/g, "\n").split("\n");
        }
    },
    data() {
        return {
            code: '',
            id: '',
        };
    },
    methods: {
        generateSnippet() {
            const context = (this as any);

            context.code = ModifierGenerator.generateDocs(context.modifier, context.field, context.field.augmentsTo == 'builder');
        },
        copySnippet() {
            navigator.clipboard.writeText((this as any).code).then(() => {
                vscode.postMessage({ type: 'message', text: 'Snippet copied to clipboard.' });
            }).catch(() => {
                vscode.postMessage({ type: 'error', text: 'The snippet could not be copied to the clipboard.' });
            });
        },
        parsedDescription() {
            const context = (this as any);

            return marked.parse(context.modifier.description);
        }
    },
    mounted() {
        const context = (this as any);
        context.$nextTick(function () {
            const dataGridView = context.$refs['gridView' + context.id] as DataGrid;

            if (typeof dataGridView !== 'undefined') {
                const injectedDetails = toRaw(context.modifier.parameters);

                dataGridView.rowsData = injectedDetails;
                dataGridView.columnDefinitions = [
                    { columnDataKey: 'name', title: 'Parameter Name' },
                    { columnDataKey: 'description', title: 'Description' }
                ];
            }
        });
    },
    created() {
        (this as any).generateSnippet();
        (this as any).id = 'view_' + (Date.now().toString(32) + Math.random().toString(16)).replace(/\./g, '');
    }
}
</script>

<template>
    <div class="toolbox__snippet-container">
        <div class="toolbox__modifier">
            <div style="display: flex;justify-content: space-between;">
                <span><strong>{{ modifier.name }}</strong></span>
                <div class="toolbox__modifier-tools">
                    <a @click="copySnippet" class="snippet__button" aria-label="Copy snippet to clipboard">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="16" width="16"><defs></defs><title>copy-paste</title><path d="M9.5,21.5h-8a1,1,0,0,1-1-1V4.5a1,1,0,0,1,1-1h2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M13.5,3.5h2a1,1,0,0,1,1,1V8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="8.5" cy="1.999" r="1.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></circle><path d="M9.915,2.5H12.5a1,1,0,0,1,1,1v1a1,1,0,0,1-1,1h-8a1,1,0,0,1-1-1v-1a1,1,0,0,1,1-1H7.085" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M22.5,22.5a1,1,0,0,1-1,1h-9a1,1,0,0,1-1-1V11a1,1,0,0,1,1-1h7.086a1,1,0,0,1,.707.293l1.914,1.914a1,1,0,0,1,.293.707Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><line x1="14.5" y1="14.499" x2="19.5" y2="14.499" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></line><line x1="14.5" y1="17.499" x2="19.5" y2="17.499" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></line></svg>
                        Copy to Clipboard
                    </a>
                </div>
            </div>

            <div v-html="parsedDescription()"></div>
            <p v-if="modifier.docLink != null">Documentation <a :href="modifier.docLink">{{ modifier.docLink }}</a></p>
            <pre v-if="modifier.parameters.length == 0"><code v-for="line in lines" style="display:block;">{{ line }}</code></pre>

            <div v-if="modifier.parameters.length > 0">
                <vscode-panels>
                    <vscode-panel-tab :id="'modifier__snippet' + id">
                        SNIPPET
                    </vscode-panel-tab>
                    <vscode-panel-tab :id="'modifier__params' + id">
                        PARAMETERS
                    </vscode-panel-tab>

                    <vscode-panel-view :id="'modifier__snippet' + id">
                        <pre><code v-for="line in lines" style="display:block;">{{ line }}</code></pre>
                    </vscode-panel-view>
                    
                    <vscode-panel-view :id="'modifier__params' + id">
                        <vscode-data-grid :ref="'gridView' + id"></vscode-data-grid>
                    </vscode-panel-view>
                </vscode-panels>
            </div>
        </div>
    </div>
</template>

<style>
.toolbox__modifier-tools {
    display: flex;
    justify-content: end;
    align-items: center;
    margin-bottom: 10px;
}

.snippet__button {
    display: flex;
    align-items: center;
    flex-direction: revert;
    column-gap: 0.5em;
    cursor: pointer;
}

.toolbox__modifier-container {
    border: 1px solid #5a5a5a;
    padding: 10px;
}

.toolbox__modifier pre {
    counter-reset: line;
    margin-top: 5px;
}

.toolbox__modifier code {
    counter-increment: line;
}

.toolbox__modifier code:before {
    content: counter(line);
    margin-right: 10px;
    border-right: 1px solid;
    padding-right: 5px;
    width: 4ch;
    display: inline-block;
    text-align: right;
}
</style>