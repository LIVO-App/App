<template>
  <ion-card
    :color="colors?.background"
    :class="{
      '--ion-no-border': colors?.external_borders == undefined,
    }"
  >
    <ion-card-header v-if="title != undefined && title.content != ''">
      <ion-card-title class="ion-text-center"><ionic-element :element="title" class="title_font" /></ion-card-title>
      <ion-card-subtitle v-if="subtitle != undefined"
        ><ionic-element :element="subtitle"
      /></ion-card-subtitle>
    </ion-card-header>
    <ion-card-content style="overflow-y: auto">
      <ion-list class="ion-no-padding">
        <template v-if="Object.keys(actual_cards_list.cards).length === 0">
          <ion-item
            :color="colors?.background"
            class="ion-no-padding"
          >
            <ionic-element :element="emptiness_message" class="ion-text-wrap ion-text-center" />
          </ion-item>
        </template>
        <template v-else-if="actual_cards_list.cards[''] != undefined">
          <ion-item
            v-if="actual_cards_list.cards[''].length === 0"
            :color="colors?.background"
            class="ion-no-padding"
          >
            <ionic-element :element="emptiness_message" class="ion-text-wrap ion-text-center" />
          </ion-item>
          <template v-else>
            <template v-for="card in actual_cards_list.cards['']" :key="card.id">
              <ion-item
                :lines="colors?.list_borders != undefined ? 'inset' : 'none'"
                :color="colors?.background"
                class="ion-no-padding"
              >
                <course-card
                  v-if="isCourse(card)"
                  @execute_link="$emit('execute_link')"
                  @signal_event="$emit('signal_event')"
                  :credits="card.credits"
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
                  :background_color="colors?.background"
                  :borders="colors?.cards_borders"
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
              :color="colors?.dividers ?? 'light'"
            >
              <ionic-element :element="ordered_cards.title" class="ion-padding-end item-text-wrap" />
            </ion-item-divider>
            <ion-item
              v-if="actual_cards_list.cards[ordered_cards.key].length === 0"
              :color="colors?.background"
              class="ion-no-padding"
            >
              <ionic-element :element="emptiness_message" class="ion-text-wrap ion-text-center" />
            </ion-item>
            <template v-else>
              <template
                v-for="card in actual_cards_list.cards[ordered_cards.key]"
                :key="card.id"
              >
                <ion-item
                  :lines="colors?.list_borders != undefined ? 'inset' : 'none'"
                  :color="colors?.background"
                  class="ion-no-padding"
                >
                  <course-card
                    v-if="isCourse(card)"
                    @execute_link="$emit('execute_link')"
                    @signal_event="$emit('signal_event')"
                    :credits="card.credits"
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
                    :background_color="colors?.background"
                    :borders="colors?.cards_borders"
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
  ColorObject,
  ColorType,
  CustomElement,
  OrderedCardsList,
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
    background: string;
    text: string;
    dividers_text: string;
    dividers: string;
    external_borders: string;
    cards_borders: string;
    list_borders: string;
  }>,
});

defineEmits(["execute_link", "signal_event"]);

const actual_emptiness_message = JSON.parse(JSON.stringify(props.emptiness_message));
const actual_cards_list = JSON.parse(JSON.stringify(props.cards_list));

let actual_title, actual_subtitle;

if (props.title != undefined) {
  actual_title = JSON.parse(JSON.stringify(props.title));
  actual_title.color = adjustColor(
    props.title?.color != undefined ? props.title.color?.type : "text",
    props.title?.color?.name,
    props.colors?.text
  );
}
if (props.subtitle != undefined) {
  actual_subtitle = JSON.parse(JSON.stringify(props.subtitle));
  actual_subtitle.color = adjustColor(
    props.subtitle?.color != undefined ? props.subtitle.color?.type : "text",
    props.subtitle?.color?.name,
    props.colors?.text
  );
}
actual_emptiness_message.color = adjustColor(
  props.emptiness_message?.color != undefined
    ? props.emptiness_message.color?.type
    : "text",
  props.emptiness_message?.color?.name,
  props.colors?.text
);
for (const group of Object.keys(actual_cards_list.cards)) {
  for (const card of actual_cards_list.cards[group]) {
    if (isGeneral(card)) {
      if (card.title != undefined) {
        card.title.color = adjustColor(
          card.title.color != undefined ? card.title.color?.type : "text",
          card.title.color?.name,
          props.colors?.text
        );
      }
      if (card.subtitle != undefined) {
        card.subtitle.color = adjustColor(
          card.subtitle.color != undefined ? card.subtitle.color?.type : "text",
          card.subtitle.color?.name,
          props.colors?.text
        );
      }
      if (card.content != undefined) {
        for (const element of card.content) {
          element.color = adjustColor(
            element.color != undefined ? element.color?.type : "text",
            element.color?.name,
            props.colors?.text
          );
        }
      }
    }
  }
}
for (const ordered_cards of actual_cards_list.order) {
  ordered_cards.title.color = adjustColor(
    ordered_cards.title.color != undefined
      ? ordered_cards.title.color?.type
      : "text",
    ordered_cards.title.color?.name,
    props.colors?.dividers_text,
    props.colors?.background
  );
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
</style>