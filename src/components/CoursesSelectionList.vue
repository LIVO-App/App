<template>
  <div class="ion-padding-horizontal">
    <ion-alert :is-open="openAlert" :header="alert_information.title" :message="alert_information.message"
      :buttons="alert_information.buttons" @didDismiss="closeModal('max_credits')" />
    <ion-modal :is-open="description_open" @didDismiss="closeModal('course_details')">
      <suspense>
        <template #default>
          <course-description :title="description.title" :course_id="description.course_id"
            :learning_session_id="learning_session_id" :section="description.section"
            @close="closeModal('course_details')" />
        </template>
        <template #fallback>
          <loading-component />
        </template>
      </suspense>
    </ion-modal>
    <ion-modal :is-open="confirmation_open" :can-dismiss="() => !confirmation_open">
      <ion-header>
        <ion-toolbar>
          <ion-title class="ion-text-center">
            <ionic-element :element="getCustomMessage(
              'confirmation_title',
              confirmation_data.title,
              'title',
              {
                text: {
                  name: 'primary',
                  type: 'var',
                },
              }
            )
              " />
          </ion-title>
          <ion-progress-bar v-model:value="timer_bar" :color="getBarColor" />
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-grid class="ion-text-center">
          <ion-row>
            <ion-col>
              <ionic-element :element="getCustomMessage(
                'confirmation_message',
                confirmation_data.message
              )
                " />
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <ionic-element :element="getCustomMessage(
                'confirmation_warning',
                getCurrentElement('confrimation_warning'),
                'string',
                {
                  text: {
                    name: 'warning',
                    type: 'var',
                  },
                }
              )
                " />
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col v-for="i in getNumberSequence(2)" :key="buttons[i].id">
              <ionic-element :element="buttons[i]" @signal_event="sendConfirmation()" />
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-content>
    </ion-modal>
    <suspense v-if="$route.params.id != undefined">
      <template #default>
        <session-description :key="trigger" :id="$route.params.id" :learning_context="toSummary(learning_contexts.find((a) => a.id == selected_context))
          " />
      </template>
      <template #fallback>
        <loading-component />
      </template>
    </suspense>
    <ion-grid>
      <ion-row>
        <ion-col size="auto">
          <custom-select v-model="selected_context" :list="learning_contexts"
            :label="getCurrentElement('learning_context') + ':'" :aria_label="getCurrentElement('learning_context')"
            :placeholder="getCurrentElement('learning_context_choice')" :getCompleteName="getContextAcronym" />
        </ion-col>
        <ion-col size="auto">
          <custom-select v-model="selected_area" :list="learning_areas[selected_context]" :label="learning_area + ':'"
            :aria_label="learning_area" :placeholder="placeholder" :getCompleteName="getCorrectName" />
        </ion-col>
      </ion-row>
    </ion-grid>
    <list-card :key="trigger" @execute_link="changeEnrollment()" @signal_event="openDescription()" :emptiness_message="getCustomMessage(
      'emptiness_message',
      getCurrentElement('no_proposed_courses')
    )
      " v-model:cards_list="subscriptions_manager.courses" :colors="{
    list_borders: {
      name: 'black',
      type: 'var',
    },
    text: {
      name: 'primary',
      type: 'var',
    },
  }" />
  </div>
</template>

<script setup lang="ts">
import {
  CourseCardElements,
  CourseSummaryProps,
  LearningArea,
  LearningSession,
  LearningContext,
  User,
  CustomElement,
  EventString,
  SubscriptionsManager,
} from "@/types";
import {
  executeLink,
  getCurrentElement,
  getCurrentLanguage,
  getCustomMessage,
  getLearningContexts,
  getNumberSequence,
  toSummary,
} from "@/utils";
import {
  IonAlert,
  IonModal,
  IonGrid,
  IonRow,
  IonCol,
  IonHeader,
  IonToolbar,
  IonProgressBar,
  IonContent,
  IonTitle,
} from "@ionic/vue";
import { computed, Ref, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Store, useStore } from "vuex";

type AvailableModal =
  | "course_details"
  | "max_credits"
  | "max_courses"
  | "confirmation"
  | "wrong_subscription";
//| "general_error"; //<!-- TODO (4): put general error with refresh button

