<template>
    <ion-label v-if="element.type == 'string'">{{ element.content }}</ion-label>
    <div v-if="element.type == 'html'" v-html="element.content"></div>
    <ion-button v-if="element.type == 'icon'" fill="clear" @click="() => {
        store.state.request = {
            url: castSimpleUrlIcon(element.content).url,
            method: castSimpleUrlIcon(element.content).method,
        };
        $emit('execute_link');
    }">
        <ion-icon :ios="castSimpleUrlIcon(element.content).icon.ios" :md="castSimpleUrlIcon(element.content).icon.md"></ion-icon>
    </ion-button>
</template>

<script setup lang="ts">
import { SimpleUrlIcon,CustomElement } from "@/types";
import { IonButton, IonLabel, IonIcon } from "@ionic/vue";
import { PropType } from "vue";
import { useStore } from "vuex";

const castSimpleUrlIcon = (a: any) => (a as SimpleUrlIcon);

const store = useStore();
const props = defineProps({
    element: {
        type: Object as PropType<CustomElement>,
        required: true
    }
})

defineEmits(["execute_link"]);
</script>

<style>

</style>