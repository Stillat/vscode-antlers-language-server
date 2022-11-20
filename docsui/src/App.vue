<script  lang="ts">
import {
    provideVSCodeDesignSystem, vsCodeButton, vsCodePanelTab,
    vsCodeDataGrid, vsCodeDataGridCell, vsCodeDataGridRow, vsCodeTextArea, vsCodeTextField,
    vsCodePanels, vsCodePanelView, vsCodeBadge
} from "@vscode/webview-ui-toolkit";
import type { IDocumentationModifier, IDocumentationSnippet, IFieldtypeDocumentationOverview, IInjectedField } from "./documentation/types";

import FieldTypeIcon from './components/FieldTypeIcon.vue';
import DisplayProperty from './components/DisplayProperty.vue';
import CodeSnippet from './components/CodeSnippet.vue';
import InjectedFields from './components/InjectedFields.vue';
import ModifierDisplay from './components/ModifierDisplay.vue';

import Fuse from 'fuse.js';
import { toRaw, unref } from 'vue';
import { vscode } from './utilities/vscode';

provideVSCodeDesignSystem().register(
    vsCodeButton(), vsCodeTextField(), vsCodePanelTab(),
    vsCodePanels(), vsCodeDataGrid(), vsCodeDataGridCell(),
    vsCodeDataGridRow(), vsCodePanelView(), vsCodeBadge()
);

interface HelpGeneratorData {
    handle: string,
    currentFilter: string,
    docs: IFieldtypeDocumentationOverview | null
}

export default {
    components: {
        FieldTypeIcon,
        DisplayProperty,
        CodeSnippet,
        InjectedFields,
        ModifierDisplay,
        vscode
    },
    data() {
        return {
            handle: 'users_field',
            currentFilter: '',
            docs: null
        } as HelpGeneratorData;
    },
    computed: {
        displayHandle(): string {
            return '{{ ' + (this as any).docs.field.handle + ' }}';
        },
        displayInjectedFields(): IInjectedField[] {
            const currentContext = (this as any as HelpGeneratorData),
                searchText = currentContext.currentFilter;

            if (searchText.trim().length == 0) {
                return currentContext.docs?.injects ?? [];
            }

            const searchFields = currentContext.docs?.injects ?? [],
                search = new Fuse(searchFields, {
                    keys: ['name']
                });

            return search.search(searchText).map((item) => {
                return item.item;
            });
        },
        displayOverviewSnippets(): IDocumentationSnippet[] {
            const currentContext = (this as any as HelpGeneratorData),
                searchText = currentContext.currentFilter;

            if (searchText.trim().length == 0) {
                return currentContext.docs?.overviewSnippets ?? [];
            }

            const searchSnippets = currentContext.docs?.overviewSnippets ?? [],
                search = new Fuse(searchSnippets, {
                    keys: ['overview']
                });

            return search.search(searchText).map((item) => {
                return item.item;
            });
        },
        displayModifiers(): IDocumentationModifier[] {
            const currentContext = (this as any as HelpGeneratorData),
                searchText = currentContext.currentFilter;

            if (searchText.trim().length == 0) {
                return currentContext.docs?.modifiers ?? [];
            }

            const searchModifiers = currentContext.docs?.modifiers ?? [],
                search = new Fuse(searchModifiers, {
                    keys: ['name', 'description']
                });

            return search.search(searchText).map((item) => {
                return item.item;
            });
        }
    },
    methods: {
        syncFilter(e: any) {
            const curContext = (this as any);
            curContext.currentFilter = e.target.value as string;
        },
    },
    created() {
        const tWindow = window as any,
            toolboxData = tWindow['__toolboxHelpData'],
            setTarget = this as any;

        setTarget.docs = toolboxData as IFieldtypeDocumentationOverview;
        setTarget.handle = setTarget.docs.handle;
    }
}
</script>

<template>
  <main v-if="docs != null">
    <div class="antlers__toolbox-overview-info" style="margin: 0px;width: 100%;border-bottom: 1px solid;padding-bottom: 10px;">
        <div style="display: flex;align-items: center;justify-content: space-between;">
            <h1 style="font-size:1.2em;display: flex;align-items: center;">
                <field-type-icon :type="docs.handle" />
                <span style="font-family: monospace;">{{ displayHandle }}</span>
            </h1>
            <vscode-text-field @input="syncFilter" aria-label="Filter documentation" placeholder="Filter documentation">
                <span slot="start">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="16" width="16"><defs></defs><title>search</title><circle cx="8.5" cy="8.5" r="8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></circle><line x1="14.156" y1="14.156" x2="23.5" y2="23.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></line></svg>
                </span>
            </vscode-text-field>
        </div>
        
        <div style="display: flex; align-items: center; flex-direction: row;column-gap: 1em;margin-bottom: 5px;">
            <display-property v-for="property in docs.overviewProperties" :property="property"></display-property>
        </div>

        <p v-if="docs.officialDocumentation != null" style="margin:0;">Documentation: <a :href="docs.officialDocumentation">{{ docs.officialDocumentation }}</a></p>
    </div>

    <vscode-panels v-if="docs != null">
        <vscode-panel-tab id="antlerstoolbox_overviewsnippets">
            EXAMPLES <vscode-badge appearance="secondary">{{ displayOverviewSnippets.length }}</vscode-badge>
        </vscode-panel-tab>
        <vscode-panel-tab id="antlerstoolbox_fields" v-if="docs.injects.length > 0">
            PROVIDES FIELDS <vscode-badge appearance="secondary">{{ displayInjectedFields.length }}</vscode-badge>
        </vscode-panel-tab>
        <vscode-panel-tab id="antlerstoolbox_modifiers" v-if="docs.modifiers.length > 0">
            CORE MODIFIERS <vscode-badge appearance="secondary">{{ displayModifiers.length }}</vscode-badge>
        </vscode-panel-tab>

        <vscode-panel-view id="antlerstoolbox_overviewsnippets">
            <div style="display:flex;flex-direction: column;row-gap: 1em;width:100vw">
                <code-snippet v-for="snippet in displayOverviewSnippets" :snippet="snippet"></code-snippet>
            </div>
        </vscode-panel-view>

        <vscode-panel-view id="antlerstoolbox_fields" v-if="docs.injects.length > 0">
            <injected-fields :fields="displayInjectedFields"></injected-fields>
        </vscode-panel-view>

        <vscode-panel-view id="antlerstoolbox_modifiers" v-if="docs.modifiers.length > 0">
            <div style="display:flex;flex-direction: column;row-gap: 1em;width:100vw">
                <div v-if="docs.augmentsTo == 'builder'">
                    <p>Your field's configuration will augment to a query builder instance. In order to use modifiers on this field you will need to aliase your field with the <pre style="display:inline;">as</pre> modifier.</p>
                </div>

                <modifier-display v-for="modifier in displayModifiers" :modifier="modifier" :field="docs"></modifier-display>
            </div>
        </vscode-panel-view>
    </vscode-panels>
  </main>
</template>

<style>
main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    height: 100%;
}

main>* {
    margin: 1rem 0;
}
</style>
