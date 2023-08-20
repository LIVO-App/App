<template>
  <ion-item lines="none">
    <!-- Da sistemare: spostare item in ListCard -->
    <ion-card
      color="tertiary"
      style="width: 100%"
      :button="button"
      :href="button && isGet ? url : undefined"
      @click="
        () => {
          if (button && !isGet) {
            store.state.request = {
              url: url,
              method: method,
            };
            $emit('execute_link');
          }
        }
      "
    >
      <ion-card-header v-if="title != undefined || subtitle != undefined">
        <ion-card-title v-if="title != undefined">{{ title }}</ion-card-title>
        <ion-card-subtitle v-if="subtitle != undefined">{{
          subtitle
        }}</ion-card-subtitle>
      </ion-card-header>
      <ion-card-content>
        <ion-grid v-if="side_element != undefined">
          <ion-row>
            <ion-col>
              <ionic-element
                v-for="element in content"
                :key="element.id"
                :element="element"
                @execute_link="$emit('execute_link')"
                @signal_event="$emit('signal_event')"
              />
            </ion-col>
            <ion-col
              size="auto"
              style="border-left: 1px solid var(--ion-color-dark)"
            >
              <ionic-element
                :element="side_element"
                @execute_link="$emit('execute_link')"
                @signal_event="$emit('signal_event')"
              />
            </ion-col>
          </ion-row>
        </ion-grid>
        <template v-else>
          <ionic-element
            v-for="element in content"
            :key="element.id"
            :element="element"
            @execute_link="$emit('execute_link')"
            @signal_event="$emit('signal_event')"
          />
        </template>
      </ion-card-content>
    </ion-card>
  </ion-item>
</template>

<script setup lang="ts">
import { CustomElement } from "@/types";
import {
  IonItem,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/vue";
import { Method } from "axios";
import { PropType } from "vue";
import { useStore } from "vuex";

const store = useStore();

const props = defineProps({
  title: String,
  subtitle: String,
  content: {
    type: Array<CustomElement>,
    required: true,
  },
  side_element: Object as PropType<CustomElement>,
  url: String,
  method: String as PropType<Method>,
});
defineEmits(["execute_link", "signal_event"]);
const button = props.url != undefined && props.url != "";
const isGet = button && props.method == "get";
</script>

<style>
</style>