<template>
  <ion-card
    :color="
      colors?.background.type == 'var' ? colors?.background.name : undefined
    "
    :class="{
      '--ion-no-border': colors?.external_borders == undefined,
      background: colors != undefined && colors?.background.type != 'var',
    }"
  >
    <ion-card-header v-if="title != undefined && title.content != ''">
      <ion-card-title
        ><ionic-element
          :element="title"
          :classes="{
            label: {
              title_font: true,
            },
          }"
      /></ion-card-title>
      <ion-card-subtitle v-if="subtitle != undefined"
        ><ionic-element :element="subtitle"
      /></ion-card-subtitle>
    </ion-card-header>
    <ion-card-content style="overflow-y: auto">
      <ion-list class="ion-no-padding">
        <template v-if="Object.keys(actual_cards_list.cards).length === 0">
          <ion-item
            :color="
              colors?.background.type == 'var'
                ? colors?.background.name
                : undefined
            "
            :class="{
              background:
                colors != undefined && colors?.background.type != 'var',
            }"
            class="ion-no-padding"
          >
            <ionic-element
              :element="emptiness_message"
              :classes="emptiness_message_classes"
            />
          </ion-item>
        </template>
        <template v-else-if="actual_cards_list.cards[''] != undefined">
          <ion-item
            v-if="actual_cards_list.cards[''].length === 0"
            :color="
              colors?.background.type == 'var'
                ? colors?.background.name
                : undefined
            "
            :class="{
              background:
                colors != undefined && colors?.background.type != 'var',
            }"
            class="ion-no-padding"
          >
            <ionic-element
              :element="emptiness_message"
              :classes="emptiness_message_classes"
            />
          </ion-item>
          <template v-else>
            <template
              v-for="card in actual_cards_list.cards['']"
              :key="card.id"
            >
              <ion-item
                :lines="colors?.list_borders != undefined ? 'inset' : 'none'"
                :color="
                  colors?.background.type == 'var'
                    ? colors?.background.name
                    : undefined
                "
                :class="{
                  background:
                    colors != undefined && colors?.background.type != 'var',
                }"
                class="ion-no-padding"
              >
                <course-card
                  v-if="isCourse(card)"
                  @execute_link="$emit('execute_link')"
                  @signal_event="$emit('signal_event')"
                  :content="card.content"
                  :enrollment="card.enrollment"
                  :url="card.url"
                  :method="card.method"
                />
                <general-card
                  v-else-if="isGeneral(card)"
                  @execute_link="$emit('execute_link')"
                  @signal_event="$emit('signal_event')"
                  :id="card.id"
                  :title="card.title != undefined ? card.title : undefined"
                  :subtitle="
                    card.subtitle != undefined ? card.subtitle : undefined
                  "
                  :content="card.content"
                  :side_element="card.side_element"
                  :selected="card.selected"
                  :link="card.link"
                  :colors="{
                    background: colors?.background,
                    borders: colors?.cards_borders,
                  }"
                />
              </ion-item>
            </template>
          </template>
        </template>
        <template v-else>
          <ion-item-group
            v-for="ordered_cards in actual_cards_list.order"
            :key="'group-' + ordered_cards.key"
          >
            <ion-item-divider
              :color="
                (colors?.dividers.type == 'var'
                  ? colors?.dividers.name
                  : undefined) ?? 'light'
              "
              :class="{
                background:
                  colors != undefined && colors.dividers.type != 'var',
              }"
            >
              <ionic-element
                :element="ordered_cards.title"
                :classes="{
                  label: {
                    'ion-padding-end': true,
                    'item-text-wrap': true,
                  },
                }"
              />
            </ion-item-divider>
            <ion-item
              v-if="actual_cards_list.cards[ordered_cards.key].length === 0"
              :color="
                colors?.background.type == 'var'
                  ? colors?.background.name
                  : undefined
              "
              :class="{
                background:
                  colors != undefined && colors?.background.type != 'var',
              }"
              class="ion-no-padding"
            >
              <ionic-element
                :element="emptiness_message"
                :classes="emptiness_message_classes"
              />
            </ion-item>
            <template v-else>
              <template
                v-for="card in actual_cards_list.cards[ordered_cards.key]"
                :key="card.id"
              >
                <ion-item
                  :lines="colors?.list_borders != undefined ? 'inset' : 'none'"
                  :color="
                    colors?.background.type == 'var'
                      ? colors?.background.name
                      : undefined
                  "
                  :class="{
                    background:
                      colors != undefined && colors?.background.type != 'var',
                  }"
                  class="ion-no-padding"
                >
                  <course-card
                    v-if="isCourse(card)"
                    @execute_link="$emit('execute_link')"
                    @signal_event="$emit('signal_event')"
                    :content="card.content"
                    :enrollment="card.enrollment"
                    :url="card.url"
                    :method="card.method"
                  />
                  <general-card
                    v-else-if="isGeneral(card)"
                    @execute_link="$emit('execute_link')"
                    @signal_event="$emit('signal_event')"
                    :id="card.id"
                    :title="card.title != undefined ? card.title : undefined"
                    :subtitle="
                      card.subtitle != undefined ? card.subtitle : undefined
                    "
                    :content="card.content"
                    :side_element="card.side_element"
                    :selected="card.selected"
                    :link="card.link"
                    :colors="{
                      background: colors?.background,
                      borders: colors?.cards_borders,
                    }"
                  />
                </ion-item>
              </template>
            </template>
          </ion-item-group>
        </template>
      </ion-list>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItemGroup,
  IonItemDivider,
  IonItem,
} from "@ionic/vue";
import { PropType } from "vue";
import {
  CardElements,
  ColorObject,
  ColorType,
  CourseCardElements,
  CustomElement,
  OrderedCardsList,
  SubElementsClasses,
} from "../types";
import { isGeneral, isCourse, nullOperator } from "../utils";

