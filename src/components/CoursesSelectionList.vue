<template>
  <div class="ion-padding-horizontal">
    <ion-alert
      :is-open="openAlert"
      :header="alert_information.title"
      :message="alert_information.message"
      :buttons="alert_information.buttons"
      @didDismiss="closeModal('max_credits')"
    />
    <ion-modal
      :is-open="description_open"
      @didDismiss="closeModal('course_details')"
    >
      <suspense>
        <template #default>
          <course-description
            :title="description_title"
            :course_id="description_course_id"
            :keepContentsMounted="true"
            @close="closeModal('course_details')"
          />
        </template>
        <template #fallback>
          <loading-component />
        </template>
      </suspense>
    </ion-modal>
    <suspense v-if="$route.params.id != undefined">
      <template #default>
        <session-description
          :key="trigger"
          :id="$route.params.id"
          :learning_context="
            toSummary(learning_contexts.find((a) => a.id == selected_context))
          "
        />
      </template>
      <template #fallback>
        <loading-component />
      </template>
    </suspense>
    <ion-grid>
      <ion-row>
        <ion-col size="auto">
          <custom-select
            v-model="selected_context"
            :list="learning_contexts"
            :label="getCurrentElement('learning_context') + ':'"
            :aria_label="getCurrentElement('learning_context')"
            :placeholder="getCurrentElement('learning_context_choice')"
            :getCompleteName="getContextAxronym"
          />
        </ion-col>
        <ion-col size="auto">
          <custom-select
            v-model="selected_area"
            :list="learning_areas"
            :label="learning_area + ':'"
            :aria_label="learning_area"
            :placeholder="placeholder"
            :getCompleteName="getCorrectName"
          />
        </ion-col>
      </ion-row>
    </ion-grid>
    <list-card
      :key="trigger"
      @execute_link="changeEnrollment()"
      @signal_event="openModal()"
      :emptiness_message="
        getCustomMessage('emptiness_message', getCurrentElement('no_proposed_courses'))
      "
      v-model:cards_list="courses"
      :colors="{
        list_borders: {
          name: 'black',
          type: 'var',
        },
        text: {
          name: 'primary',
          type: 'var',
        },
      }"
    />
  </div>
</template>

<script setup lang="ts">
import {
  CardsList,
  CourseCardElements,
  CourseSummary,
  CourseSummaryProps,
  LearningArea,
  LearningSession,
  LearningSessionStatus,
  LearningContext,
  OrderedCardsList,
  RemainingCredits,
  RequestIcon,
  TmpList,
  User,
} from "@/types";
import {
  executeLink,
  getCurrentElement,
  getCurrentLanguage,
  getCustomMessage,
  toSummary,
} from "@/utils";
import { IonAlert, IonModal, IonGrid, IonRow, IonCol } from "@ionic/vue";
import { Ref, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Store, useStore } from "vuex";

type AvailableModal = "course_details" | "max_credits" | "max_courses";

const updateCourses = (course: CourseCardElements, value: Date | boolean) => {
  const contexts_to_edit = course_correspondences.filter(
    (a) => "" + a.course_id == course.id
  );
  const requestArray = (course.content[3].content as RequestIcon).url.split(
    "?"
  ) ?? ["", ""];
  const pathArray = requestArray[0].split("/");
  pathArray?.pop();

  //, edited_course : CourseCardElements;  // Da sistemare: forse problema per non aver fatto copia profonda

  for (const context_reference of contexts_to_edit) {
    if (context_reference.context_id == selected_context.value) {
      course.enrollment.enrollment = value;
      course.content[2].content = course.enrollment.toString();
      course.content[3].content = course.enrollment.getEnrollmentIcon(
        pathArray.join("/") +
          (value === false ? "/subscribe?" : "/unsubscribe?") +
          requestArray[1],
        course.enrollment.getChangingMethod()
      );
      course.content[2].colors = course.enrollment.getStatusColors();
      course.content[3].colors = course.enrollment.getChangeButtonColors();
    } else {
      course.enrollment.editable = false; // Da sistemare: chiedere se in backend, quando è presente il corso per due contesti, c'è il controllo che non sia iscritto nell'altro contesto
    }

    all_courses[context_reference.context_id][selected_area.value] =
      all_courses[context_reference.context_id][selected_area.value].filter(
        (a) => a.id != course.id
      );
    all_courses[context_reference.context_id][selected_area.value].push(course);
  }
};