const changeEnrollment = async () => {
  const requestArray = store.state.request.url.split("?"); //<!-- TODO (9): usare classe URL
  const pathArray = requestArray[0].split("/");
  const queryArray = requestArray[1].split("&");
  const course_id = queryArray[0].split("=")[1];
  const action = pathArray[pathArray.length - 1];
  const unscribe = action == "unsubscribe";
  const enrollment_availability = subscriptions_manager.checkEnrollmentAvailability(selected_context.value, selected_area.value, course_id);

  //let count;

  if (enrollment_availability.course != undefined) {
    /*count = 0;
    while ((available_courses = remaining_courses[learning_contexts[count].id][selected_area.value][tmp_course.group] - 1 >= 0) == true
      && ++count < learning_contexts.length);*/
    if (
      unscribe ||
      (enrollment_availability.available_courses && enrollment_availability.available_credits)
    ) {
      await executeLink(
        undefined,
        (response: any) => {
          const pendingDate = new Date(response.data.data ?? "no date");
          const isPending = !isNaN(pendingDate.getTime());
          const enrollment_value = isPending
            ? pendingDate
            : unscribe
              ? false
              : response.data ?? true;

          let wasPending: boolean;

          if (enrollment_availability.course != undefined) {
            wasPending = enrollment_availability.course.enrollment.isPending();
            if (!wasPending && !isPending) {
              if (store.state.static_subscription && !unscribe) {
                confirmation_data.title = (
                  enrollment_availability.course.content[1].content as EventString
                ).text;
                confirmation_data.message = getCurrentElement(
                  "course_confirmation"
                );
                confirmation_data.course = enrollment_availability.course;
                confirmation_data.unscribe = unscribe;
                confirmation_data.enrollment_value = enrollment_value;
                confirmation_data.update_credits = true;
                openConfirmation();
              } else {
                subscriptions_manager.updateCourseAndLinked(enrollment_value);
                subscriptions_manager.updateCredits(unscribe);
                trigger.value++;
              }
            } else if (store.state.static_subscription && isPending) {
              confirmation_data.title = (
                enrollment_availability.course.content[1].content as EventString
              ).text;
              confirmation_data.message = getCurrentElement("course_pending");
              confirmation_data.course = enrollment_availability.course;
              confirmation_data.enrollment_value = enrollment_value;
              confirmation_data.unscribe = unscribe;
              openConfirmation();
            } else {
              subscriptions_manager.updateCourseAndLinked(enrollment_value);
              trigger.value++;
            }
          } else {
            console.error("Course not found");
          }
        },
        () => setAlertAndOpen("wrong_subscription")
      );
    } else {
      if (!enrollment_availability.available_courses) {
        return new Promise(() => setAlertAndOpen("max_courses"));
      } else if (!enrollment_availability.available_credits) {
        return new Promise(() => setAlertAndOpen("max_credits"));
      }
    }
  } else {
    console.error("Course not found");
  }
};
const getCorrectName = (option: LearningArea) => {
  const tmp_learning_area = all_learning_areas.find(a => a.id == option.id);

  return tmp_learning_area != undefined ? tmp_learning_area[`${language}_title`] : "";
};
const setAlertAndOpen = (type: AvailableModal) => {
  switch (type) {
    case "max_credits":
      alert_information.title = getCurrentElement("error");
      alert_information.message = getCurrentElement("maximum_credits_error");
      break;
    case "max_courses":
      alert_information.title = getCurrentElement("error");
      alert_information.message = getCurrentElement("maximum_courses_error");
      break;
    case "wrong_subscription":
      alert_information.title = getCurrentElement("error");
      alert_information.message = getCurrentElement("wrong_subscription");
      break;
  }
  openAlert.value = true;
};
const closeModal = (window: AvailableModal) => {
  switch (window) {
    case "course_details":
      description_open.value = false;
      break;
    case "confirmation":
      confirmation_open.value = false;
      break;
    case "max_credits":
    case "max_courses":
      openAlert.value = false;
      break;
  }
};
const openDescription = () => {
  description.title = store.state.event.data.title;
  description.course_id = store.state.event.data.course_id;
  description.section = store.state.event.data.section;
  description_open.value = true;
};
const openConfirmation = () => {
  confirmation_open.value = true;
  timer_bar.value = 1;
  timer = setInterval(async () => {
    timer_bar.value -= 0.01;
    if (timer_bar.value <= 0) {
      await confirm(false, true);
    }
  }, 300);
};
const getContextAcronym = (option: LearningContext) =>
  option[`${language}_title`];
