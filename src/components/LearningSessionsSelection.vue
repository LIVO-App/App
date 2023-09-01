<template>
  <double-card-list />
</template>

<script setup lang="ts">
import {
  GeneralCardElements,
  LearningSession,
  OrderedCardsList,
  CourseSectionsTeachings,
  User,
  SingleCardList,
  MultipleCardList,
} from "@/types";
import { reactive, ref } from "vue";
import { useStore } from "vuex";
import { executeLink, getCurrentElement } from "@/utils";

/*const changeSelection = async () => {
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
    courses.cards = {
      teacher: [],
      associated: [],
    };
  } else {
    selected_session_indexes = tmp_selected;
    selectedChange();
  }
};*/

const store = useStore();
const user = User.getLoggedUser() as User;

const promises: Promise<any>[] = [];
const learning_sessions: SingleCardList<GeneralCardElements> = {
  title: getCurrentElement("learning_sessions"),
  emptiness_message: getCurrentElement("no_sessions"),
  cards_list: {
    order: [],
    cards: {},
  },
};
const courses: MultipleCardList<GeneralCardElements> = {
  title: getCurrentElement("courses"),
  emptiness_message: getCurrentElement("no_project_classes"),
  no_choice_message: getCurrentElement(
    "teacher_learning_session_selection_message"
  ),
  cards_lists: {},
};
const teaching_years = await executeLink(
  "/v1/teachers/" + user.id + "/active_years",
  (response: any) => response.data.data.map((a: any) => a.year),
  () => []
);

let tmp_learning_session: LearningSession;
let tmp_session_id: any;

for (const year of teaching_years) {
  promises.push(
    executeLink(
      "/v1/learning_sessions?school_year=" + year,
      async (response) => {
        learning_sessions.cards_list.order.push({
          key: year,
          title: year,
        });
        learning_sessions.cards_list.cards[year] = [];
        if (courses.cards_lists[year] == undefined) {
          courses.cards_lists[year] = [];
        }
        for (const learning_session of response.data.data) {
          tmp_learning_session = new LearningSession(learning_session);
          learning_sessions.cards_list.cards[year].push(
            await tmp_learning_session.toCard(false)
          );
          tmp_session_id = tmp_learning_session.id;
          courses.cards_lists[year].push({
            c: {
              order: [
                {
                  key: "teacher",
                  title: getCurrentElement("teacher"),
                },
                {
                  key: "associated",
                  title: getCurrentElement("associated"),
                },
              ],
              cards: {
                teacher: [],
                associated: [],
              },
            },
          });
          for (const iterator of object) {
            await executeLink(
              "/v1/teachers/" +
                user.id +
                "/my_project_classes?session_id=" +
                tmp_session_id,
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
                      tmp_classes.teacher[
                        class_teaching.id
                      ].my_teaching_refs.add(
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
                  "teacher",
                  learning_sessions.cards[selected_session_indexes.year][
                    selected_session_indexes.index
                  ].id
                )
            );
            await executeLink(
              "/v1/teachers/" +
                user.id +
                "/associated_project_classes?session_id=" +
                learning_sessions.cards[selected_session_indexes.year][
                  selected_session_indexes.index
                ].id,
              (response: any) => {
                const teaching_classes = new Set(
                  Object.keys(tmp_classes.teacher)
                );
                for (const class_teaching of response.data.data) {
                  if (!teaching_classes.has("" + class_teaching.id)) {
                    if (
                      tmp_classes.associated[class_teaching.id] == undefined
                    ) {
                      tmp_classes.associated[class_teaching.id] =
                        new CourseSectionsTeachings(class_teaching);
                    } else {
                      tmp_classes.associated[class_teaching.id].sections.add(
                        class_teaching.section
                      );
                      tmp_classes.associated[
                        class_teaching.id
                      ].my_teaching_refs.add(
                        class_teaching.teaching_ref.data.id
                      );
                    }
                  }
                }
              }
            );
            courses.cards.associated = Object.values(
              tmp_classes.associated
            ).map((a: CourseSectionsTeachings) =>
              a.toCard(
                "my_associated_teachings",
                learning_sessions.cards[selected_session_indexes.year][
                  selected_session_indexes.index
                ].id
              )
            );
          }
        }
      }
    )
  );
}
await Promise.all(promises);
</script>

<style>
</style>