<template>
  <ion-card
    :color="selected ? 'primary' : 'tertiary'"
    style="width: 100%"
    :button="link != undefined"
    :href="
      link != undefined && isRequest(link) && isGet ? link.url : undefined
    "
    @click="
      () => {
        if (link != undefined) {
          if (isEvent(link)) {
            store.state.event =
              selected != undefined
                ? {
                    name: 'change_selection',
                    data: {
                      id: id,
                    },
                  }
                : {
                    name: link.event,
                    data: link.data,
                  };
            $emit('signal_event');
          } else if (!isGet) {
            store.state.request = {
              url: link.url,
              method: link.method,
            };
            $emit('execute_link');
          }
        }
      }
    "
  >
    <ion-card-header v-if="title != undefined || subtitle != undefined" class="ion-no-padding">
      <ion-grid class="ion-no-margin">
        <ion-row class="ion-align-items-center">
          <ion-col size="4">
            <ion-card-title v-if="title != undefined">{{
              title
            }}</ion-card-title>
          </ion-col>
          <ion-col size="5">
            <ion-card-subtitle v-if="subtitle != undefined">{{
              subtitle
            }}</ion-card-subtitle>
          </ion-col>
          <ion-col size="1"></ion-col>
          <ion-col size="2">
            <ionic-element
              v-if="content == undefined && side_element != undefined"
              :element="side_element"
              @execute_link="$emit('execute_link')"
              @signal_event="$emit('signal_event')"
            />
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-card-header>
    <ion-card-content v-if="content != undefined">
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
</template>

<script setup lang="ts">
import { CustomElement, LinkParameters } from "@/types";
import { isRequest, isEvent } from "@/utils";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/vue";
import { PropType } from "vue";
import { useStore } from "vuex";

const store = useStore();

const props = defineProps({
  id: {
    type: String || Number,
    required: true,
  },
  title: String,
  subtitle: String,
  content: Array<CustomElement>,
  side_element: Object as PropType<CustomElement>,
  selected: Boolean,
  link: Object as PropType<LinkParameters>,
});
defineEmits(["execute_link", "signal_event"]);
const isGet =
  props.link != undefined &&
  isRequest(props.link) &&
  props.link.method == "get";
</script>

<style>
</style>