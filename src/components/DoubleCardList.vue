<template>
  <ion-grid>
    <ion-row>
      <ion-col size="12" size-md="6">
        <list-card
          :title="first_list_description.title"
          :emptiness_message="first_list_description.emptiness_message"
          :cards_list="first_list_description.cards_list"
          @signal_event="changeSelection()"
        />
      </ion-col>
      <ion-col size="12" size-md="6">
        <custom-select
          v-if="selection_criterion != undefined"
          v-model="selected_list"
          :list="select_options"
          :label="selection_criterion.label"
          :aria_label="selection_criterion.label"
          :placeholder="
            is_nothing_selected()
              ? selection_criterion.emptiness_message
              : selection_criterion.no_choice_message
          "
        ></custom-select>
        <list-card
          :key="trigger"
          :title="second_list_description.title"
          :emptiness_message="
            getCurrentElement(
              is_nothing_selected()
                ? second_list_description.no_choice_message ??
                    getCurrentElement('side_element_selection_message')
                : second_list_description.emptiness_message
            )
          "
          :cards_list="second_list"
        />
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import {
  GeneralCardElements,
  OrderedCardsList,
  OrdinaryClassSummary,
  StudentSummaryProps,
  StudentSummary,
  User,
  CardListDescription,
  SingleCardList,
  MultipleCardList,
  CustomSelectDescription,
  CardListBuilder,
} from "@/types";
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import { inject, PropType, reactive, Ref, ref, watch } from "vue";
import { useStore } from "vuex";
import type { AxiosInstance } from "axios";
import {
  executeLink,
  getCurrentElement,
  isCardListBuilder,
  isCustomSelectBuilder,
  isMultipleCardList,
  isMultipleCustomSelect,
} from "@/utils";

type Indexes = {
  group: string | number;
  index: number;
};

const is_nothing_selected = () =>
  selected_element_indexes.group == "-1" &&
  selected_element_indexes.index == -1;
const find_element = (
  elements: OrderedCardsList<GeneralCardElements>,
  id?: string
): Indexes => {
  const groups = Object.keys(elements.cards);

  let count = 0;
  let group: string | number;
  let index: string | number;

  do {
    group = groups[count];
    index = elements.cards[group].findIndex((a: GeneralCardElements) => {
      if (id != undefined) {
        return a.id == id;
      } else {
        return a.selected;
      }
    });
    count++;
  } while (index == -1 && count < groups.length);

  return {
    group: group,
    index: index,
  };
};
const changeSelection = async () => {
  let tmp_list: GeneralCardElements;

  if (
    selected_element_indexes.group != "-1" &&
    selected_element_indexes.index != -1
  ) {
    selectedChange();
  }

  const tmp_selected = find_element(first_list, store.state.event.data.id);
  if (
    selected_element_indexes.group == tmp_selected.group &&
    selected_element_indexes.index == tmp_selected.index
  ) {
    selected_element_indexes = {
      group: "-1",
      index: -1,
    };
    second_list.cards = {
      "": [],
    };
    second_list.order = [];
    select_options = [];
    selected_list.value = "";
  } else {
    selected_element_indexes = tmp_selected;
    tmp_list =
      first_list.cards[selected_element_indexes.group][
        selected_element_indexes.index
      ];
    select_options =
      props.selection_criterion != undefined
        ? isMultipleCustomSelect(props.selection_criterion)
          ? props.selection_criterion.possibilities[
              selected_element_indexes.group
            ][tmp_list.id]
          : isCustomSelectBuilder(props.selection_criterion)
          ? props.selection_criterion.func(...props.selection_criterion.params) // Da sistemare: aggiungere a lista per risparmiare chiamate
          : {
              id: "",
            }
        : {
            id: "",
          };
    selected_list.value = select_options[0].id;
    selectedChange();
    changeSecondList();
  }
};
const selectedChange = (
  year = selected_element_indexes.group,
  index = selected_element_indexes.index,
  value = !first_list.cards[year][index].selected
) => {
  first_list.cards[year][index].selected = value;
  trigger.value++;
};
const changeSecondList = () => {
  second_list = isMultipleCardList(props.second_list_description)
    ? props.second_list_description.cards_lists[selected_element_indexes.group][
        selected_element_indexes.index
      ][selected_list.value]
    : isCardListBuilder(props.second_list_description)
    ? props.second_list_description.func(
        ...props.second_list_description.params
      ) // Da sistemare: aggiungere a lista per risparmiare chiamate
    : {
        order: [],
        cards: {
          "": [],
        },
      };
};

const store = useStore();
const user = User.getLoggedUser() as User;
const props = defineProps({
  first_list_description: {
    type: Object as PropType<SingleCardList<GeneralCardElements>>,
    required: true,
  },
  second_list_description: {
    type: Object as PropType<MultipleCardList | CardListBuilder>,
    required: true,
  },
  selection_criterion: Object as PropType<CustomSelectDescription>,
});

const first_list: OrderedCardsList<GeneralCardElements> = reactive(
  props.first_list_description.cards_list
);
const trigger = ref(0);
const selected_list: Ref<string> = ref("");

let selected_element_indexes: Indexes = reactive({
  group: "-1",
  index: -1,
});
let select_options: { id: string }[] = [];
let second_list: OrderedCardsList = {
  order: [],
  cards: {},
};

watch(selected_list, async (new_section) => {
  if (new_section != undefined && new_section != "") {
    changeSecondList();
    trigger.value++;
  }
});
</script>

<style>
</style>