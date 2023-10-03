<template>
  <div class="ion-padding-horizontal">
    <ion-modal
      id="grades_manages"
      :is-open="grades_open"
      @didDismiss="closeModal('grades')"
    >
      <suspense>
        <template #default>
          <grades-manager
            :title="grades_title"
            :parameters="grades_parameters"
            @close="closeModal('grades')"
          ></grades-manager>
        </template>
        <template #fallback>
          <loading-component />
        </template>
      </suspense>
    </ion-modal>
    <ion-modal
      :is-open="description_open"
      @didDismiss="closeModal('course_details')"
    >
      <suspense>
        <template #default>
          <course-description
            :title="description_title"
            :course_id="description_course_id"
            :learning_session_id="description_learning_session_id"
            :section="description_section"
            @close="closeModal('course_details')"
          />
        </template>
        <template #fallback>
          <loading-component />
        </template>
      </suspense>
    </ion-modal>
    <div class="ion-padding-horizontal">
      <ion-title class="ion-padding-bottom">{{
        getCurrentElement("progression")
      }}</ion-title>
      <template v-if="Array.isArray(credits_progression[selected_context])">
        <ion-list>
          <ion-item>
            <ion-label class="ion-padding-horizontal"
              >{{ getCurrentElement("context_credits") }}:</ion-label
            >
            <ion-label>{{
              castToStringArray(credits_progression[selected_context]).join("/")
            }}</ion-label>
          </ion-item>
        </ion-list>
      </template>
      <template v-else>
        <ion-title size="small" class="ion-padding-bottom"
          ><b>{{ getCurrentElement("area_credits") }}</b></ion-title
        >
        <ion-list>
          <ion-item
            v-for="area_progression in Object.keys(
              castToTmpList(credits_progression[selected_context])
            )"
            :key="area_progression"
          >
            <ion-label>{{ getAreaTitle(area_progression) }}:</ion-label>
            <ion-label>{{
              castToTmpList(credits_progression[selected_context])[
                area_progression
              ].join("/")
            }}</ion-label>
          </ion-item>
        </ion-list>
      </template>
    </div>
    <ion-grid>
      <ion-row>
        <ion-col size="auto">
          <custom-select
            v-model="selected_year"
            :list="school_years"
            :label="getCurrentElement('school_year') + ':'"
            :aria_label="getCurrentElement('school_year')"
            :placeholder="getCurrentElement('school_year_choice')"
          />
          <!-- TODO (6): aggiungere "All" -->
        </ion-col>
        <ion-col size="auto">
          <custom-select
            v-model="selected_context"
            :list="learning_contexts"
            :label="getCurrentElement('learning_context') + ':'"
            :aria_label="getCurrentElement('learning_context')"
            :placeholder="getCurrentElement('learning_context_choice')"
            :getCompleteName="getContextAcronym"
          />
        </ion-col>
      </ion-row>
    </ion-grid>
    <suspense>
      <template #default>
        <ionic-table
          :key="trigger"
          :data="tableData"
          :first_row="firstRow"
          :column_sizes="column_sizes"
          @signal_event="SetupModalAndOpen()"
        ></ionic-table>
      </template>
      <template #fallback>
        <loading-component />
      </template>
    </suspense>
  </div>
</template>

<script setup lang="ts">
import {
  CurriculumCourse,
  CustomElement,
  GradesParameters,
  LearningArea,
  LearningContext,
  Progression,
  RemainingCredits,
  TmpList,
  User,
} from "@/types";
import { executeLink, getCurrentElement, getCurrentLanguage } from "@/utils";
import {
  IonModal,
  IonGrid,
  IonRow,
  IonCol,
  IonTitle,
  IonLabel,
  IonList,
  IonItem,
} from "@ionic/vue";
import { ref, watch } from "vue";
import { useStore } from "vuex";

type availableModal = "grades" | "course_details";

const SetupModalAndOpen = () => {
  const window: availableModal = store.state.event.name;
  switch (window) {
    case "grades":
      grades_title = store.state.event.data.title;
      grades_parameters = store.state.event.data.parameters;
      grades_open.value = true;
      break;
    case "course_details":
      description_title = store.state.event.data.title;
      description_course_id = store.state.event.data.course_id;
      description_learning_session_id = store.state.event.data.learning_session_id;
      description_section = store.state.event.data.section;
      description_open.value = true;
      break;
  }
};
const closeModal = (window: availableModal) => {
  switch (window) {
    case "grades":
      grades_open.value = false;
      break;
    case "course_details":
      description_open.value = false;
  }
};
const getContextAcronym = (option: LearningContext) =>
  option[`${language}_title`];
const getYearCourses = async () => {
  year_courses = {};

  await executeLink(
    "/v2/students/" +
      reference_id +
      "/curriculum?school_year=" +
      selected_year.value, // context_id=" + selected_context.value + "&
    (response) => {
      let tmp_course: CurriculumCourse;

      for (const course of response.data.data) {
        tmp_course = new CurriculumCourse(course);
        if (year_courses[tmp_course.learning_context_id] == undefined) {
          year_courses[tmp_course.learning_context_id] = [];
        }
        year_courses[tmp_course.learning_context_id].push(tmp_course);
      }
    },
    () => []
  );

  courses = year_courses[selected_context.value] ?? [];
};
const updateTable = (
  year_correspondences: any,
  courses: CurriculumCourse[]
) => {
  for (const course of courses) {
    if (year_correspondences[selected_year.value][course.id].length > 0) {
      tableData.push(
        course.toTableRow(
          year_correspondences[selected_year.value][course.id][
            year_correspondences[selected_year.value][course.id].length - 1
          ],
          user.id
        )
      );
    }
  }
};
const getAreaTitle = (key: string) => {
  const tmp_area = learning_areas.find((a) => a.id == key);
  return tmp_area != undefined ? tmp_area[`${language}_title`] : "";
};
const castToStringArray = (obj: TmpList<string[]> | string[]) =>
  obj as string[];
