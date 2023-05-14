<template>
  <ion-card>
    <ion-card-header color="primary">
        <ion-card-title color="tertiary" class="ion-text-center">{{ props.title }}</ion-card-title>
        <ion-card-subtitle color="tertiary" class="ion-text-center">{{ props.subtitle }}</ion-card-subtitle>
    </ion-card-header>
    <ion-card-content style="overflow-y: auto;">
        <ion-list>
            <template v-if="Object.keys(props.cards).length === 0">
                <ion-item>
                    <ion-label class="ion-text-wrap ion-text-center">{{ elements[language].noCards }}</ion-label>
                </ion-item>
            </template>
            <template v-else-if="props.cards[''] != undefined">
                <item-card v-for="learning_block in props.cards['']" :key="'card-' + learning_block.id" :title="learning_block.title" :subtitle="learning_block.subtitle" :content="learning_block.content" :url="learning_block.url" />
            </template>
            <template v-else>
                <ion-item-group v-for="(learning_blocks, key) in props.cards" :key="'group-' + key">
                    <ion-item-divider color="light">
                        <ion-label class="ion-padding-end item-text-wrap">{{ getCompleteSchoolYear(typeof key === "string" ? parseInt(key) : key) }}</ion-label>
                    </ion-item-divider>
                    <item-card v-for="block in learning_blocks" :key="block.id" :title="block.title" :subtitle="block.subtitle" :content="block.content" :url="block.url" />
                </ion-item-group>
            </template>
        </ion-list>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard,IonCardHeader,IonCardTitle,IonCardSubtitle,IonCardContent,IonList,IonItemGroup,IonItemDivider,IonLabel,IonItem } from "@ionic/vue";
import { PropType } from "vue";
import { useStore } from "vuex";
import { BaseElement, CardElements, ElementsList, Language } from "../types";
import { getCompleteSchoolYear } from "../utils";

const store = useStore();

const language : Language = store.state.language;
const elements : ElementsList = store.state.elements;

const props = defineProps({
    "title": {
        type: String,
        required: true
    },
    "subtitle": String,
    "cards": {
        type: Object as PropType<{
            [key: string]: CardElements[]
        }>,
        required: true
    }
});
</script>


<style>
ion-card {
    border-radius: 20px;
    max-height: 100%;
    display: flex;
    flex-direction: column;
}
ion-card-content {
  max-height: 100%;
  position: relative;
  overflow: hidden;
  overflow-y: auto;
}
</style>