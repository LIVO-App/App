<template>
  <ion-grid
    ><!-- v-if="learning_blocks.loaded">-->
    <ion-row>
      <ion-col size="12" size-md="6">
        <list-card
          :title="getCurrentElement(store, 'classes')"
          :emptiness_message="getCurrentElement(store, 'no_classes')"
          :cards_list="ordinary_classes"
          @signal_event="changeSelection()"
        />
      </ion-col>
      <ion-col size="12" size-md="6">
        <custom-select
          v-if="user.user == 'teacher'"
          v-model="selected_section"
          :list="sections"
          :label="getCurrentElement(store, 'section') + ':'"
          :aria_label="getCurrentElement(store, 'section')"
          :placeholder="
            is_nothing_selected()
              ? getCurrentElement(store, 'no_sections')
              : getCurrentElement(store, 'section_choice')
          "
        ></custom-select>
        <list-card
          :key="trigger"
          :title="getCurrentElement(store, 'students')"
          :emptiness_message="
            getCurrentElement(
              store,
              is_nothing_selected()
                ? 'ordinary_class_selection_message'
                : 'no_students'
            )
          "
          :cards_list="students"
        />
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import {
  GeneralCardElements,
  OrderedCardsList,
  HiglightCardElements,
  MinimumCourseProps,
  MinimizedCourse,
  OrdinaryClassSummary,
  StudentSummaryProps,
  StudentSummary,
} from "@/types";
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import { inject, reactive, Ref, ref, watch } from "vue";
import { useStore } from "vuex";
import type { AxiosInstance } from "axios";
import { executeLink, getCurrentElement } from "@/utils";

type Indexes = {
  year: string;
  index: number;
};

const is_nothing_selected = () =>
  selected_class_indexes.year == "-1" && selected_class_indexes.index == -1;
const find_class = (
  ordinary_class: OrderedCardsList<HiglightCardElements>,
  id?: string
): Indexes => {
  const years = Object.keys(ordinary_class.cards);

  let count = 0;
  let year: string;
  let index: number;

  do {
    year = years[count];
    index = ordinary_class.cards[year].findIndex((a: HiglightCardElements) => {
      if (id != undefined) {
        return a.id == id;
      } else {
        return a.selected;
      }
    });
    count++;
  } while (index == -1 && count < years.length);

  return {
    year: year,
    index: index,
  };
};
const changeSelection = async () => {
  
  let tmp_class: HiglightCardElements;

  if (
    selected_class_indexes.year != "-1" &&
    selected_class_indexes.index != -1
  ) {
    selectedChange();
  }
  
  const tmp_selected = find_class(ordinary_classes, store.state.event.data.id);
  if (
    selected_class_indexes.year == tmp_selected.year &&
    selected_class_indexes.index == tmp_selected.index
  ) {
    selected_class_indexes = {
      year: "-1",
      index: -1,
    };
    students.cards[""] = [];
    sections = [];
    selected_section.value = "";
  } else {
    selected_class_indexes = tmp_selected;
    tmp_class = ordinary_classes.cards[selected_class_indexes.year][
      selected_class_indexes.index
    ];
    sections =
      all_sections[parseInt(selected_class_indexes.year)][tmp_class.id];
    selected_section.value = sections[0].id;
    selectedChange();
    students.cards[""] = await getStudents();
  }
};
const selectedChange = (year = selected_class_indexes.year,index = selected_class_indexes.index,value = !ordinary_classes.cards[year][index].selected) => {
  ordinary_classes.cards[year][index].selected = value;
  trigger.value++;
}
const getStudents = async () => {
  const class_keys =
    ordinary_classes.cards[selected_class_indexes.year][
      selected_class_indexes.index
    ].id.split(" ");
  return await executeLink(
    $axios,
    "/v1/ordinary_classes/" +
      class_keys[0] +
      "/" +
      class_keys[1] +
      "/components?section=" +
      selected_section.value +
      "&school_year=" +
      selected_class_indexes.year +
      "&token=" +
      user.token,
    (response: any) =>
      response.data.data.map((a: StudentSummaryProps) =>
        new StudentSummary(a).toCard(store, "/students/" + a.id)
      )
  );
};

const $axios: AxiosInstance | undefined = inject("$axios");
const store = useStore();
const user = store.state.user;

const promises: Promise<any>[] = [];
const ordinary_classes: OrderedCardsList<HiglightCardElements> = reactive({
  order: [],
  cards: {},
});
const students: OrderedCardsList<GeneralCardElements> = reactive({
  order: [],
  cards: {},
});
const school_years = await executeLink(
  $axios,
  "/v1/teachers/" + user.id + "/active_years",
  (response: any) => response.data.data.map((a: any) => a.year),
  () => []
);
const trigger = ref(0);
const all_sections: {
  [key: number]: {
    [key: string]: { id: string }[];
  };
} = {};

let selected_class_indexes: Indexes = reactive({
  year: "-1",
  index: -1,
});
let ordinary_class: OrdinaryClassSummary;
let class_key: string;
let add_class: boolean;
const selected_section: Ref<string> = ref("");
let sections: { id: string }[] = [];

for (const year of school_years) {
  promises.push(
    executeLink(
      $axios,
      "/v1/teachers/" +
        user.id +
        "/my_ordinary_classes?school_year=" +
        year +
        "&token=" +
        user.token,
      (response) => {
        console.log(response);
        
        ordinary_classes.order.push({
          key: year,
          title: year,
        });
        for (const tmp_class of response.data.data) {
          ordinary_class = new OrdinaryClassSummary(tmp_class);
          class_key = ordinary_class.toString(false);
          if (ordinary_classes.cards[year] == undefined) {
            ordinary_classes.cards[year] = [];
            all_sections[year] = {};
          }
          if (all_sections[year][class_key] == undefined) {
            all_sections[year][class_key] = [];
            add_class = true;
          } else {
            add_class = false;
          }
          all_sections[year][class_key].push({ id: ordinary_class.section });
          if (add_class) {
            ordinary_classes.cards[year].push(
              ordinary_class.toHighlightCard(store, false)
            );
          }
        }
      }
    )
  );
}
await Promise.all(promises);
console.log(all_sections);


watch(selected_section, async (new_section) => {
  if (new_section != undefined && new_section != "") {
    students.cards[""] = await getStudents();
    trigger.value++;
  }
});
</script>

<style>
</style>