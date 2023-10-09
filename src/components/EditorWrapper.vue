<template>
    <quill-editor :disabled="disabled" :options="options" :value="value" :class="classes?.editor"
        @change="($event: any) => $emit('update:value', $event.html)" />
</template>

<script setup lang="ts">
import { Classes, EditorSubElements } from "@/types";
import { PropType } from "vue";

defineProps({
    value: {
        type: String,
        required: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    options: {
        type: Object,
        default: () => ({
            modules: {
                toolbar: [
                    ["bold", "italic", "underline", "strike"],
                    //["blockquote", "code-block"],
                    [{ header: 1 }, { header: 2 }],
                    [{ list: "ordered" }, { list: "bullet" }],
                    /*[{ script: "sub" }, { script: "super" }],
                    [{ indent: "-1" }, { indent: "+1" }],
                    [{ direction: "rtl" }],
                    [{ size: ["small", false, "large", "huge"] }],
                    [{ header: [1, 2, 3, 4, 5, 6, false] }],
                    [{ color: [] }, { background: [] }],
                    [{ font: [] }],
                    [{ align: [] }],*/
                    ["clean"],
                ],
            },
            placeholder: false,
            theme: "snow",
        }),
    },
    classes: Object as PropType<Classes<EditorSubElements>>,
});
defineEmits(["update:value"]);
</script>

<style></style>