<template>
  <template v-if="element.linkType == undefined || element.type == 'html'">
    <ion-label
      v-if="element.type == 'string'"
      :color="
        element.colors?.text != undefined ? element.colors.text.name : undefined
      "
      :class="actual_classes.label"
      >{{ element.content }}</ion-label
    >
    <div
      v-if="element.type == 'html'"
      v-html="element.content"
      :class="actual_classes.html"
    ></div>
    <ion-icon
      v-else-if="element.type == 'icon'"
      :ios="castIconAlternatives(element.content).ios"
      :md="castIconAlternatives(element.content).md"
      :color="
        element.colors?.text != undefined ? element.colors.text.name : undefined
      "
      :class="actual_classes.icon"
    />
    <!-- Da sistemare: mettere il colore alle icone -->
    <ion-label
      v-else-if="element.type == 'title'"
      :color="
        element.colors?.text != undefined ? element.colors.text.name : undefined
      "
      :class="actual_classes.label"
      ><!--<h2>-->
      <!-- Da sistemare: ingrandire titolo -->
      <b>{{ element.content }}</b>
      <!--</h2>--></ion-label
    >
    <ion-item
      v-else-if="element.type == 'string_icon'"
      :lines="element.colors?.borders != undefined ? 'inset' : 'none'"
      :color="
        element.colors?.background != undefined
          ? element.colors.background.name
          : undefined
      "
      :class="actual_classes.item"
    >
      <template v-if="!castStringIcon(element.content).order">
        <ion-label
          :color="
            element.colors?.text != undefined
              ? element.colors.text.name
              : undefined
          "
          :class="actual_classes.label"
        >
          {{ castStringIcon(element.content).text }}
        </ion-label>
        <ion-icon
          :ios="castStringIcon(element.content).icon.ios"
          :md="castStringIcon(element.content).icon.md"
          :color="
            element.colors?.text != undefined
              ? element.colors.text.name
              : undefined
          "
          :class="actual_classes.icon"
        />
      </template>
      <template v-else>
        <ion-icon
          :ios="castStringIcon(element.content).icon.ios"
          :md="castStringIcon(element.content).icon.md"
          :color="
            element.colors?.text != undefined
              ? element.colors.text.name
              : undefined
          "
          :class="{
            'ion-padding-end': true,
            ...actual_classes.icon,
          }"
        />
        <ion-label
          :color="
            element.colors?.text != undefined
              ? element.colors.text.name
              : undefined
          "
          :class="actual_classes.label"
        >
          {{ castStringIcon(element.content).text }}
        </ion-label>
      </template>
    </ion-item>
  </template>
  <template v-else>
    <ion-label
      v-if="element.type == 'string'"
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
      :class="actual_classes.label"
    >
      {{ castEventString(element.content).text }}
    </ion-label>
    <ion-button
      v-else-if="
        element.type == 'icon' ||
        (element.type == 'string_icon' &&
          castEventStringIcon(element.content).whole_link)
      "
      :disabled="disabled"
      fill="clear"
      @click="
        () => {
          if (element.linkType == 'request') {
            store.state.request = {
              url: (element.type == 'icon'
                ? castRequestIcon(element.content)
                : castRequestStringIcon(element.content)
              ).url,
              method: (element.type == 'icon'
                ? castRequestIcon(element.content)
                : castRequestStringIcon(element.content)
              ).method,
            };
            $emit('execute_link');
          } else if (element.linkType == 'event') {
            store.state.event = {
              name: (element.type == 'icon'
                ? castEventIcon(element.content)
                : castEventStringIcon(element.content)
              ).event,
              data: (element.type == 'icon'
                ? castEventIcon(element.content)
                : castEventStringIcon(element.content)
              ).data,
            };
            $emit('signal_event');
          }
        }
      "
      :class="actual_classes.button"
    >
      <ion-label
        v-if="
          element.type == 'string_icon' &&
          (castStringIcon(element.content).order == undefined ||
            !castStringIcon(element.content).order)
        "
        :color="
          element.colors?.text != undefined
            ? element.colors.text.name
            : undefined
        "
        :class="actual_classes.label"
        class="ion-padding-end"
      >
        {{ castStringIcon(element.content).text }}
      </ion-label>
      <ion-icon
        :ios="
          (element.type == 'icon'
            ? castEventIcon(element.content)
            : castEventStringIcon(element.content)
          ).icon.ios
        "
        :md="
          (element.type == 'icon'
            ? castEventIcon(element.content)
            : castEventStringIcon(element.content)
          ).icon.md
        "
        :color="
          element.colors?.text != undefined
            ? element.colors.text.name
            : undefined
        "
        :class="actual_classes.icon"
      />
      <ion-label
        v-if="element.type == 'string_icon' && castStringIcon(element.content).order"
        :color="
          element.colors?.text != undefined
            ? element.colors.text.name
            : undefined
        "
        :class="actual_classes.label"
        class="ion-padding-start"
      >
        {{ castStringIcon(element.content).text }}
      </ion-label>
    </ion-button>
    <ion-item
      v-else-if="element.type == 'string_icon'"
      :lines="element.colors?.borders != undefined ? 'inset' : 'none'"
      :color="
        element.colors?.background != undefined
          ? element.colors.background.name
          : undefined
      "
      :class="actual_classes.item"
    >
      <template
        v-if="
          castStringIcon(element).order == undefined ||
          !castStringIcon(element).order
        "
      >
        <ion-label
          :color="
            element.colors?.text != undefined
              ? element.colors.text.name
              : undefined
          "
          :class="{
            'ion-padding-end': true,
            ...actual_classes.label,
          }"
        >
          {{ castStringIcon(element.content).text }}
        </ion-label>
        <ion-button
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
          :class="actual_classes.button"
        >
          <ion-icon
            :ios="castStringIcon(element.content).icon.ios"
            :md="castStringIcon(element.content).icon.md"
            :color="
              element.colors?.text != undefined
                ? element.colors.text.name
                : undefined
            "
            :class="actual_classes.icon"
          />
        </ion-button>
      </template>
      <template v-else>
        <ion-button
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
          :class="actual_classes.button"
        >
          <ion-icon
            :ios="castStringIcon(element.content).icon.ios"
            :md="castStringIcon(element.content).icon.md"
            :color="
              element.colors?.text != undefined
                ? element.colors.text.name
                : undefined
            "
            :class="actual_classes.icon"
          />
        </ion-button>
        <ion-label
          :color="
            element.colors?.text != undefined
              ? element.colors.text.name
              : undefined
          "
          :class="actual_classes.label"
        >
          {{ castStringIcon(element.content).text }}
        </ion-label>
      </template>
    </ion-item>
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
  Classes,
  StringIcon,
  SubElements,
} from "@/types";
import { getCssVariable } from "@/utils";
import { IonButton, IonLabel, IonIcon, IonItem } from "@ionic/vue";
import { PropType } from "vue";
import { useStore } from "vuex";

