<template>
  <ion-item
    :lines="colors?.list_borders != undefined ? 'inset' : 'none'"
    :color="!local_hovered ? getIonicColor(colors?.background) : undefined"
    :class="{
      ...classes?.item,
      background:
        !local_hovered &&
        colors?.background != undefined &&
        getIonicColor(colors?.background) == undefined,
      hovered: local_hovered,
    }"
    class="ion-no-padding"
    @mouseenter="
      if (props.colors?.hover != undefined) {
        local_hovered = true;
        hoverItem(card, true);
      }
    "
    @mouseleave="
      if (props.colors?.hover != undefined) {
        local_hovered = false;
        hoverItem(card, false);
      }
    "
  >
    <course-card
      v-if="isCourse(card)"
      @execute_link="$emit('execute_link')"
      @signal_event="$emit('signal_event')"
      :content="card.content"
      :credits="card.credits"
      :enrollment="card.enrollment"
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
      :hovered="local_hovered"
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
import { hoverItem } from "@/utils";
import { getCssColor, getIonicColor, isCourse, isGeneral } from "@/utils";
import { IonItem } from "@ionic/vue";
import { PropType, ref } from "vue";

const props = defineProps({
  card: {
    type: Object as PropType<CardElements>,
    required: true,
  },
  colors: Object as PropType<Colors<GeneralCardSubElements>>,
  classes: Object as PropType<Classes<CardsCommonElements>>,
});
defineEmits(["execute_link", "signal_event"]);

const local_hovered = ref(false); // Dummy variable to keep track of reactivity, since it seems not possible to catch props.class.hovered changes
const css_hover_color =
  props.colors?.hover != undefined
    ? getCssColor(props.colors.hover)
    : undefined;
const css_background_color =
  props.colors?.background != undefined
    ? getCssColor(props.colors.background)
    : undefined; //<!-- TODO (6): valutare colore separato per ion-item
</script>

<style scoped>
ion-item {
  --padding-end: 0px;
  --inner-padding-end: 0px;
}
.hovered {
  cursor: "pointer";
  --background: v-bind("css_hover_color");
}
.background {
  background-color: v-bind("css_background_color");
}
</style>
