<template>
  <template v-if="element.linkType == undefined || element.type == 'html'">
    <ion-label
      v-if="element.type == 'string'"
      :color="
        element.colors?.text != undefined ? element.colors.text.name : undefined
      "
      :class="classes.label"
      >{{ element.content }}</ion-label
    >
    <div
      v-if="element.type == 'html'"
      v-html="element.content"
      :class="classes.html"
    ></div>
    <ion-icon
      v-else-if="element.type == 'icon'"
      :ios="castIconAlternatives(element.content).ios"
      :md="castIconAlternatives(element.content).md"
      :color="
        element.colors?.text != undefined ? element.colors.text.name : undefined
      "
      :class="classes.icon"
    ></ion-icon>
    <!-- Da sistemare: mettere il colore alle icone -->
    <ion-label
      v-else-if="element.type == 'title'"
      :color="
        element.colors?.text != undefined ? element.colors.text.name : undefined
      "
      :class="classes.label"
      ><h2>
        <b>{{ element.content }}</b>
      </h2></ion-label
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
      :class="classes.button"
    >
      <ion-icon
        :ios="castRequestIcon(element.content).icon.ios"
        :md="castRequestIcon(element.content).icon.md"
        :color="
          element.colors?.text != undefined
            ? element.colors.text.name
            : undefined
        "
        :class="classes.icon"
      ></ion-icon>
    </ion-button>
    <ion-label
      v-else-if="element.type == 'string'"
      :color="
        element.colors?.text != undefined ? element.colors.text.name : undefined
      "
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
      :class="classes.label"
    >
      {{ castEventString(element.content).text }}
    </ion-label>
    <template v-else-if="element.type == 'string_icon'">
      <ion-label
        :color="
          element.colors?.text != undefined
            ? element.colors.text.name
            : undefined
        "
        :class="classes.label"
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
        :class="classes.button"
      >
        <ion-icon
          :ios="castRequestIcon(element.content).icon.ios"
          :md="castRequestIcon(element.content).icon.md"
          :class="classes.icon"
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
  SubElementsClasses,
} from "@/types";
import { getVariableName } from "@/utils";
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
  classes: Object as PropType<SubElementsClasses>,
  disabled: Boolean, // Da sistemare: aggiornare posti dove viene usato
});
defineEmits(["execute_link", "signal_event"]);

const text_color =
  props.element.colors?.text != undefined
    ? props.element.colors.text.type == "var"
      ? getVariableName(props.element.colors.text.name)
      : props.element.colors.text.name
    : undefined;
const background_color =
  props.element.colors?.background != undefined
    ? props.element.colors.background.type == "var"
      ? getVariableName(props.element.colors.background.name)
      : props.element.colors.background.name
    : undefined;
const classes: SubElementsClasses = {
  label: {
    ...props.classes?.label,
    textColor: props.element.colors?.text != undefined,
    backgroundColor: background_color != undefined,
  },
  html: {
    ...props.classes?.html,
    textColor: props.element.colors?.text != undefined,
    backgroundColor: background_color != undefined,
  },
  icon: {
    ...props.classes?.icon,
    textColor: props.element.colors?.text != undefined,
    backgroundColor: background_color != undefined,
  },
  button: {
    ...props.classes?.button,
    //textColor: props.element.colors?.text != undefined,
    backgroundColor: background_color != undefined,
  },
};
</script>

<style scoped>
.textColor {
  color: v-bind("text_color");
}
.backgroundColor {
  background-color: v-bind("background_color");
}
</style>