const adjustColor = (
  color_type: ColorType | undefined,
  ...colors: (string | undefined)[]
): ColorObject | undefined => {
  const color = nullOperator(...colors);

  return color != undefined && color_type != undefined
    ? {
        name: color,
        type: color_type,
      }
    : undefined;
};

const props = defineProps({
  title: Object as PropType<CustomElement>,
  subtitle: Object as PropType<CustomElement>,
  emptiness_message: {
    type: Object as PropType<CustomElement>,
    required: true,
  },
  cards_list: {
    type: Object as PropType<OrderedCardsList>,
    required: true,
  },
  colors: Object as PropType<{
    background: ColorObject;
    text: ColorObject;
    dividers_text: ColorObject;
    dividers: ColorObject;
    external_borders: ColorObject;
    cards_borders: ColorObject;
    list_borders: ColorObject;
  }>,
});

defineEmits(["execute_link", "signal_event"]);

const actual_emptiness_message = JSON.parse(
  JSON.stringify(props.emptiness_message)
);
const actual_cards_list: OrderedCardsList<CardElements> = JSON.parse(
  JSON.stringify(props.cards_list)
);
const background_color =
  props.colors != undefined && props.colors.background != undefined
    ? "" + props.colors.background.name
    : undefined;
const groups = Object.keys(actual_cards_list.cards);
const emptiness_message_classes: SubElementsClasses = {
  label: {
    "ion-text-wrap": true,
    "ion-text-center": true,
  },
};

let actual_title, actual_subtitle, tmp_card;
let tmp_color: ColorObject | undefined = undefined;

if (props.title != undefined) {
  actual_title = JSON.parse(JSON.stringify(props.title));
  actual_title.color = adjustColor(
    props.title?.colors?.text != undefined
      ? props.title.colors.text.type
      : props.colors?.text?.type,
    props.title?.colors?.text?.name,
    props.colors?.text?.name
  );
}
if (props.subtitle != undefined) {
  actual_subtitle = JSON.parse(JSON.stringify(props.subtitle));
  actual_subtitle.color = adjustColor(
    props.subtitle?.colors?.text != undefined
      ? props.subtitle.colors.text.type
      : props.colors?.text?.type,
    props.subtitle?.colors?.text?.name,
    props.colors?.text?.name
  );
}
actual_emptiness_message.color = adjustColor(
  props.emptiness_message?.colors?.text != undefined
    ? props.emptiness_message.colors.text.type
    : props.colors?.text?.type,
  props.emptiness_message?.colors?.text?.name,
  props.colors?.text?.name
);
for (const group in groups) {
  for (const card in actual_cards_list.cards[groups[group]]) {
    tmp_card = actual_cards_list.cards[groups[group]][card];
    if (isGeneral(tmp_card)) {
      if (tmp_card.title != undefined) {
        tmp_color = adjustColor(
          tmp_card.title.colors?.text != undefined
            ? tmp_card.title.colors.text.type
            : props.colors?.text?.type,
          tmp_card.title.colors?.text?.name,
          props.colors?.text?.name
        );
        if (tmp_color != undefined) {
          if (tmp_card.title.colors == undefined) {
            tmp_card.title.colors = {};
          }
          tmp_card.title.colors.text = tmp_color;
        }
      }
      if (tmp_card.subtitle != undefined) {
        tmp_color = adjustColor(
          tmp_card.subtitle.colors?.text != undefined
            ? tmp_card.subtitle.colors.text.type
            : props.colors?.text?.type,
          tmp_card.subtitle.colors?.text?.name,
          props.colors?.text?.name
        );
        if (tmp_color != undefined) {
          if (tmp_card.subtitle.colors == undefined) {
            tmp_card.subtitle.colors = {};
          }
          tmp_card.subtitle.colors.text = tmp_color;
        }
      }
      if (tmp_card.content != undefined) {
        for (const element of tmp_card.content) {
          tmp_color = adjustColor(
            element.colors?.text != undefined
              ? element.colors.text.type
              : props.colors?.text?.type,
            element.colors?.text?.name,
            props.colors?.text?.name
          );
          if (tmp_color != undefined) {
            if (element.colors == undefined) {
              element.colors = {};
            }
            element.colors.text = tmp_color;
          }
        }
      }
    } else if (isCourse(tmp_card)) {
      tmp_card.enrollment = (
        props.cards_list.cards[groups[group]][card] as CourseCardElements
      ).enrollment;
    }
  }
}
for (const ordered_cards of actual_cards_list.order) {
  tmp_color = adjustColor(
    ordered_cards.title.colors?.text != undefined
      ? ordered_cards.title.colors.text.type
      : props.colors?.dividers_text != undefined
      ? props.colors?.dividers_text.type
      : props.colors?.background?.type,
    ordered_cards.title.colors?.text?.name,
    props.colors?.dividers_text?.name,
    props.colors?.background?.name
  );
  if (tmp_color != undefined) {
    if (ordered_cards.title.colors == undefined) {
      ordered_cards.title.colors = {};
    }
    ordered_cards.title.colors.text = tmp_color;
  }
}
</script>

<style scoped>
ion-card {
  max-height: 100%;
  display: flex;
  flex-direction: column;
}
ion-card-content {
  max-height: 100%;
  position: relative;
  overflow: hidden;
  overflow-y: auto;
}
.background {
  background-color: v-bind("background_color");
}
</style>