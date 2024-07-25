<template>
  <ion-card
    :color="getIonicColor(colors?.background)"
    :class="{
      ...classes?.card,
      '--ion-no-border': colors?.external_borders == undefined,
      background:
        colors?.background != undefined &&
        getIonicColor(colors?.background) == undefined,
    }"
  >
    <ion-card-header v-if="title != undefined" :class="classes?.header">
      <ion-card-title v-if="title != undefined"
        ><ionic-element v-model:element="title_ref"
      /></ion-card-title>
      <ion-card-subtitle v-if="subtitle != undefined"
        ><ionic-element v-model:element="subtitle_ref"
      /></ion-card-subtitle>
    </ion-card-header>
    <ion-card-content style="overflow-y: auto" :class="classes?.content">
      <template v-if="hasNoData(cards_list_ref)">
        <ion-item
          :color="getIonicColor(colors?.background)"
          :class="{
            background:
              colors?.background != undefined &&
              getIonicColor(colors?.background) == undefined,
          }"
          class="ion-no-padding"
        >
          <ionic-element v-model:element="emptiness_message_ref" />
        </ion-item>
      </template>
      <ion-list
        v-else-if="onlyLists()"
        class="ion-no-padding"
        :class="classes?.list"
      >
        <template v-if="cards_list_ref.cards[''] != undefined">
          <card-item
            v-for="(card, i) in cards_list_ref.cards['']"
            :key="card.id"
            v-model:card="cards_list_ref.cards[''][i]"
            :colors="colors"
            :classes="classes"
            @execute_link="$emit('execute_link')"
            @signal_event="$emit('signal_event')"
          />
        </template>
        <template v-else>
          <ion-item-group
            v-for="(ordered_cards, i) in cards_list_ref.order"
            :key="'group-' + ordered_cards.key"
          >
            <group-list
              v-model:emptiness_message="emptiness_message_ref"
              v-model:divider="cards_list_ref.order[i].title"
              v-model:cards_list="cards_list_ref.cards[ordered_cards.key]"
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
          v-if="cards_list_ref.cards[''] != undefined"
          v-model:cards_list="cards_list_ref.cards['']"
          :columns="typeof columns == 'number' ? columns : columns['']"
          :colors="colors"
          :classes="classes"
          @execute_link="$emit('execute_link')"
          @signal_event="$emit('signal_event')"
        />
        <template v-else>
          <template
            v-for="(ordered_cards, i) in cards_list_ref.order"
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
                  v-model:emptiness_message="emptiness_message_ref"
                  v-model:divider="cards_list_ref.order[i].title"
                  v-model:cards_list="cards_list_ref.cards[ordered_cards.key]"
                  :colors="colors"
                  :classes="classes"
                  @execute_link="$emit('execute_link')"
                  @signal_event="$emit('signal_event')"
                />
              </ion-item-group>
            </ion-list>
            <template v-else>
              <ion-item-divider
                :color="getIonicColor(colors?.dividers) ?? 'light'"
                :class="{
                  ...classes?.divider,
                  dividers_background:
                    colors?.dividers != undefined &&
                    getIonicColor(colors?.dividers) == undefined,
                }"
              >
                <ionic-element
                  v-model:element="cards_list_ref.order[i].title"
                />
              </ion-item-divider>
              <ion-item
                v-if="cards_list_ref.cards[ordered_cards.key].length === 0"
                :color="getIonicColor(colors?.background)"
                :class="{
                  background:
                    colors?.background != undefined &&
                    getIonicColor(colors?.background) == undefined,
                }"
                class="ion-no-padding"
              >
                <ionic-element v-model:element="emptiness_message_ref" />
                <!-- TODO (4): aggiungere eventi -->
              </ion-item>
              <template v-else>
                <cards-grid
                  v-model:cards_list="cards_list_ref.cards[ordered_cards.key]"
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
import { PropType, ref, watch } from "vue";
import {
  ColorObject,
  EnrollmentCardElements,
  CustomElement,
  OrderedCardsList,
  Classes,
  CardsListElements,
  Colors,
  GeneralCardSubElements,
  TmpList,
  CardsGridElements,
  CustomSubElements,
} from "../types";
import {
  getIonicColor,
  isGeneral,
  isCourse,
  canVModel,
  canCardListVModel,
  adjustColor,
  hasNoData,
} from "../utils";
import { getCssColor } from "../utils";
import { WatchStopHandle } from "vue";

