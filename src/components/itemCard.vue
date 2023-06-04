<template>
    <ion-item lines="none">
        <ion-card color="tertiary" style="width: 100%;" :button="button" :href="button && isGet ? url : undefined" @click="() => {
                if (button && !isGet) { //Vedere se funziona
                    store.state.request = {
                        url: url,
                        method: method,
                    };
                    $emit('execute_link');
                }
            }">
            <ion-card-header v-if="title != undefined && subtitle != undefined">
                <ion-card-title v-if="title != undefined">{{ title }}</ion-card-title>
                <ion-card-subtitle v-if="subtitle != undefined">{{ subtitle }}</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
                <ionic-element v-for="element in content" :key="element.id" :element="element"></ionic-element>
            </ion-card-content>
        </ion-card>
    </ion-item>
</template>

<script setup lang="ts">
import { CustomElement } from "@/types";
import { IonItem,IonCard,IonCardHeader,IonCardTitle,IonCardSubtitle,IonCardContent } from "@ionic/vue";
import { Method } from "axios";
import { PropType } from "vue";
import { useStore } from "vuex";

const store = useStore();

const props = defineProps({
    "title": {
        type: String,
        required: true
    },
    "subtitle": String,
    "content": {
        type: Array<CustomElement>,
        required: true
    },
    "url": String,
    "method": String as PropType<Method>
});
defineEmits(["execute_link"]);
const button = props.url != undefined && props.url != "";
const isGet = button && props.method == "get";
</script>

<style>

</style>