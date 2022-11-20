<script lang="ts">
import type { IDocumentationSnippet } from '../documentation/types';

import { vscode } from './../utilities/vscode';

export default {
    props: {
        snippet: {
            type: Object() as () => IDocumentationSnippet,
            required: true
        }
    },
    computed: {
        lines(): string[] {
            return (this as any).snippet.snippet.replace(/\r?\n/g, "\n").split("\n");
        }
    },
    methods: {
        copySnippet() {
            navigator.clipboard.writeText((this as any).snippet.snippet).then(() => {
                vscode.postMessage({ type: 'message', text: 'Snippet copied to clipboard.' });
            }).catch(() => {
                vscode.postMessage({ type: 'error', text: 'The snippet could not be copied to the clipboard.' });
            });
        }
    }
}
</script>

<template>
    <div class="toolbox__snippet">
        <p>{{ snippet.overview }}</p>

        <div class="toolbox__snippet-container">
            <div class="toolbox__snippet-tools">
                <a @click="copySnippet" class="snippet__button" aria-label="Copy snippet to clipboard">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="16" width="16"><defs></defs><title>copy-paste</title><path d="M9.5,21.5h-8a1,1,0,0,1-1-1V4.5a1,1,0,0,1,1-1h2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M13.5,3.5h2a1,1,0,0,1,1,1V8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="8.5" cy="1.999" r="1.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></circle><path d="M9.915,2.5H12.5a1,1,0,0,1,1,1v1a1,1,0,0,1-1,1h-8a1,1,0,0,1-1-1v-1a1,1,0,0,1,1-1H7.085" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M22.5,22.5a1,1,0,0,1-1,1h-9a1,1,0,0,1-1-1V11a1,1,0,0,1,1-1h7.086a1,1,0,0,1,.707.293l1.914,1.914a1,1,0,0,1,.293.707Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><line x1="14.5" y1="14.499" x2="19.5" y2="14.499" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></line><line x1="14.5" y1="17.499" x2="19.5" y2="17.499" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></line></svg>
                    Copy to Clipboard
                </a>
            </div>
            
            <pre><code v-for="line in lines" style="display:block;">{{ line }}</code></pre>
        </div>
    </div>
</template>

<style>
.toolbox__snippet-tools {
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

.toolbox__snippet-container {
    border: 1px solid #5a5a5a;
    padding: 10px;
}

.toolbox__snippet pre {
    counter-reset: line;
    margin-top: 5px;
}

.toolbox__snippet code {
    counter-increment: line;
}

.toolbox__snippet code:before {
    content: counter(line);
    margin-right: 10px;
    border-right: 1px solid;
    padding-right: 5px;
    width: 4ch;
    display: inline-block;
    text-align: right;
}
</style>