<template>
  <ion-grid
    ><!-- v-if="learning_sessions.loaded">-->
    <ion-row>
      <ion-col size="12" size-md="6">
        <list-card
          :title="
            getCustomMessage('title', getCurrentElement('learning_sessions'))
          "
          :emptiness_message="
            getCustomMessage(
              'emptiness_message',
              getCurrentElement('no_sessions')
            )
          "
          :cards_list="learning_sessions"
          @signal_event="changeSelection()"
        />
      </ion-col>
      <ion-col size="12" size-md="6">
        <list-card
          :key="trigger"
          :title="getCustomMessage('title', getCurrentElement('courses'))"
          :emptiness_message="
            getCustomMessage(
              'emptiness_message',
              getCurrentElement(
                is_nothing_selected()
                  ? 'student_learning_session_selection_message'
                  : 'no_courses'
              )
            )
          "
          :cards_list="courses"
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
  MinimumCourseProps,
  MinimizedCourse,
  User,
  AdminProjectClassProps,
  AdminProjectClass,
} from "@/types";
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import { reactive, ref } from "vue";
import { useStore } from "vuex";
import { executeLink, getCurrentElement, getCustomMessage } from "@/utils";
import { useRoute } from "vue-router";

type Indexes = {
  year: string;
  index: number;
};

const is_nothing_selected = () =>
  selected_session_indexes.year == "-1" && selected_session_indexes.index == -1;
const find_session = (
  learning_session: OrderedCardsList<GeneralCardElements>,
  id?: string
): Indexes => {
  const years = Object.keys(learning_session.cards);

  let count = 0;
  let year: string;
  let index: number;

  do {
    year = years[count];
    index = learning_session.cards[year].findIndex((a: GeneralCardElements) => {
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
  if (
    selected_session_indexes.year != "-1" &&
    selected_session_indexes.index != -1
  ) {
    selectedChange();
  }

  const tmp_selected = find_session(
    learning_sessions,
    store.state.event.data.id
  );
  if (
    selected_session_indexes.year == tmp_selected.year &&
    selected_session_indexes.index == tmp_selected.index
  ) {
    selected_session_indexes = {
      year: "-1",
      index: -1,
    };
    courses.cards[""] = [];
  } else {
    selected_session_indexes = tmp_selected;
    selectedChange();
    courses.cards[""] = await executeLink(
      $route.name == "announcements"
        ? "/v1/students/" +
            user.id +
            "/project_classes?session_id=" +
            learning_sessions.cards[selected_session_indexes.year][
              selected_session_indexes.index
            ].id
        : "/v1/project_classes?session_id=" +
            learning_sessions.cards[selected_session_indexes.year][
              selected_session_indexes.index
            ].id, // Da chiedere: cosa serve year
      (response: any) =>
        response.data.data.map(
          (a: MinimumCourseProps | AdminProjectClassProps) =>
            $route.name == "announcements"
              ? new MinimizedCourse(a as MinimumCourseProps).toCard(
                  // Da sistemare: finire
                  "/announcements/" +
                    (a as MinimumCourseProps).id +
                    "/" +
                    learning_sessions.cards[selected_session_indexes.year][
                      selected_session_indexes.index
                    ].id
                )
              : new AdminProjectClass(a as AdminProjectClassProps).toCard(
                  "project_courses/" +
                    (a as AdminProjectClassProps).course_id +
                    "/" +
                    (a as AdminProjectClassProps).learning_session
                )
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

const store = useStore();
const user = User.getLoggedUser() as User;
const $route = useRoute();

const promises: Promise<any>[] = [];
const learning_sessions: OrderedCardsList<GeneralCardElements> = reactive({
  order: [],
  cards: {},
});
const courses: OrderedCardsList<GeneralCardElements> = reactive({
  order: [],
  cards: {},
});
const school_years = await executeLink(
  "/v1/ordinary_classes?student_id=" + user.id,
  (response: any) => response.data.data.map((a: any) => a.school_year),
  () => []
);
const trigger = ref(0);

let selected_session_indexes: Indexes = reactive({
  year: "-1",
  index: -1,
});

for (const year of school_years) {
  promises.push(
    executeLink(
      "/v1/learning_sessions?school_year=" + year,
      async (response) => {
        learning_sessions.order.push({
          key: year,
          title: getCustomMessage("title", year),
        });
        learning_sessions.cards[year] = [];
        for (const learning_session of response.data.data) {
          learning_sessions.cards[year].push(
            await new LearningSession(learning_session).toCard(false)
          );
        }
      }
    )
  );
}
await Promise.all(promises);
</script>

<style>
</style>