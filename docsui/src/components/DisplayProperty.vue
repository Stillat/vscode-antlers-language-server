<script lang="ts">
import type { IDocumentationProperty } from '../documentation/types';

export default {
    props: {
        property: {
            type: Object() as () => IDocumentationProperty,
            required: true
        }
    }
}
</script>

<template>
<div>
    <strong>{{ property.name }}</strong>: <span v-if="!property.mono">{{ property.value }}</span> <span v-if="property.mono" style="font-family: monospace;">{{ property.value }}</span>
</div>
</template>