const sendConfirmation = async () => {
  await confirm(store.state.event.data.outcome);
};
const confirm = async (outcome: boolean, time_expired = false) => {
  clearInterval(timer);
  try {
    await executeLink(
      "/v1/students/" +
      confirmation_data.student_id +
      "/confirmation?course_id=" +
      confirmation_data.course.id +
      "&session_id=" +
      confirmation_data.session_id +
      "&outcome=" +
      outcome,
      () => {
        if (!time_expired && outcome) {
          subscriptions_manager.updateCourseAndLinked(confirmation_data.enrollment_value);
          if (confirmation_data.update_credits) {
            subscriptions_manager.updateCredits(confirmation_data.unscribe);
          }
          trigger.value++;
        }
      },
      () => setAlertAndOpen("wrong_subscription"),
      "patch"
    );
  } catch (error) {
    console.log(error);
  }
  closeModal("confirmation");
};
const getBarColor = computed(() => {
  if (timer_bar.value > 0.5) {
    return "success";
  } else if (timer_bar.value > 0.25) {
    return "warning";
  } else {
    return "danger";
  }
});

const store: Store<any> = useStore();
const $route = useRoute();
const language = getCurrentLanguage();
const user = User.getLoggedUser() as User;
const learning_session_id: string = $route.params.id as string;

const trigger = ref(0);
const learning_area = getCurrentElement("learning_area");
const placeholder =
  getCurrentElement("select") +
  (language == "italian" ? " l'" : " the ") +
  learning_area;
const openAlert = ref(false);
const alert_information = {
  title: "",
  message: "",
  buttons: [getCurrentElement("ok")],
};
const selected_area = ref("");
const description_open = ref(false);
const confirmation_open = ref(false);
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
const description = {
  title: "",
  course_id: -1,
  section: "",
};
const confirmation_data = {
  title: "",
  message: "",
  student_id: user.id,
  course: {} as CourseCardElements,
  session_id: learning_session?.id,
  unscribe: false,
  enrollment_value: false,
  update_credits: false,
};
const buttons: CustomElement[] = [
  {
    id: "yes",
    type: "string",
    linkType: "event",
    content: {
      text: getCurrentElement("yes"),
      event: "yes",
      data: {
        outcome: true,
      },
    },
    colors: {
      background: {
        name: "success",
        type: "var",
      },
      text: {
        name: "white",
        type: "var",
      },
    },
    classes: {
      label: {
        "ion-padding": true,
        radius: true,
      },
    },
  },
  {
    id: "no",
    type: "string",
    linkType: "event",
    content: {
      text: getCurrentElement("no"),
      event: "no",
      data: {
        outcome: false,
      },
    },
    colors: {
      background: {
        name: "danger",
        type: "var",
      },
      text: {
        name: "white",
        type: "var",
      },
    },
    classes: {
      label: {
        "ion-padding": true,
        radius: true,
      },
    },
  },
];
const timer_bar = ref(1);
const tmp_learning_areas: {
  [area_id: string]: LearningArea;
} = {};
const learning_areas: {
  [context_id: string]: { id: string }[];
} = {};
const subscriptions_manager = new SubscriptionsManager(); // Not ready, later there will be a loadParameters

let all_learning_areas: LearningArea[] = [];
let selected_context: Ref<string>;
let learning_contexts: LearningContext[] = [];
let tmp_courses: CourseSummaryProps[];
let timer: number;

if (learning_session != undefined) {
  learning_contexts = await getLearningContexts(user, learning_session_id);
  selected_context = ref(learning_contexts[0].id);

  for (const context of learning_contexts) {
    await executeLink(
      "/v1/learning_areas?all_data=true&credits=true&session_id=" +
      learning_session_id +
      "&context_id=" +
      context.id,
      (response) => {
        learning_areas[context.id] = response.data.data.map((a: LearningArea) => {
          return {
            id: a.id
          }
        });
        response.data.data.forEach(
          (a: LearningArea) => {
            tmp_learning_areas[a.id] = tmp_learning_areas[a.id] == null ? a : Object.assign(tmp_learning_areas[a.id], a);
          }
        );
      },
      () => []
    );
  }
  all_learning_areas = Object.values(tmp_learning_areas);
  selected_area.value = learning_areas[selected_context.value][0].id;

  if (learning_contexts.length > 0 && all_learning_areas.length > 0) {
    tmp_courses = await executeLink(
      "/v2/courses?student_id=" +
      user.id +
      "&session_id=" +
      learning_session_id,
      (response) => response.data.data,
      () => []
    );

    if (tmp_courses.length > 0) {

      await subscriptions_manager.loadParameters(user, learning_contexts, all_learning_areas, learning_sessions, tmp_courses, learning_session_id);
      subscriptions_manager.showCourses(selected_context.value, selected_area.value);

      watch(selected_area, (new_area) => {
        subscriptions_manager.showCourses(selected_context.value, new_area);
        trigger.value++;
      });
    }
  }
  watch(selected_context, (new_context) => {
    selected_area.value = learning_areas[new_context][0].id;
    if (tmp_courses.length > 0) {
      subscriptions_manager.showCourses(new_context, selected_area.value);
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