<template>
  <ion-grid
    ><!-- v-if="learning_sessions.loaded">-->
    <ion-row>
      <ion-col size="12" size-md="6">
        <list-card
          :title="getCurrentElement(store, 'learning_sessions')"
          :emptiness_message="getCurrentElement(store, 'no_sessions')"
          :cards_list="learning_sessions"
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
                ? 'teacher_learning_session_selection_message'
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
  LearningSession,
  OrderedCardsList,
  CourseSectionsTeachings,
  HiglightSessionCardElements,
  User,
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
  selected_session_indexes.year == "-1" && selected_session_indexes.index == -1;
const find_session = (
  learning_sessions: OrderedCardsList<HiglightSessionCardElements>,
  id?: string
): Indexes => {
  const years = Object.keys(learning_sessions.cards);

  let count = 0;
  let year: string;
  let index: number;

  do {
    year = years[count];
    index = learning_sessions.cards[year].findIndex(
      (a: HiglightSessionCardElements) => {
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
    selected_session_indexes.year != "-1" &&
    selected_session_indexes.index != -1
  ) {
    selectedChange();
  }

  const tmp_selected = find_session(learning_sessions, store.state.event.data.id);
  if (
    selected_session_indexes.year == tmp_selected.year &&
    selected_session_indexes.index == tmp_selected.index
  ) {
    selected_session_indexes = {
      year: "-1",
      index: -1,
    };
    courses.cards = {
      teacher: [],
      associated: [],
    };
  } else {
    selected_session_indexes = tmp_selected;
    selectedChange();
    await executeLink(
      $axios,
      "/v1/teachers/" +
        user.id +
        "/my_project_classes?session_id=" +
        learning_sessions.cards[selected_session_indexes.year][
          selected_session_indexes.index
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
          learning_sessions.cards[selected_session_indexes.year][
            selected_session_indexes.index
          ].id
        )
    );
    await executeLink(
      $axios,
      "/v1/teachers/" +
        user.id +
        "/associated_project_classes?session_id=" +
        learning_sessions.cards[selected_session_indexes.year][
          selected_session_indexes.index
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
          learning_sessions.cards[selected_session_indexes.year][
            selected_session_indexes.index
          ].id
        )
    );
  }
};
const selectedChange = (
  year = selected_session_indexes.year,
  index = selected_session_indexes.index,
  value = !learning_sessions.cards[year][index].selected
) => {
  learning_sessions.cards[year][index].selected = value;
  trigger.value++;
};

const $axios: AxiosInstance | undefined = inject("$axios");
const store = useStore();
const user = User.getLoggedUser() as User;

const promises: Promise<any>[] = [];
const learning_sessions: OrderedCardsList<HiglightSessionCardElements> = reactive({
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
  "/v1/teachers/" + user.id + "/active_years",
  (response: any) => response.data.data.map((a: any) => a.year),
  () => []
);
const trigger = ref(0);

let selected_session_indexes: Indexes = reactive({
  year: "-1",
  index: -1,
});

for (const year of teaching_years) {
  promises.push(
    executeLink(
      $axios,
      "/v1/learning_sessions?school_year=" + year,
      (response) => {
        learning_sessions.order.push({
          key: year,
          title: year,
        });
        learning_sessions.cards[year] = response.data.data.map((a: any) =>
          new LearningSession(a).toHighlightCard(store)
        );
      }
    )
  );
}
await Promise.all(promises);
</script>

<style>
</style>