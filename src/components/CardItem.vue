<template>
  <ion-item
    :lines="colors?.list_borders != undefined ? 'inset' : 'none'"
    :color="
      colors?.background?.type == 'var' ? colors?.background.name : undefined
    "
    :class="{
      ...classes?.item,
      background:
        colors?.background != undefined && colors?.background.type != 'var',
    }"
    class="ion-no-padding"
  >
    <course-card
      v-if="isCourse(card)"
      @execute_link="$emit('execute_link')"
      @signal_event="$emit('signal_event')"
      :content="card.content"
      :credits="card.credits"
      :enrollment="card.enrollment"
      :url="card.url"
      :method="card.method"
      :colors="card.colors"
    />
    <general-card
      v-else-if="isGeneral(card)"
      @execute_link="$emit('execute_link')"
      @signal_event="$emit('signal_event')"
      :id="card.id"
      :title="card.title != undefined ? card.title : undefined"
      :subtitle="card.subtitle != undefined ? card.subtitle : undefined"
      :content="card.content"
      :side_element="card.side_element"
      :selected="card.selected"
      :link="card.link"
      :colors="card.colors"
      :classes="card.classes"
    />
  </ion-item>
</template>

<script setup lang="ts">
import {
  CardElements,
  CardsCommonElements,
  Classes,
  Colors,
  GeneralCardSubElements,
} from "@/types";
import { isCourse, isGeneral } from "@/utils";
import { IonItem } from "@ionic/vue";
import { PropType } from "vue";

defineProps({
  card: {
    type: Object as PropType<CardElements>,
    required: true,
  },
  colors: Object as PropType<Colors<GeneralCardSubElements>>,
    classes: Object as PropType<Classes<CardsCommonElements>>,
});
defineEmits(["execute_link", "signal_event"]);
</script>

<style>
</style>