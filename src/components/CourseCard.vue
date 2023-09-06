<template>
  <ion-card
    style="width: 100%"
    :class="{
      no_card_border: colors?.borders == undefined,
    }"
    class="ion-no-padding ion-no-margin"
  >
    <ion-card-content>
      <ion-grid>
        <ion-row class="ion-align-items-center">
          <ion-col size="auto">
            <ionic-element
              :element="content[0]"
              :classes="{
                label: {
                  'ion-padding': true,
                  radius: true,
                },
              }"
            />
          </ion-col>
          <ion-col>
            <ionic-element
              :element="content[1]"
              @signal_event="$emit('signal_event')"
            />
          </ion-col>
          <ion-col size="auto">
            <ionic-element
              :element="content[2]"
              :classes="{
                label: {
                  'ion-padding': true,
                  half_radius: true,
                },
              }"
            />
          </ion-col>
          <ion-col v-if="button" size="auto">
            <ionic-element
              :element="content[3]"
              @execute_link="$emit('execute_link')"
            />
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { CustomElement, SubElementsColors } from "@/types";
import { Enrollment } from "@/types";
import {
  IonItem,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
} from "@ionic/vue";
import { PropType } from "vue";

const props = defineProps({
  credits: {
    type: Number,
    required: true,
  },
  content: {
    type: Array as PropType<CustomElement[]>,
    required: true,
  },
  enrollment: {
    type: Object as PropType<Enrollment>,
    required: true,
  },
  colors: Object as PropType<SubElementsColors>,
});
defineEmits(["execute_link", "signal_event"]);
const button = props.enrollment.editable && props.content.length > 3;
</script>

<style>
.radius {
  border-radius: 10px;
}
.half_radius {
  border-radius: 5px;
}
</style>