const castIconAlternatives = (a: any) => a as IconAlternatives;
const castStringIcon = (a: any) => a as StringIcon;
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
  disabled: Boolean, // Da sistemare: aggiornare posti dove viene usato
});
defineEmits(["execute_link", "signal_event"]);

const text_color =
  props.element.colors?.text != undefined
    ? props.element.colors.text.type == "var"
      ? getCssVariable("--ion-color-" + props.element.colors.text.name)
      : props.element.colors.text.name
    : undefined;
const background_color =
  props.element.colors?.background != undefined
    ? props.element.colors.background.type == "var"
      ? getCssVariable("--ion-color-" + props.element.colors.background.name)
      : props.element.colors.background.name
    : undefined;
const borders_color =
  props.element.colors?.borders != undefined
    ? props.element.colors.borders.type == "var"
      ? getCssVariable("--ion-color-" + props.element.colors.borders.name)
      : props.element.colors.borders.name
    : undefined;

const actual_classes: Classes<SubElements> = {
  label: {
    ...props.element.classes?.label,
    textColor: props.element.colors?.text != undefined,
    backgroundColor: background_color != undefined,
    borders: borders_color != undefined,
  },
  html: {
    ...props.element.classes?.html,
    textColor: props.element.colors?.text != undefined,
    backgroundColor: background_color != undefined,
    borders: borders_color != undefined,
  },
  icon: {
    ...props.element.classes?.icon,
    textColor: props.element.colors?.text != undefined,
    backgroundColor: background_color != undefined,
    borders: borders_color != undefined && props.element.linkType == undefined,
  },
  button: {
    ...props.element.classes?.button,
    textButton: props.element.colors?.text != undefined,
    backgroundButton: background_color != undefined,
    bordersButton: borders_color != undefined,
  },
  item: {
    ...props.element.classes?.item,
    backgroundColor: background_color != undefined,
    borders: borders_color != undefined,
  },
};

const border_radius = props.element.params?.border_radius ?? "0px";
</script>

<style scoped>
.textColor {
  color: v-bind("text_color");
}
.backgroundColor {
  background-color: v-bind("background_color");
}
.borders {
  border: 1px solid v-bind("borders_color");
}
.backgroundButton {
  --background: v-bind("background_color");
}
.textButton {
  --color: v-bind("text_color");
}
.bordersButton {
  --border-radius: v-bind("border_radius");
  --border-color: v-bind("borders_color");
  --border-style: solid;
  --border-width: 1px;
}
/*.paddingButton {
  --padding-top: 10px;
  --padding-bottom: 10px;
}*/
</style>