<template>
  <template v-if="element.linkType == undefined || element.type == 'html'">
    <ion-label
      v-if="element.type == 'string'"
      :color="element.color != undefined ? element.color.name : undefined"
      :class="actual_class"
      >{{ element.content }}</ion-label
    >
    <div
      v-if="element.type == 'html'"
      v-html="element.content"
      :class="{
        textColor: element.color != undefined,
      }"
    ></div>
    <ion-icon
      v-else-if="element.type == 'icon'"
      :ios="castIconAlternatives(element.content).ios"
      :md="castIconAlternatives(element.content).md"
      :class="actual_class"
    ></ion-icon>
    <!-- Da sistemare: mettere il colore alle icone -->
    <ion-label
      v-else-if="element.type == 'title'"
      :color="element.color != undefined ? element.color.name : undefined"
      :class="actual_class"
      ><h2>{{ element.content }}</h2></ion-label
    >
  </template>
  <template v-else>
    <ion-button
      v-if="element.type == 'icon'"
      :disabled="disabled"
      fill="clear"
      @click="
        () => {
          if (element.linkType == 'request') {
            store.state.request = {
              url: castRequestIcon(element.content).url,
              method: castRequestIcon(element.content).method,
            };
            $emit('execute_link');
          } else if (element.linkType == 'event') {
            store.state.event = {
              name: castEventIcon(props.element.content).event,
              data: castEventIcon(props.element.content).data,
            };
            $emit('signal_event');
          }
        }
      "
      :class="actual_class"
    >
      <ion-icon
        :ios="castRequestIcon(element.content).icon.ios"
        :md="castRequestIcon(element.content).icon.md"
      ></ion-icon>
    </ion-button>
    <ion-label
      v-else-if="element.type == 'string'"
      :color="element.color != undefined ? element.color.name : undefined"
      @click="
        () => {
          if (!disabled && element.linkType == 'request') {
            store.state.request = {
              url: castRequestString(element.content).url,
              method: castRequestString(element.content).method,
            };
            $emit('execute_link');
          } else if (!disabled && element.linkType == 'event') {
            store.state.event = {
              name: castEventString(props.element.content).event,
              data: castEventString(props.element.content).data,
            };
            $emit('signal_event');
          }
        }
      "
      :class="actual_class"
    >
      {{ castEventString(element.content).text }}
    </ion-label>
    <template v-else-if="element.type == 'string_icon'">
      <ion-label
        :color="element.color != undefined ? element.color.name : undefined"
        :class="actual_class"
      >
        {{ castEventStringIcon(element.content).text }}
      </ion-label>
      <ion-button
        v-if="element.type == 'string_icon'"
        :disabled="disabled"
        fill="clear"
        @click="
          () => {
            if (element.linkType == 'request') {
              store.state.request = {
                url: castRequestStringIcon(element.content).url,
                method: castRequestStringIcon(element.content).method,
              };
              $emit('execute_link');
            } else if (element.linkType == 'event') {
              store.state.event = {
                name: castEventStringIcon(props.element.content).event,
                data: castEventStringIcon(props.element.content).data,
              };
              $emit('signal_event');
            }
          }
        "
        :class="actual_class"
      >
        <ion-icon
          :ios="castRequestIcon(element.content).icon.ios"
          :md="castRequestIcon(element.content).icon.md"
        ></ion-icon>
      </ion-button>
    </template>
  </template>
</template>

<script setup lang="ts">
import {
  RequestIcon,
  CustomElement,
  EventString,
  EventIcon,
  IconAlternatives,
  RequestString,
  RequestStringIcon,
  EventStringIcon,
} from "@/types";
import { IonButton, IonLabel, IonIcon } from "@ionic/vue";
import { PropType } from "vue";
import { useStore } from "vuex";

const castIconAlternatives = (a: any) => a as IconAlternatives;
const castRequestIcon = (a: any) => a as RequestIcon;
const castEventIcon = (a: any) => a as EventIcon;
const castRequestString = (a: any) => a as RequestString;
const castEventString = (a: any) => a as EventString;
const castRequestStringIcon = (a: any) => a as RequestStringIcon;
const castEventStringIcon = (a: any) => a as EventStringIcon;

const store = useStore();
const props = defineProps({
  element: {
    type: Object as PropType<CustomElement>,
    required: true,
  },
  class: String, // Da sistemare: mettere anche oggetto e vedere come sistemare oggetti multipli
  disabled: Boolean, // Da sistemare: aggiornare posti dove viene usato
});
defineEmits(["execute_link", "signal_event"]);

const actual_class = props.class ?? "";
const color =
  props.element.color != undefined
    ? getComputedStyle(document.documentElement).getPropertyValue(
        "--ion-color-" + props.element.color.name
      )
    : undefined; // Da sistemare: differenziare con type
/*const color: string =
  props.element.color != undefined
    ? props.element.color.type == "var"
      ? getComputedStyle(document.documentElement).getPropertyValue(
          props.element.color.name
        )
      : props.element.color.name
    : "";*/
</script>

<style scoped>
.textColor {
  color: v-bind("color");
}
</style>