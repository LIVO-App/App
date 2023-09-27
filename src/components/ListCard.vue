<template>
  <ion-card
    :color="
      colors?.background != undefined && colors?.background?.type == 'var'
        ? colors?.background.name
        : undefined
    "
    :class="{
      ...classes?.card,
      '--ion-no-border': colors?.external_borders == undefined,
      background:
        colors?.background != undefined && colors?.background?.type != 'var',
    }"
  >
    <ion-card-header
      v-if="title != undefined && title.content != ''"
      :class="classes?.header"
    >
      <ion-card-title v-if="title != undefined"
        ><ionic-element :element="actual_title"
      /></ion-card-title>
      <ion-card-subtitle v-if="subtitle != undefined"
        ><ionic-element :element="actual_subtitle"
      /></ion-card-subtitle>
    </ion-card-header>
    <ion-card-content style="overflow-y: auto" :class="classes?.content">
      <template
        v-if="
          Object.keys(actual_cards_list.cards).length === 0 ||
          actual_cards_list.cards['']?.length === 0
        "
      >
        <ion-item
          :color="
            colors?.background?.type == 'var'
              ? colors?.background.name
              : undefined
          "
          :class="{
            background:
              colors?.background != undefined &&
              colors?.background?.type != 'var',
          }"
          class="ion-no-padding"
        >
          <ionic-element :element="actual_emptiness_message" />
        </ion-item>
      </template>
      <ion-list
        v-else-if="onlyLists()"
        class="ion-no-padding"
        :class="classes?.list"
      >
        <template v-if="actual_cards_list.cards[''] != undefined">
          <card-item
            v-for="card in actual_cards_list.cards['']"
            :key="card.id"
            :card="card"
            :colors="colors"
            :classes="classes"
            @execute_link="$emit('execute_link')"
            @signal_event="$emit('signal_event')"
          />
        </template>
        <template v-else>
          <ion-item-group
            v-for="ordered_cards in actual_cards_list.order"
            :key="'group-' + ordered_cards.key"
          >
            <group-list
              :emptiness_message="actual_emptiness_message"
              :divider="ordered_cards.title"
              :cards_list="actual_cards_list.cards[ordered_cards.key]"
              :colors="colors"
              :classes="classes"
              @execute_link="$emit('execute_link')"
              @signal_event="$emit('signal_event')"
            />
          </ion-item-group>
        </template>
      </ion-list>
      <template v-else>
        <cards-grid
          v-if="actual_cards_list.cards[''] != undefined"
          :cards_list="actual_cards_list.cards['']"
          :columns="typeof columns == 'number' ? columns : columns['']"
          :colors="colors"
          :classes="classes"
          @execute_link="$emit('execute_link')"
          @signal_event="$emit('signal_event')"
        />
        <template v-else>
          <template
            v-for="ordered_cards in actual_cards_list.order"
            :key="'group-' + ordered_cards.key"
          >
            <ion-list
              v-if="
                (typeof columns == 'number'
                  ? columns
                  : columns[ordered_cards.key]) == 1
              "
            >
              <ion-item-group>
                <group-list
                  :emptiness_message="actual_emptiness_message"
                  :divider="ordered_cards.title"
                  :cards_list="actual_cards_list.cards[ordered_cards.key]"
                  :colors="colors"
                  :classes="classes"
                  @execute_link="$emit('execute_link')"
                  @signal_event="$emit('signal_event')"
                />
              </ion-item-group>
            </ion-list>
            <template v-else>
              <ion-item-divider
                :color="
                  (colors?.dividers?.type == 'var'
                    ? colors?.dividers.name
                    : undefined) ?? 'light'
                "
                :class="{
                  ...classes?.divider,
                  background:
                    colors?.dividers != undefined &&
                    colors.dividers.type != 'var',
                }"
              >
                <ionic-element :element="ordered_cards.title" />
              </ion-item-divider>
              <ion-item
                v-if="actual_cards_list.cards[ordered_cards.key].length === 0"
                :color="
                  colors?.background?.type == 'var'
                    ? colors?.background.name
                    : undefined
                "
                :class="{
                  background:
                    colors?.background != undefined &&
                    colors?.background?.type != 'var',
                }"
                class="ion-no-padding"
              >
                <ionic-element :element="actual_emptiness_message" />
              </ion-item>
              <template v-else>
                <cards-grid
                  :cards_list="actual_cards_list.cards[ordered_cards.key]"
                  :columns="
                    typeof columns == 'number'
                      ? columns
                      : columns[ordered_cards.key]
                  "
                  :colors="colors"
                  :classes="classes"
                  @execute_link="$emit('execute_link')"
                  @signal_event="$emit('signal_event')"
                />
              </template>
            </template>
          </template>
        </template>
      </template>
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
import { computed, ComputedRef, PropType } from "vue";
import {
  CardElements,
  ColorObject,
  ColorType,
  CourseCardElements,
  CustomElement,
  OrderedCardsList,
  Classes,
  CardsListElements,
  GeneralSubElements,
  Colors,
  GeneralCardSubElements,
  TmpList,
  CardsGridElements,
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
const setSpecificColors = (
  specific_colors: Colors<GeneralSubElements> | undefined
) => {
  const colors: Colors<GeneralSubElements> = general_card_colors ?? {};

  Object.assign(colors, specific_colors);

  return colors;
};
const onlyLists = () => {
  const groups = Object.keys(props.columns);

  let is_list;
  let count = 0;

  if (
    !(is_list =
      props.columns === 1 ||
      (actual_cards_list.value.cards[""] != undefined &&
        typeof props.columns != "number" &&
        props.columns[""] == 1))
  ) {
    while (
      (is_list = (props.columns as TmpList<number>)[groups[count]] == 1) &&
      ++count < groups.length
    );
  }

  return is_list;
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
  columns: {
    type: [Number, Object] as PropType<number | TmpList<number>>,
    default() {
      return 1;
    },
  },
  colors: Object as PropType<Colors<GeneralCardSubElements>>,
  classes: Object as PropType<Classes<CardsListElements | CardsGridElements>>,
});
defineEmits(["execute_link", "signal_event"]);

