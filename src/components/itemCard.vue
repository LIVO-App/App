<template>
    <ion-item lines="none">
        <ion-card color="tertiary" style="width: 100%;" :button="button" :href="button ? url : undefined">
            <ion-card-header>
                <ion-card-title>{{ props.title }}</ion-card-title>
                <ion-card-subtitle>{{ props.subtitle }}</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
                <div v-html="props.content"></div>
            </ion-card-content>
        </ion-card>
    </ion-item>
</template>

<script setup lang="ts">
import { IonItem,IonCard,IonCardHeader,IonCardTitle,IonCardSubtitle,IonCardContent } from "@ionic/vue";

const props = defineProps({
    "title": {
        type: String,
        required: true
    },
    "subtitle": String,
    "content": {
        type: String,
        required: true
    },
    "url": String
});
const button = props.url != undefined && props.url != '';

</script>

<style>

</style>