const castToTmpList = (obj: TmpList<string[]> | string[]) =>
  obj as TmpList<string[]>;

const store = useStore();
const user = User.getLoggedUser() as User;
const language = getCurrentLanguage();
const props = defineProps({
  student_id: String,
});

const year_correspondences: {
  [key: number]: {
    [key: number]: number[];
  };
} = {};
const firstRow: CustomElement[] = [
  {
    id: "title",
    type: "string",
    content: getCurrentElement("course"),
  },
  {
    id: "section",
    type: "string",
    content: getCurrentElement("section"),
  },
  {
    id: "credits",
    type: "string",
    content: getCurrentElement("credits"),
  },
  {
    id: "learning_area",
    type: "string",
    content: getCurrentElement("learning_area"),
  },
  {
    id: "gardes",
    type: "string",
    content: getCurrentElement("grades"),
  },
  {
    id: "final_grade",
    type: "string",
    content: getCurrentElement("final_grade"),
  },
];
const column_sizes = [4, 1, 1, 2, 2, 2];
const grades_open = ref(false);
const description_open = ref(false);
const trigger = ref(0);
const reference_id: string =
  props.student_id != undefined && user.user != "student"
    ? props.student_id
    : "" + user.id;
const credits_progression: RemainingCredits<string[]> = {};
const selected_year = ref(0);
const selected_context = ref("");

let school_years: any[] = [];
let year_courses: {
  [key: string]: CurriculumCourse[];
} = {};
let courses: CurriculumCourse[] = [];
let grades_title: string;
let grades_parameters: GradesParameters;
let description_title: string;
let description_course_id: number;
let description_learning_session_id: number;
let description_section: string;
let learning_contexts: LearningContext[] = [];
let learning_areas: LearningArea[] = [];
let courses_list: CurriculumCourse[] = [];
let tableData: CustomElement[][] = [];

school_years =
  user.user == "student"
    ? await executeLink(
        "/v1/ordinary_classes?descending=true&student_id=" + user.id,
        (response) => {
          return response.data.data.map((a: any) => {
            return {
              id: a.school_year,
            };
          });
        },
        () => []
      )
    : await executeLink(
        "/v1/teachers/" + user.id + "/active_years",
        (response) => {
          return response.data.data.map((a: any) => {
            return {
              id: a.year,
            };
          });
        },
        () => []
      );
learning_contexts = await executeLink(
  "/v1/learning_contexts?",
  (response) => {
    const tmp_contexts = [];

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
learning_areas = await executeLink(
  "/v1/learning_areas?all_data=true",
  (response) => response.data.data,
  () => []
);

selected_year.value = school_years[0].id;
selected_context.value = learning_contexts[0].id;
await getYearCourses();

watch(selected_year, () => {
  getYearCourses();
  tableData = [];
  updateTable(year_correspondences, courses);
  trigger.value++;
});
watch(selected_context, (n) => {
  courses = year_courses[n] ?? [];
  tableData = [];
  updateTable(year_correspondences, courses);
  trigger.value++;
});

for (const context_courses of Object.values(year_courses)) {
  courses_list = courses_list.concat(context_courses);
}

await executeLink(
  "/v1/learning_sessions/correspondence?student_id=" + reference_id,
  (response) => {
    for (const correspondence of response.data.data) {
      if (year_correspondences[selected_year.value] == undefined) {
        year_correspondences[selected_year.value] = {};
      }
      if (
        year_correspondences[selected_year.value][correspondence.course_id] ==
        undefined
      ) {
        year_correspondences[selected_year.value][correspondence.course_id] =
          [];
      }
      year_correspondences[selected_year.value][correspondence.course_id].push(
        correspondence.session_id
      );
    }
  },
  () => [],
  "post",
  {
    courses: courses_list.map((a: any) => a.id),
  }
);
updateTable(year_correspondences, courses);

await executeLink(
  "/v1/students/" +
    reference_id +
    "/annual_credits?school_year=" +
    selected_year.value,
  (response) => {
    let tmp_context: string, tmp_area: string | null, tmp_status: string[];

    for (const progression of response.data.data as Progression[]) {
      tmp_context = (progression.learning_context_ref.data as { id: string })
        .id;
      tmp_area = (progression.learning_area_ref.data as { id: string | null })
        .id;
      tmp_status = [progression.credits, "" + progression.max_credits];
      if (tmp_area == null) {
        credits_progression[tmp_context] = tmp_status;
      } else {
        if (credits_progression[tmp_context] == undefined) {
          credits_progression[tmp_context] = {};
        }
        (credits_progression[tmp_context] as TmpList<string[]>)[tmp_area] =
          tmp_status;
      }
    }
  }
);
</script>

<style>
ion-modal#grades_manages {
  --width: fit-content;
  --height: fit-content;
}
</style>