const actual_emptiness_message: ComputedRef<CustomElement> = computed(() =>
  JSON.parse(JSON.stringify(props.emptiness_message))
);
const actual_cards_list = computed(() => {
  return JSON.parse(
    JSON.stringify(props.cards_list)
  ) as OrderedCardsList<CardElements>;
});
const background_color =
  props.colors?.background != undefined && props.colors.background != undefined
    ? "" + props.colors.background.name
    : undefined;
const groups = Object.keys(actual_cards_list.value.cards);
const general_card_colors:
  | {
      [key in keyof string as GeneralSubElements]?: ColorObject;
    }
  | undefined =
  props.colors?.background != undefined ||
  props.colors?.cards_borders != undefined
    ? {
        background: props.colors?.background,
        borders: props.colors?.cards_borders,
      }
    : undefined;

let actual_title: CustomElement, actual_subtitle: CustomElement, tmp_card;
let tmp_color: ColorObject | undefined = undefined;

if (props.title != undefined) {
  actual_title = JSON.parse(JSON.stringify(props.title));
  if (actual_title.colors == undefined) {
    actual_title.colors = {};
  }
  actual_title.colors.text = adjustColor(
    props.title?.colors?.text != undefined
      ? props.title.colors.text.type
      : props.colors?.text?.type,
    props.title?.colors?.text?.name,
    props.colors?.text?.name
  );
}
if (props.subtitle != undefined) {
  actual_subtitle = JSON.parse(JSON.stringify(props.subtitle));
  if (actual_subtitle.colors == undefined) {
    actual_subtitle.colors = {};
  }
  actual_subtitle.colors.text = adjustColor(
    props.subtitle?.colors?.text != undefined
      ? props.subtitle.colors.text.type
      : props.colors?.text?.type,
    props.subtitle?.colors?.text?.name,
    props.colors?.text?.name
  );
}
if (actual_emptiness_message.value.colors == undefined) {
  actual_emptiness_message.value.colors = {};
}
actual_emptiness_message.value.colors.text = adjustColor(
  props.emptiness_message?.colors?.text != undefined
    ? props.emptiness_message.colors.text.type
    : props.colors?.text?.type,
  props.emptiness_message?.colors?.text?.name,
  props.colors?.text?.name
);
if (actual_emptiness_message.value.classes == undefined) {
  actual_emptiness_message.value.classes = {};
}
actual_emptiness_message.value.classes.label = {
  "ion-text-wrap": true,
  "ion-text-center": true,
};
for (const card_group of actual_cards_list.value.order) {
  if (card_group.title.classes == undefined) {
    card_group.title.classes = {};
  }
  card_group.title.classes.label = {
    "ion-padding-end": true,
    "item-text-wrap": true,
  };
}

for (const group in groups) {
  for (const card in actual_cards_list.value.cards[groups[group]]) {
    tmp_card = actual_cards_list.value.cards[groups[group]][card];
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
      tmp_card.colors = setSpecificColors(tmp_card.colors);
    } else if (isCourse(tmp_card)) {
      tmp_card.enrollment = (
        props.cards_list.cards[groups[group]][card] as CourseCardElements
      ).enrollment;

      tmp_color = adjustColor(
        tmp_card.content[0].colors?.text != undefined
          ? tmp_card.content[0].colors.text.type
          : props.colors?.background?.type,
        tmp_card.content[0].colors?.text?.name,
        props.colors?.background?.name
      );
      if (tmp_color != undefined) {
        if (tmp_card.content[0].colors == undefined) {
          tmp_card.content[0].colors = {};
        }
        tmp_card.content[0].colors.text = tmp_color;
      }

      tmp_color = adjustColor(
        tmp_card.content[1].colors?.text != undefined
          ? tmp_card.content[1].colors.text.type
          : props.colors?.text?.type,
        tmp_card.content[1].colors?.text?.name,
        props.colors?.text?.name
      );
      if (tmp_color != undefined) {
        if (tmp_card.content[1].colors == undefined) {
          tmp_card.content[1].colors = {};
        }
        tmp_card.content[1].colors.text = tmp_color;
      }
    }
  }
}
for (const ordered_cards of actual_cards_list.value.order) {
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