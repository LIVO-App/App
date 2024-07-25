<template>
  <ion-grid :class="classes?.grid">
    <ion-row :class="classes?.row">
      <ion-col
        v-for="(card, i) in cards_list_ref"
        :key="card.id"
        :size="'' + Math.trunc(12 / columns)"
        :class="classes?.col"
      >
        <card-item
          :card="cards_list_ref[i]"
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
import { canCardArrayVModel } from "@/utils";
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import { PropType, WatchStopHandle, ref, watch } from "vue";

const addListeners = () => {
  watch(
    () => props.cards_list,
    (value) => {
      cards_list_ref.value = value;
    }
  );
  watch(
    () => cards_list_ref.value,
    (value) => {
      emit("update:cards_list", value);
    }
  );
};

const props = defineProps({
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
const emit = defineEmits(["execute_link", "signal_event", "update:cards_list"]);

const cards_list_ref = ref(props.cards_list);

let stopWatch: WatchStopHandle;

if (props.cards_list.length == 0) {
  stopWatch = watch(
    () => props.cards_list,
    (value) => {
      cards_list_ref.value = value;
      if (value.length > 0 && canCardArrayVModel(props.cards_list)) {
        addListeners();
        stopWatch();
      }
    }
  );
} else if (canCardArrayVModel(props.cards_list)) {
  addListeners();
}
</script>

<style></style>
