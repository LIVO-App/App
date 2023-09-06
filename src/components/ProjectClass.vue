<template>
  <div class="ion-padding-horizontal">
    <ion-alert
      :is-open="alert_open"
      :header="alert_information.title"
      :message="alert_information.message"
      :buttons="alert_information.buttons"
      @didDismiss="closeModal(store.state.event.name)"
    ></ion-alert>
    <ion-modal
      id="grades_manages"
      :is-open="grades_open"
      @didDismiss="closeModal('grades')"
      class="grades_modal"
    >
      <suspense>
        <template #default>
          <grades-manager
            :title="grades_title"
            :parameters="grades_parameters"
            :grades="student_grades"
            @close="closeModal('grades')"
            @signal_event="checkAndAdd()"
          />
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
            @close="closeModal('course_details')"
          ></course-description>
        </template>
        <template #fallback>
          <loading-component />
        </template>
      </suspense>
    </ion-modal>
    <div>
      <ionic-element
        v-for="button in buttons"
        :key="button.id"
        :element="button"
        @signal_event="setupModalAndOpen()"
        @execute_link="$router.push(store.state.request.url)"
      />
    </div>
    <custom-select
      v-model="selected_section"
      :list="sections"
      :label="getCurrentElement('section') + ':'"
      :aria_label="getCurrentElement('section')"
      :placeholder="getCurrentElement('section_choice')"
    ></custom-select>
    <suspense>
      <template #default>
        <ionic-table
          :key="trigger"
          :data="table_data"
          :first_row="firstRow"
          :column_sizes="column_sizes"
          @signal_event="setupModalAndOpen()"
        />
      </template>
      <template #fallback>
        <loading-component />
      </template>
    </suspense>
  </div>
</template>

<script setup lang="ts">
import {
  CustomElement,
  Grade,
  GradeProps,
  GradesParameters,
  Student,
  User,
} from "@/types";
import { executeLink, getCurrentElement, getIcon } from "@/utils";
import { IonModal, IonAlert } from "@ionic/vue";
import { ref, watch } from "vue";
import { useStore } from "vuex";

type AvailableModal =
  | "grades"
  | "course_details"
  | "empty_descriptions"
  | "grade_value_error";

const setupModalAndOpen = () => {
  const window: AvailableModal = store.state.event.name;

  switch (window) {
    case "grades":
      grades_title = store.state.event.data.title;
      grades_parameters = store.state.event.data.parameters;
      student_grades = grades[grades_parameters.student_id];
      grades_open.value = true;
      break;
    case "empty_descriptions":
      alert_information.message = getCurrentElement("empty_descriptions");
      alert_open.value = true;
      break;
    case "grade_value_error":
      alert_information.message = getCurrentElement("grade_value_error");
      alert_open.value = true;
      break;
    case "course_details":
      description_title = store.state.event.data.title;
      description_course_id = store.state.event.data.course_id;
      description_open.value = true;
      break;
  }
};
const closeModal = (window: AvailableModal) => {
  switch (window) {
    case "grades":
      grades_open.value = false;
      break;
    case "empty_descriptions":
    case "grade_value_error":
      alert_open.value = false;
      break;
    case "course_details":
      description_open.value = false;
  }
};
const add_grade = async () => {
  const data = store.state.event.data;

  executeLink(
    "/v1/students/" +
      data.student_id +
      "/grades?teacher_id=" +
      data.teacher_id +
      "&course_id=" +
      data.course_id +
      "&session_id=" +
      data.session_id +
      "&ita_description=" +
      data.italian_description + // Da chiedere: cambiare lingue con parole intere
      "&eng_description=" +
      data.english_description +
      "&grade=" +
      data.grade +
      "&final=" +
      data.final,
    (response) => {
      let student_pos: number;

      grades[data.student_id].push(new Grade(response.data.value));
      if (data.final == true) {
        student_pos = table_data.findIndex(
          (a: CustomElement[]) => a[0].id == data.student_id + "_name_surname"
        );
        table_data[student_pos][table_data[student_pos].length - 1].content =
          data.grade;
        trigger.value++;
      }
    },
    (err) => console.error(err),
    "post"
  );
};