const changeEnrollment = async () => {
  const requestArray = store.state.request.url.split("?");
  const pathArray = requestArray[0].split("/");
  const queryArray = requestArray[1].split("&");
  const learning_session_id = queryArray[0].split("=")[1];
  const action = pathArray[pathArray.length - 1];
  const unsubscribe = action == "unsubscribe";
  const groups = Object.keys(
    remaining_courses[selected_context.value][selected_area.value]
  );

  let count = 0;
  let tmp_course: CourseCardElements | undefined = undefined;
  let course: CourseCardElements,
    available_courses: boolean,
    available_area_credits: boolean,
    available_context_credits;

  while (tmp_course == undefined && count < groups.length) {
    tmp_course = courses.cards[groups[count]].find(
      (c) => c.id == "" + learning_session_id
    );
    count++;
  }

  if (tmp_course != undefined) {
    course = tmp_course;
    available_courses =
      remaining_courses[selected_context.value][selected_area.value][
        tmp_course.group
      ] -
        1 >=
      0;
    available_area_credits =
      typeof remaining_credits[selected_context.value] == "number" &&
      (remaining_credits[selected_context.value] as number) >= course.credits;
    available_context_credits =
      (remaining_credits[selected_context.value] as TmpList<number>)[
        selected_area.value
      ] >= course.credits;
    if (
      unsubscribe ||
      (available_courses && available_area_credits) ||
      (available_courses && available_context_credits)
    ) {
      await executeLink(
        undefined,
        (response: any) => {
          const pendingDate = new Date(response.data.data ?? "no date");
          const wasPending = course.enrollment.isPending();
          const isPending = !isNaN(pendingDate.getTime());

          updateCourses(
            course,
            isPending
              ? pendingDate
              : unsubscribe
              ? false
              : response.data ?? true
          );
          if (!wasPending && !isPending) {
            remaining_courses[selected_context.value][selected_area.value][
              course.group
            ] += unsubscribe ? 1 : -1;
            if (typeof remaining_credits[selected_context.value] == "number") {
              (remaining_credits[selected_context.value] as number) +=
                (unsubscribe ? 1 : -1) * course.credits;
            } else {
              (remaining_credits[selected_context.value] as TmpList<number>)[
                selected_area.value
              ] += (unsubscribe ? 1 : -1) * course.credits;
            }
          }
          trigger.value++;
        },
        (err) => console.error(err)
      );
    } else {
      if (!available_courses) {
        return new Promise(() => setAlertAndOpen("max_courses"));
      } else {
        return new Promise(() => setAlertAndOpen("max_credits"));
      }
    }
  } else {
    console.error("Course not found");
  }
};
const getCorrectName = (option: LearningArea) => option[`${language}_title`];
const setAlertAndOpen = (type: AvailableModal) => {
  switch (type) {
    case "max_credits":
      alert_information.message = getCurrentElement("maximum_credits_error");
      break;
    case "max_courses":
      alert_information.message = getCurrentElement("maximum_courses_error");
      break;
  }
  openAlert.value = true;
};
const closeModal = (window: AvailableModal) => {
  switch (window) {
    case "course_details":
      description_open.value = false;
      break;
    case "max_credits":
    case "max_courses":
      openAlert.value = false;
      break;
  }
};
const openModal = () => {
  description_title = store.state.event.data.title;
  description_course_id = store.state.event.data.course_id;
  description_open.value = true;
};
const getContextAxronym = (option: LearningContext) =>
  option[`${language}_title`];
const showCourses = (
  context = selected_context.value,
  area = selected_area.value
) => {
  courses.cards = {};
  courses.order = [];
  for (const course of (all_courses[context] != undefined ? all_courses[context][area] : [])) {
    if (courses.cards[course.group] == undefined) {
      courses.order.push({
        key: course.group,
        title: getCustomMessage(
          "title",
          getCurrentElement("group") + " " + course.group
        ),
      });
      courses.cards[course.group] = [];
    }
    courses.cards[course.group].push(course);
  }
  if (Object.keys(courses.cards).length == 0) {
    courses.cards[""] = [];
  }
};

