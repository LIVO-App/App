<template>
  <ion-grid
    ><!-- v-if="learning_blocks.loaded">-->
    <ion-row>
      <ion-col size="12" size-md="6">
        <list-card
          :title="getCurrentElement(store, 'learning_blocks')"
          :emptiness_message="getCurrentElement(store, 'no_blocks')"
          :cards_list="learning_blocks"
          @signal_event="changeSelection()"
        />
      </ion-col>
      <ion-col size="12" size-md="6">
        <list-card
          :key="trigger"
          :title="getCurrentElement(store, 'courses')"
          :emptiness_message="
            getCurrentElement(
              store,
              is_nothing_selected()
                ? 'teacher_learning_block_selection_message'
                : 'no_project_classes'
            )
          "
          :cards_list="is_nothing_selected() ? empty_courses : courses"
        />
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import {
  GeneralCardElements,
  LearningBlock,
  OrderedCardsList,
  CourseSectionsTeachings,
  HiglightBlockCardElements,
} from "@/types";
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import { inject, reactive, ref } from "vue";
import { useStore } from "vuex";
import type { AxiosInstance } from "axios";
import { executeLink, getCurrentElement } from "@/utils";

type Indexes = {
  year: string;
  index: number;
};

const is_nothing_selected = () =>
  selected_block_indexes.year == "-1" && selected_block_indexes.index == -1;
const find_block = (
  learning_blocks: OrderedCardsList<HiglightBlockCardElements>,
  id?: string
): Indexes => {
  const years = Object.keys(learning_blocks.cards);

  let count = 0;
  let year: string;
  let index: number;

  do {
    year = years[count];
    index = learning_blocks.cards[year].findIndex(
      (a: HiglightBlockCardElements) => {
        if (id != undefined) {
          return a.id == id;
        } else {
          return a.selected;
        }
      }
    );
    count++;
  } while (index == -1 && count < years.length);

  return {
    year: year,
    index: index,
  };
};
const changeSelection = async () => {
  const tmp_classes: {
    teacher: {
      [key: number]: CourseSectionsTeachings;
    };
    associated: {
      [key: number]: CourseSectionsTeachings;
    };
  } = {
    teacher: {},
    associated: {},
  };

  if (
    selected_block_indexes.year != "-1" &&
    selected_block_indexes.index != -1
  ) {
    selectedChange();
  }

  const tmp_selected = find_block(learning_blocks, store.state.event.data.id);
  if (
    selected_block_indexes.year == tmp_selected.year &&
    selected_block_indexes.index == tmp_selected.index
  ) {
    selected_block_indexes = {
      year: "-1",
      index: -1,
    };
    courses.cards = {
      teacher: [],
      associated: [],
    };
  } else {
    selected_block_indexes = tmp_selected;
    selectedChange();
    await executeLink(
      $axios,
      "/v1/teachers/" +
        user_id +
        "/my_project_classes?block_id=" +
        learning_blocks.cards[selected_block_indexes.year][
          selected_block_indexes.index
        ].id,
      (response: any) => {
        for (const class_teaching of response.data.data) {
          if (tmp_classes.teacher[class_teaching.id] == undefined) {
            tmp_classes.teacher[class_teaching.id] =
              new CourseSectionsTeachings(class_teaching);
          } else {
            tmp_classes.teacher[class_teaching.id].sections.add(
              class_teaching.section
            );
            if (class_teaching.my_teaching) {
              tmp_classes.teacher[class_teaching.id].my_teaching_refs.add(
                class_teaching.teaching_ref.data.id
              );
            }
          }
        }
      }
    );
    courses.cards.teacher = Object.values(tmp_classes.teacher).map(
      (a: CourseSectionsTeachings) =>
        a.toCard(
          store,
          "teacher",
          learning_blocks.cards[selected_block_indexes.year][
            selected_block_indexes.index
          ].id
        )
    );
    await executeLink(
      $axios,
      "/v1/teachers/" +
        user_id +
        "/associated_project_classes?block_id=" +
        learning_blocks.cards[selected_block_indexes.year][
          selected_block_indexes.index
        ].id,
      (response: any) => {
        const teaching_classes = new Set(Object.keys(tmp_classes.teacher));
        for (const class_teaching of response.data.data) {
          if (!teaching_classes.has("" + class_teaching.id)) {
            if (tmp_classes.associated[class_teaching.id] == undefined) {
              tmp_classes.associated[class_teaching.id] =
                new CourseSectionsTeachings(class_teaching);
            } else {
              tmp_classes.associated[class_teaching.id].sections.add(
                class_teaching.section
              );
              tmp_classes.associated[class_teaching.id].my_teaching_refs.add(
                class_teaching.teaching_ref.data.id
              );
            }
          }
        }
      }
    );
    courses.cards.associated = Object.values(tmp_classes.associated).map(
      (a: CourseSectionsTeachings) =>
        a.toCard(
          store,
          "my_associated_teachings",
          learning_blocks.cards[selected_block_indexes.year][
            selected_block_indexes.index
          ].id
        )
    );
  }
};
const selectedChange = (
  year = selected_block_indexes.year,
  index = selected_block_indexes.index,
  value = !learning_blocks.cards[year][index].selected
) => {
  learning_blocks.cards[year][index].selected = value;
  trigger.value++;
};

const $axios: AxiosInstance | undefined = inject("$axios");
const store = useStore();
const user_id = store.state.user.id;

const promises: Promise<any>[] = [];
const learning_blocks: OrderedCardsList<HiglightBlockCardElements> = reactive({
  order: [],
  cards: {},
});
const empty_courses: OrderedCardsList<GeneralCardElements> = reactive({
  order: [],
  cards: {},
});
const courses: OrderedCardsList<GeneralCardElements> = reactive({
  order: [
    {
      key: "teacher",
      title: getCurrentElement(store, "teacher"),
    },
    {
      key: "associated",
      title: getCurrentElement(store, "associated"),
    },
  ],
  cards: {
    teacher: [],
    associated: [],
  },
});
const teaching_years = await executeLink(
  $axios,
  "/v1/teachers/" + user_id + "/active_years",
  (response: any) => response.data.data.map((a: any) => a.year),
  () => []
);
const trigger = ref(0);

let selected_block_indexes: Indexes = reactive({
  year: "-1",
  index: -1,
});

for (const year of teaching_years) {
  promises.push(
    executeLink(
      $axios,
      "/v1/learning_blocks?school_year=" + year,
      (response) => {
        learning_blocks.order.push({
          key: year,
          title: year,
        });
        learning_blocks.cards[year] = response.data.data.map((a: any) =>
          new LearningBlock(a).toHighlightCard(store)
        );
      }
    )
  );
}
await Promise.all(promises);
</script>

<style>
</style>