const updateStudents = async () => {
  const students: Student[] = await executeLink(
    "/v1/project_classes/" +
      course_id +
      "/" +
      session_id +
      "/components?section=" +
      selected_section.value +
      (user.user == "teacher" ? "&teacher_id=" + user.id : ""), //Da sistemare: creare link per pagina per gestire assoc_class e togliere teacher_id
    (response) => response.data.data.map((a: any) => new Student(a)),
    () => []
  );

  table_data = [];
  for (const student of students) {
    final_grade = undefined;
    if (user.user == "teacher") {
      grades[student.id] = await executeLink(
        "/v1/students/" +
          student.id +
          "/grades?course_id=" +
          course_id +
          "&session_id=" +
          session_id +
          "&teacher_id=" +
          user.id,
        (response: any) =>
          response.data.data.map((a: GradeProps) => {
            const tmp_grade = new Grade(a);
            if (tmp_grade.final) {
              final_grade = tmp_grade;
            }
            return tmp_grade;
          }),
        () => []
      );
    }
    table_data.push(
      student.toTableRow(
        course_id,
        session_id,
        user.user == "teacher" ? user.id : undefined,
        user.user == "teacher",
        final_grade
      )
    );
  }
};
const checkAndAdd = () => {
  if (store.state.event.name == "add_grade") {
    add_grade();
  } else {
    setupModalAndOpen();
  }
};

const store = useStore();
const user = User.getLoggedUser() as User;

const firstRow: CustomElement[] = [
  {
    id: "student",
    type: "string",
    content: getCurrentElement("student"),
  },
  {
    id: "learning_context",
    type: "string",
    content: getCurrentElement("learning_context"),
  },
  {
    id: "class",
    type: "string",
    content: getCurrentElement("class"),
  },
];
const column_sizes = [5, 2, 1, 2, 2];
const grades_open = ref(false);
const description_open = ref(false);
const divided_path = window.location.pathname.split("/");
const course_id = divided_path[divided_path.length - 2];
const session_id = divided_path[divided_path.length - 1];
const trigger = ref(0);
const grades: {
  [key: string]: Grade[];
} = {};
const alert_open = ref(false);
const alert_information = {
  title: getCurrentElement("error"),
  message: "",
  buttons: [getCurrentElement("ok")],
};
const sections: { id: string }[] = [];
const tmp_sections: Set<string> = new Set();
const buttons: CustomElement[] = [
  {
    id: "announcements",
    type: "icon",
    linkType: "request",
    content: {
      url: "/announcements/" + course_id + "/" + session_id, // Da sistemare: vedere se anche admin può vedere e/o mandare messaggi
      method: "get",
      icon: getIcon("mail"), // Da sistemare: mettere in alto e fare popup
    },
  },
  {
    id: "course_details",
    type: "icon",
    linkType: "event",
    content: {
      event: "course_details",
      data: {
        title: "", // Da sistemare: mettere titolo quando ce l'avrà anche la pagina
        course_id: parseInt(course_id),
      },
      icon: getIcon("information_circle"),
    },
  },
];
const selected_section = ref("");

let table_data: CustomElement[][] = [];
let grades_title: string;
let grades_parameters: GradesParameters;
let final_grade: Grade | undefined;
let student_grades: Grade[] | undefined;
let description_title: string;
let description_course_id: GradesParameters;

if (user.user == "teacher") {
  firstRow.push(
    {
      id: "gardes",
      type: "string",
      content: getCurrentElement("grades"),
    },
    {
      id: "final_grade",
      type: "string",
      content: getCurrentElement("final_grade"),
    }
  );
  await executeLink(
    "/v2/teachers/" +
      user.id +
      "/my_project_classes?session_id=" +
      session_id +
      "&course_id=" +
      course_id,
    (response) =>
      response.data.data.map((a: any) => tmp_sections.add(a.section))
  );
  await executeLink(
    "/v2/teachers/" +
      user.id +
      "/associated_project_classes?session_id=" +
      session_id +
      "&course_id=" +
      course_id,
    (response) =>
      response.data.data.map((a: any) => tmp_sections.add(a.section))
  );
  for (const section of tmp_sections) {
    sections.push({
      id: section,
    });
  }
} else {
  firstRow.push({
    id: "edit",
    type: "string",
    content: getCurrentElement("edit"),
  });
  await executeLink(
    "/v1/project_classes/" + course_id + "/" + session_id + "/sections",
    (response) =>
      response.data.data.map((a: any) =>
        sections.push({
          id: a.section,
        })
      )
  );
}
selected_section.value = sections[0].id;

await updateStudents();
watch(selected_section, async () => {
  await updateStudents();
  trigger.value++;
});
</script>

<style>
ion-modal#grades_manages {
  --width: 75%;
  --height: fit-content;
}
</style>