const store: Store<any> = useStore();
const $route = useRoute();
const language = getCurrentLanguage();
const user = User.getLoggedUser() as User;
const learning_session_id: string = $route.params.id as string;

const all_courses: {
  [key: string]: CardsList<CourseCardElements>;
} = {}; // Da sistemare: aggiungere gruppo (gruppi come group e controlli in nuova variabile)
const courses: OrderedCardsList<CourseCardElements> = {
  order: [],
  cards: {},
};
const trigger = ref(0);
const remaining_credits: RemainingCredits<number> = {};
const learning_area = getCurrentElement("learning_area");
const placeholder =
  getCurrentElement("select") +
  (language == "italian" ? " l'" : " the ") +
  learning_area;
const openAlert = ref(false);
const alert_information = {
  title: getCurrentElement("error"),
  message: "",
  buttons: [getCurrentElement("ok")],
};
const selected_area = ref("");
const description_open = ref(false);
const remaining_courses: {
  [key: string]: {
    // Learning context
    [key: string]: {
      // Learning Area
      [key: number]: number; // Group
    };
  };
} = {};
const learning_sessions: LearningSession[] = await executeLink(
  "/v1/learning_sessions?year_of=" + learning_session_id,
  (response) => response.data.data.map((a: any) => new LearningSession(a)),
  () => []
);
const learning_session_position = learning_sessions.findIndex(
  (a) => a.id == parseInt(learning_session_id)
);
const learning_session =
  learning_session_position != -1
    ? learning_sessions[learning_session_position]
    : undefined;

let learning_areas: LearningArea[] = [];
let description_title: string;
let description_course_id: number;
let selected_context: Ref<string>;
let learning_contexts: LearningContext[] = [];
let tmp_courses: CourseSummaryProps[];
let courses_ids: number[];
let course_correspondences: {
  course_id: number;
  context_id: string;
}[];
let tmp_card;

