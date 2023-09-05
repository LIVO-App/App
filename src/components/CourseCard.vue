<template>
  <ion-item lines="none">
    <ion-card style="width: 100%">
      <ion-card-content>
        <ion-grid>
          <ion-row class="ion-align-items-center">
            <ion-col size="auto">
              <ionic-element
                :element="content[0]"
                :classes="{
                  label: {
                    'ion-padding': true,
                    'radius': true,
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
                    'radius': true,
                  },
                }"
              />
            </ion-col>
            <ion-col v-if="button" size="auto">
              <ionic-element
                :element="content[3]"
                @execute_link="$emit('execute_link')"
                :classes="{
                  button: {
                    'ion-padding': true,
                    'radius': true,
                  },
                }"
              />
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-card-content>
    </ion-card>
  </ion-item>
</template>

<script setup lang="ts">
import { CustomElement } from "@/types";
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
});
defineEmits(["execute_link", "signal_event"]);
const button = props.enrollment.editable && props.content.length > 3;
</script>

<style>
.radius {
  border-radius: 10px;
}
</style>