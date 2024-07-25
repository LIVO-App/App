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
      v-else-if="isGeneral(card_ref)"
      @execute_link="$emit('execute_link')"
      @signal_event="$emit('signal_event')"
      :id="card_ref.id"
      v-model:title="card_ref.title"
      v-model:subtitle="card_ref.subtitle"
      v-model:content="card_ref.content"
      v-model:side_element="card_ref.side_element"
      :selected="card_ref.selected"
      :hovered="local_hovered"
      :link="card_ref.link"
      :colors="card_ref.colors"
      :classes="card_ref.classes"
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
import { canCardVModel, hoverItem } from "@/utils";
import { getCssColor, getIonicColor, isCourse, isGeneral } from "@/utils";
import { IonItem } from "@ionic/vue";
import { PropType, ref, watch } from "vue";

const props = defineProps({
  card: {
    type: Object as PropType<CardElements>,
    required: true,
  },
  colors: Object as PropType<Colors<GeneralCardSubElements>>,
  classes: Object as PropType<Classes<CardsCommonElements>>,
});
const emit = defineEmits(["execute_link", "signal_event", "update:card"]);

const local_hovered = ref(false); // Dummy variable to keep track of reactivity, since it seems not possible to catch props.class.hovered changes
const css_hover_color =
  props.colors?.hover != undefined
    ? getCssColor(props.colors.hover)
    : undefined;
const css_background_color =
  props.colors?.background != undefined
    ? getCssColor(props.colors.background)
    : undefined; //<!-- TODO (6): valutare colore separato per ion-item

const card_ref = ref(props.card);

if (isGeneral(props.card) && canCardVModel(props.card)) {
  watch(
    () => props.card,
    (value) => {
      card_ref.value = value;
    }
  );
  watch(
    () => card_ref.value,
    (value) => {
      emit("update:card", value);
    }
  );
}
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
