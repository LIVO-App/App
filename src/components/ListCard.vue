<template>
  <ion-card>
    <ion-card-header color="primary" v-if="props.title != undefined && props.title != ''">
        <ion-card-title color="tertiary" class="ion-text-center">{{ props.title }}</ion-card-title>
        <ion-card-subtitle color="tertiary" class="ion-text-center">{{ props.subtitle }}</ion-card-subtitle>
    </ion-card-header>
    <ion-card-content style="overflow-y: auto;">
        <ion-list>
            <template v-if="Object.keys(props.cards).length === 0">
                <ion-item>
                    <ion-label class="ion-text-wrap ion-text-center">{{ props.emptiness_message }}</ion-label>
                </ion-item>
            </template>
            <template v-else-if="props.cards[''] != undefined">
                <template v-for="card in props.cards['']">
                    <item-card v-if="isGeneral(card)" :key="'card-general-' + card.id" :title="card.title" :subtitle="card.subtitle" :content="card.content" :url="card.url" />
                    <course-card v-else-if="isCourse(card)" @execute_link="$emit('execute_link')" :key="'card-course-' + card.id" :credits="card.credits" :content="card.content" :enrollment="card.enrollment" :url="card.url" />
                </template>
            </template>
            <template v-else>
                <ion-item-group v-for="(card_list, key) in props.cards" :key="'group-' + key">
                    <ion-item-divider color="light">
                        <ion-label class="ion-padding-end item-text-wrap">{{ getCompleteSchoolYear(typeof key === "string" ? parseInt(key) : key) }}</ion-label>
                    </ion-item-divider>
                    <template v-for="card in card_list">
                        <item-card v-if="isGeneral(card)" :key="'card-general-' + card.id" :title="card.title" :subtitle="card.subtitle" :content="card.content" :url="card.url" />
                        <course-card v-else-if="isCourse(card)" :key="'card-course-' + card.id" :credits="card.credits" :content="card.content" :enrollment="card.enrollment" :url="card.url" />
                    </template>
                </ion-item-group>
            </template>
        </ion-list>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard,IonCardHeader,IonCardTitle,IonCardSubtitle,IonCardContent,IonList,IonItemGroup,IonItemDivider,IonLabel,IonItem } from "@ionic/vue";
import { PropType } from "vue";
import { CardElements } from "../types";
import { getCompleteSchoolYear, isGeneral, isCourse } from "../utils";

const props = defineProps({
    "title": String,
    "subtitle": String,
    "emptiness_message": {
        type: String,
        required: true
    },
    "cards": {
        type: Object as PropType<{
            [key: string]: CardElements[]
        }>,
        required: true
    }
});
defineEmits(["execute_link"])
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