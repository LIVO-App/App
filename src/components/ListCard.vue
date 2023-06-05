<template>
  <ion-card>
    <ion-card-header color="primary" v-if="props.title != undefined && props.title != ''">
        <ion-card-title color="tertiary" class="ion-text-center">{{ props.title }}</ion-card-title>
        <ion-card-subtitle color="tertiary" class="ion-text-center">{{ props.subtitle }}</ion-card-subtitle>
    </ion-card-header>
    <ion-card-content style="overflow-y: auto;">
        <ion-list>
            <template v-if="Object.keys(props.cards_list.cards).length === 0">
                <ion-item>
                    <ion-label class="ion-text-wrap ion-text-center">{{ props.emptiness_message }}</ion-label>
                </ion-item>
            </template>
            <template v-else-if="props.cards_list.cards[''] != undefined">
                <ion-item v-if="props.cards_list.cards[''].length === 0">
                    <ion-label class="ion-text-wrap ion-text-center">{{ props.emptiness_message }}</ion-label>
                </ion-item>
                <template v-else>
                    <template v-for="card in props.cards_list.cards['']">
                        <item-card v-if="isGeneral(card)" @execute_link="$emit('execute_link')" @signal_event="$emit('signal_event')" :key="'card-general-' + card.id" :title="card.title" :subtitle="card.subtitle" :content="card.content" :url="card.url" :method="card.method" />
                        <course-card v-else-if="isCourse(card)" @execute_link="$emit('execute_link')" :key="'card-course-' + card.id" :credits="card.credits" :content="card.content" :enrollment="card.enrollment" :url="card.url" :method="card.method" />
                    </template>
                </template>
            </template>
            <template v-else>
                <ion-item-group v-for="ordered_cards in props.cards_list.order" :key="'group-' + ordered_cards.key">
                    <ion-item-divider color="light">
                        <ion-label class="ion-padding-end item-text-wrap">{{ ordered_cards.title }}</ion-label>
                    </ion-item-divider>
                    <ion-item v-if="props.cards_list.cards[ordered_cards.key].length === 0">
                        <ion-label class="ion-text-wrap ion-text-center">{{ props.emptiness_message }}</ion-label>
                    </ion-item>
                    <template v-else>
                        <template v-for="card in props.cards_list.cards[ordered_cards.key]">
                            <item-card v-if="isGeneral(card)" @execute_link="$emit('execute_link')" @signal_event="$emit('signal_event')" :key="'card-general-' + card.id" :title="card.title" :subtitle="card.subtitle" :content="card.content" :url="card.url" :method="card.method" />
                            <course-card v-else-if="isCourse(card)" :key="'card-course-' + card.id" :credits="card.credits" :content="card.content" :enrollment="card.enrollment" :url="card.url" :method="card.method" />
                        </template>
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
import { OrderedCardsList } from "../types";
import { isGeneral, isCourse } from "../utils";

const props = defineProps({
    "title": String,
    "subtitle": String,
    "emptiness_message": {
        type: String,
        required: true
    },
    "cards_list": {
        type: Object as PropType<OrderedCardsList>,
        required: true
    }
});
defineEmits(["execute_link","signal_event"]);
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