<template>
  <ion-item-divider
    :color="
      (colors?.dividers?.type == 'var' ? colors?.dividers.name : undefined) ??
      'light'
    "
    :class="{
      ...classes?.divider,
      background:
        colors?.dividers != undefined && colors.dividers.type != 'var',
    }"
  >
    <ionic-element :element="divider" />
  </ion-item-divider>
  <ion-item
    v-if="cards_list.length === 0"
    :color="
      colors?.background?.type == 'var' ? colors?.background.name : undefined
    "
    :class="{
      background:
        colors?.background != undefined && colors?.background?.type != 'var',
    }"
    class="ion-no-padding"
  >
    <ionic-element :element="emptiness_message" />
  </ion-item>
  <template v-else>
    <card-item
      v-for="card in cards_list"
      :key="card.id"
      :card="card"
      :colors="colors"
      :classes="classes"
      @execute_link="$emit('execute_link')"
      @signal_event="$emit('signal_event')"
    />
  </template>
</template>

<script setup lang="ts">
import {
  CardElements,
  CardsCommonElements,
  Classes,
  Colors,
  CustomElement,
  GeneralCardSubElements,
} from "@/types";
import { IonItemDivider, IonItem } from "@ionic/vue";
import { PropType } from "vue";

defineProps({
  emptiness_message: {
    type: Object as PropType<CustomElement>,
    required: true,
  },
  divider: {
    type: Object as PropType<CustomElement>,
    required: true,
  },
  cards_list: {
    type: Array<CardElements>,
    required: true,
  },
  colors: Object as PropType<Colors<GeneralCardSubElements>>,
  classes: Object as PropType<Classes<CardsCommonElements>>,
});
defineEmits(["execute_link", "signal_event"]);
</script>

<style></style>