if (learning_session != undefined) {
  learning_contexts = await executeLink(
    "/v1/learning_contexts?student_id=" +
      user.id +
      "&session_id=" +
      learning_session_id,
    (response) => {
      const tmp_contexts: LearningContext[] = [];

      for (const learning_context of response.data.data) {
        if (
          store.state.excluded_learning_contexts_id.findIndex(
            (a: number) => a != learning_context.id
          ) != -1
        ) {
          tmp_contexts.push(learning_context);
        }
      }

      return tmp_contexts;
    },
    () => []
  );
  selected_context = ref(learning_contexts[0].id);

  learning_areas = await executeLink(
    "/v1/learning_areas?all_data=true&credits=true&session_id=" +
      learning_session_id,
    (response) => response.data.data,
    () => []
  );
  selected_area.value = learning_areas.length > 0 ? learning_areas[0].id : "";

  if (learning_contexts.length > 0 && learning_areas.length > 0) {
    tmp_courses = await executeLink(
      "/v2/courses?student_id=" +
        user.id +
        "&session_id=" +
        learning_session_id,
      (response) => response.data.data,
      () => []
    );

    if (tmp_courses.length > 0) {
      courses_ids = tmp_courses.map((a: CourseSummaryProps) => a.id);

      await executeLink(
        "/v1/learning_contexts/correspondence?student_id=" +
          user.id +
          "&session_id=" +
          learning_session_id,
        (response) => {
          let course_props,
            tmp_course: CourseSummary,
            tmp_learning_area: LearningArea | undefined,
            open_enrollment,
            learning_context_index,
            tmp_learning_context: LearningContext;

          course_correspondences = response.data.data;
          for (const correspondence of course_correspondences) {
            course_props = tmp_courses.find(
              (a) => a.id == correspondence.course_id
            );
            learning_context_index = learning_contexts.findIndex(
              (a) => a.id == correspondence.context_id
            );
            if (course_props != undefined && learning_context_index != -1) {
              tmp_learning_context = learning_contexts[learning_context_index];
              tmp_course = new CourseSummary(course_props);
              tmp_learning_area = learning_areas.find(
                (a) =>
                  a.id ==
                  (tmp_course.learning_area_ref.data as { id: string }).id
              );
              if (tmp_learning_area != undefined) {
                if (all_courses[tmp_learning_context.id] == undefined) {
                  remaining_courses[tmp_learning_context.id] = {};
                  all_courses[tmp_learning_context.id] = {};
                  for (const learning_area of learning_areas) {
                    remaining_courses[tmp_learning_context.id][
                      learning_area.id
                    ] = {};
                    all_courses[tmp_learning_context.id][learning_area.id] = [];
                  }
                }
                if (
                  remaining_courses[tmp_learning_context.id][
                    tmp_learning_area.id
                  ][tmp_course.group] == undefined
                ) {
                  remaining_courses[tmp_learning_context.id][
                    tmp_learning_area.id
                  ][tmp_course.group] = store.state.courses_per_group;
                }
                open_enrollment =
                  learning_session?.getStatus() ==
                    LearningSessionStatus.FUTURE &&
                  (learning_session_position == 0 ||
                    learning_sessions[
                      learning_session_position - 1
                    ]?.getStatus() == LearningSessionStatus.CURRENT);
                tmp_card = tmp_course.toCard(
                  learning_session as LearningSession,
                  open_enrollment
                    ? "/v1/students/" +
                        user.id +
                        "/" +
                        (tmp_course.pending !== "false"
                          ? "unsubscribe"
                          : "subscribe") +
                        "?course_id=" +
                        tmp_course.id +
                        "&session_id=" +
                        learning_session_id +
                        "&context_id=" +
                        tmp_learning_context.id
                    : undefined,
                  undefined,
                  open_enrollment
                );
                remaining_courses[tmp_learning_context.id][
                  tmp_learning_area.id
                ][tmp_course.group] -= tmp_card.enrollment.enrollment ? 1 : 0;
                all_courses[tmp_learning_context.id][tmp_learning_area.id].push(
                  tmp_card
                );
                if (tmp_learning_context.credits != null) {
                  if (remaining_credits[tmp_learning_context.id] == undefined) {
                    remaining_credits[tmp_learning_context.id] =
                      tmp_learning_context.credits;
                  }
                  if (tmp_course.pending === "true") {
                    (remaining_credits[tmp_learning_context.id] as number) -=
                      tmp_course.credits;
                  }
                  //remaining_credits[tmp_learning_context.id] = tmp_courses.reduce((a,b) => b.pending === "true" && b.learning_context_id == tmp_learning_context.id ? a - b.credits : a,tmp_learning_context.credits);
                } else {
                  if (remaining_credits[tmp_learning_context.id] == undefined) {
                    remaining_credits[tmp_learning_context.id] = {};
                  }
                  if (
                    (
                      remaining_credits[
                        tmp_learning_context.id
                      ] as TmpList<number>
                    )[tmp_learning_area.id] == undefined
                  ) {
                    (
                      remaining_credits[
                        tmp_learning_context.id
                      ] as TmpList<number>
                    )[tmp_learning_area.id] =
                      tmp_learning_area.credits as number;
                  }
                  if (tmp_course.pending === "true") {
                    (
                      remaining_credits[
                        tmp_learning_context.id
                      ] as TmpList<number>
                    )[tmp_learning_area.id] -= tmp_course.credits;
                  }
                  //(remaining_credits[tmp_learning_context.id] as TmpList<number>)[tmp_learning_area.id] = tmp_courses.reduce((a,b) => b.pending === "true" ? a - b.credits : a,tmp_learning_area.credits);
                }
              }
            }
          }
        },
        (err) => console.error(err),
        "post",
        {
          courses: courses_ids,
        }
      );
      showCourses();

      watch(selected_area, (new_area) => {
        showCourses(selected_context.value, new_area);
        trigger.value++;
      });
    }
  }
  watch(selected_context, (new_context) => {
    if (tmp_courses.length > 0) {
      showCourses(new_context);
    }
    trigger.value++;
  });
}
</script>

<style scoped>
ion-select {
  width: fit-content;
}
.modal {
  --height: auto;
}
</style>