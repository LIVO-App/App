<template>
  <ion-grid :class="classes?.grid">
    <ion-row :class="classes?.row">
      <ion-col
        v-for="card in cards_list"
        :key="card.id"
        :size="'' + Math.trunc(12 / columns)"
        :class="classes?.col"
      >
        <card-item
          :card="card"
          :colors="colors"
          :classes="classes"
          @execute_link="$emit('execute_link')"
          @signal_event="$emit('signal_event')"
        />
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import {
  CardElements,
  CardsGridElements,
  Classes,
  Colors,
  GeneralCardSubElements,
} from "@/types";
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import { PropType } from "vue";

defineProps({
  cards_list: {
    type: Array<CardElements>,
    required: true,
  },
  columns: {
    type: Number,
    required: true,
  },
  colors: Object as PropType<Colors<GeneralCardSubElements>>,
  classes: Object as PropType<Classes<CardsGridElements>>,
});
defineEmits(["execute_link", "signal_event"]);
</script>

<style></style>