const setSpecificColors = (
  specific_colors: Colors<CustomSubElements> | undefined
) => {
  const colors: Colors<CustomSubElements> = general_card_colors ?? {};

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
      (cards_list_ref.value.cards[""] != undefined &&
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
const checkVModel = () =>
  props.cards_list.order.find((order_element) =>
    canVModel(order_element.title)
  ) != undefined || canCardListVModel(props.cards_list.cards);
const addListeners = () => {
  watch(
    () => props.cards_list,
    (value) => {
      cards_list_ref.value = value;
    }
  );
  watch(
    () => cards_list_ref.value,
    (value) => {
      emit("update:cards_list", value);
    }
  );
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
const emit = defineEmits([
  "execute_link",
  "signal_event",
  "update:title",
  "update:subtitle",
  "update:emptiness_message",
  "update:cards_list",
]);

const title_ref = ref(props.title);
const subtitle_ref = ref(props.subtitle);
const emptiness_message_ref = ref(props.emptiness_message);
const cards_list_ref = ref(props.cards_list);

const css_background_color =
  props.colors?.background != undefined
    ? getCssColor(props.colors.background)
    : undefined;
const css_dividers_color =
  props.colors?.dividers != undefined
    ? getCssColor(props.colors.dividers)
    : undefined;
const groups = Object.keys(cards_list_ref.value.cards);
const general_card_colors:
  | {
      [key in keyof string as CustomSubElements]?: ColorObject;
    }
  | undefined =
  props.colors?.background != undefined ||
  props.colors?.cards_borders != undefined
    ? {
        background: props.colors?.background,
        borders: props.colors?.cards_borders,
      }
    : undefined;

let tmp_card;
let tmp_color: ColorObject | undefined = undefined;
let stopWatch: WatchStopHandle;

if (props.title != undefined && title_ref.value != undefined) {
  if (title_ref.value.colors == undefined) {
    title_ref.value.colors = {};
  }
  title_ref.value.colors.text = adjustColor(
    props.title?.colors?.text != undefined
      ? props.title.colors.text.type
      : props.colors?.text?.type,
    props.title?.colors?.text?.name,
    props.colors?.text?.name
  );
}
if (props.subtitle != undefined && subtitle_ref.value != undefined) {
  if (subtitle_ref.value.colors == undefined) {
    subtitle_ref.value.colors = {};
  }
  subtitle_ref.value.colors.text = adjustColor(
    props.subtitle?.colors?.text != undefined
      ? props.subtitle.colors.text.type
      : props.colors?.text?.type,
    props.subtitle?.colors?.text?.name,
    props.colors?.text?.name
  );
}
if (emptiness_message_ref.value.colors == undefined) {
  emptiness_message_ref.value.colors = {};
}
emptiness_message_ref.value.colors.text = adjustColor(
  props.emptiness_message?.colors?.text != undefined
    ? props.emptiness_message.colors.text.type
    : props.colors?.text?.type,
  props.emptiness_message?.colors?.text?.name,
  props.colors?.text?.name
);
if (emptiness_message_ref.value.classes == undefined) {
  emptiness_message_ref.value.classes = {};
}
emptiness_message_ref.value.classes.label = {
  "ion-text-wrap": true,
  "ion-text-center": true,
};
for (const card_group of cards_list_ref.value.order) {
  if (card_group.title.classes == undefined) {
    card_group.title.classes = {};
  }
  card_group.title.classes.label = {
    "ion-padding-end": true,
    "item-text-wrap": true,
  };
}

for (const group in groups) {
  for (const card in cards_list_ref.value.cards[groups[group]]) {
    tmp_card = cards_list_ref.value.cards[groups[group]][card];
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
        props.cards_list.cards[groups[group]][card] as EnrollmentCardElements
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
for (const ordered_cards of cards_list_ref.value.order) {
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

if (canVModel(props.emptiness_message)) {
  watch(
    () => props.emptiness_message,
    (value) => {
      emptiness_message_ref.value = value;
    }
  );
  watch(
    () => emptiness_message_ref.value,
    (value) => {
      emit("update:title", value);
    }
  );
}
if (props.title != undefined && canVModel(props.title)) {
  watch(
    () => props.title,
    (value) => {
      title_ref.value = value;
    }
  );
  watch(
    () => title_ref.value,
    (value) => {
      emit("update:title", value);
    }
  );
}
if (props.subtitle != undefined && canVModel(props.subtitle)) {
  watch(
    () => props.subtitle,
    (value) => {
      subtitle_ref.value = value;
    }
  );
  watch(
    () => subtitle_ref.value,
    (value) => {
      emit("update:subtitle", value);
    }
  );
}
if (hasNoData(props.cards_list)) {
  stopWatch = watch(
    () => props.cards_list,
    (value) => {
      cards_list_ref.value = value;
      if (!hasNoData(value) && checkVModel()) {
        addListeners();
        stopWatch();
      }
    }
  );
} else if (checkVModel()) {
  addListeners();
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
  background-color: v-bind("css_background_color");
}
.dividers_background {
  background-color: v-bind("css_dividers_color");
}
</style>
