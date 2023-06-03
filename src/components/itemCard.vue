<template>
    <ion-item lines="none">
        <ion-card color="tertiary" style="width: 100%;" :button="button" :href="button ? url : undefined">
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
    "url": String
});
const button = props.url != undefined && props.url != '';

</script>

<style>

</style>