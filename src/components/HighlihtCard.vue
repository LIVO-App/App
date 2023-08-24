<template>
  <ion-item lines="none">
    <ion-card
      :color="selected ? 'primary' : 'tertiary'"
      style="width: 100%"
      :button="true"
      @click="
        () => {
          store.state.event = {
            name: 'change_selection',
            data: {
              id: id,
            },
          };
          $emit('signal_event');
        }
      "
    >
      <ion-card-header>
        <ion-grid style="width: 100%">
          <ion-row class="ion-align-items-center">
            <ion-col>
              <ion-card-title :color="selected ? 'tertiary' : undefined">{{
                title
              }}</ion-card-title>
              <ion-card-subtitle
                v-if="subtitle != undefined"
                :color="selected ? 'tertiary' : undefined"
                >{{ subtitle }}</ion-card-subtitle
              >
            </ion-col>
            <ion-col v-if="status != undefined" size="auto">
              <ion-label
                :color="
                  status == LearningSessionStatus.CURRENT
                    ? 'success'
                    : status == LearningSessionStatus.UPCOMING
                    ? 'medium'
                    : ''
                "
              >
                {{ status_string }}
              </ion-label>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-card-header>
    </ion-card>
  </ion-item>
</template>

<script setup lang="ts">
import { LearningSessionStatus } from "@/types";
import { getCurrentElement } from "@/utils";
import {
  IonItem,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
} from "@ionic/vue";
import { PropType } from "vue";
import { useStore } from "vuex";

const store = useStore();
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: String,
  status: Number as PropType<LearningSessionStatus>,
  selected: {
    type: Boolean,
    required: true,
  },
});
defineEmits(["signal_event"]);

const status_string: string =
  props.status == LearningSessionStatus.CURRENT
    ? getCurrentElement(store, "current")
    : props.status == LearningSessionStatus.UPCOMING
    ? getCurrentElement(store, "upcomoing")
    : "";
</script>

<style>
</style>