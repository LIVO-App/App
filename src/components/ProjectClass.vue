<template>
  <div class="ion-padding-horizontal">
    <!-- TODO (5): Mettere alert in App.vue -->
    <ion-alert :is-open="alert_open" :header="alert_information.title" :message="alert_information.message"
      :buttons="alert_information.buttons" @didDismiss="closeModal(store.state.event.event)" />
    <ion-modal id="grades_manages" :is-open="grades_open" @didDismiss="closeModal('grades')" class="grades_modal">
      <suspense>
        <template #default>
          <grades-manager :title="grades_title" :parameters="grades_parameters" :grades="student_grades"
            :final_grade_index="student_final_grade_index" @close="closeModal('grades')" @signal_event="manageEvent()" />
        </template>
        <template #fallback>
          <loading-component />
        </template>
      </suspense>
    </ion-modal>
    <ion-modal :is-open="description_open" @didDismiss="closeModal('course_details')">
      <suspense>
        <template #default>
          <course-description :title="description_title" :course_id="description_course_id"
            :learning_session_id="session_id" :section="selected_section" @close="closeModal('course_details')" />
        </template>
        <template #fallback>
          <loading-component />
        </template>
      </suspense>
    </ion-modal>
    <div>
      <ionic-element v-for="button in buttons" :key="button.id" :element="button" @signal_event="setupModalAndOpen()"
        @execute_link="$router.push(store.state.request.url)" />
    </div>
    <template
      v-if="user.user == 'admin' && learning_session != undefined && project_class != undefined && (learning_session_status == LearningSessionStatus.UPCOMING || learning_session_status == LearningSessionStatus.FUTURE)">
      <template v-if="project_class.final_confirmation == undefined">
        <ionic-element :element="getCustomMessage('project_class_status',
          getCurrentElement('project_class_status') + ':'
          + (learning_session_status != LearningSessionStatus.UPCOMING ? ' ' + getCurrentElement('not_confirmed') : ''),
          'string', undefined, {
          label: {
            'ion-padding-end': true,
          }
        })" />
        <ion-button v-if="learning_session_status == LearningSessionStatus.UPCOMING" @click="() => {
          store.state.event.event = 'confirmation';
          setupModalAndOpen();
        }">
          {{ getCurrentElement("confirm") }}
        </ion-button>
      </template>
      <template v-else>
        <ionic-element :element="getCustomMessage('project_class_confirmation_date',
          getCurrentElement('project_class_confirmation_date') + ': '
          + toDateString(project_class.final_confirmation))" />
      </template>
    </template>
    <custom-select v-if="sections_use" v-model="selected_section" :list="sections"
      :label="getCurrentElement('section') + ':'" :aria_label="getCurrentElement('section')"
      :placeholder="getCurrentElement('section_choice')"></custom-select>
    <suspense>
      <template #default>
        <ionic-table :key="students_trigger" :data="table_data" :first_row="firstRow" :column_sizes="column_sizes"
          @signal_event="setupModalAndOpen()" />
      </template>
      <template #fallback>
        <loading-component />
      </template>
    </suspense>
  </div>
</template>

<script setup lang="ts">
import {
  AlertInformation,
  CustomElement,
  Grade,
  GradeProps,
  GradesParameters,
  Student,
  User,
  LearningSession,
  LearningSessionStatus,
  Course,
  AdminProjectClass,
} from "@/types";
import { executeLink, getCurrentElement, getCurrentLanguage, getCustomMessage, getIcon, toDateString } from "@/utils";
import { IonModal, IonAlert, AlertButton, IonButton } from "@ionic/vue";
import { ref, watch } from "vue";
import { useStore } from "vuex";

type AvailableModal =
  | "grades"
  | "course_details"
  | "empty_descriptions"
  | "edit_grade"
  | "remove_grade"
  | "confirmation"
  | "success"
  | "error";

const setupModalAndOpen = (window?: AvailableModal, message?: string) => {
  const actual_window: AvailableModal = window ?? store.state.event.event;
  const actual_message: string = message ?? store.state.event.message;

  let count = 0,
    tmp_grade: Grade;

  switch (actual_window) {
    case "grades":
      grades_title = store.state.event.data.title;
      grades_parameters = {
        ...store.state.event.data.parameters,
        associated_teacher: associated_teacher,
      };
      student_grades = grades[grades_parameters.student_id];
      student_final_grade_index = final_grades_indexes[grades_parameters.student_id];
      grades_open.value = true;
      break;
    case "remove_grade":
      while ((grade_index.index = grades[
        (grade_index.student_id = students[count].id)
      ].findIndex(a => a.id == store.state.event.data.id)) == -1 && ++count < Object.keys(grades).length);

      if (grade_index.student_id != -1 && grade_index.index != -1) {
        tmp_grade = grades[grade_index.student_id][grade_index.index];
        alert_information.title = "";
        alert_information.message = getCurrentElement("remove_grade_confirmation")
          + (grade_index != undefined ? "\n" + getCurrentElement("description") + ": " + tmp_grade[`${language}_description`] + "\n"
            + getCurrentElement("grade") + ": " + tmp_grade.grade + " [" + getCurrentElement("final") + "]" : "");
        alert_information.buttons = [handled_buttons[0], getCurrentElement("no")];
        alert_open.value = true;
      } else {
        setupError();
        alert_open.value = true;
      }
      break;
    case "empty_descriptions":
      alert_information.title = getCurrentElement("error");
      alert_information.message = getCurrentElement("empty_descriptions");
      alert_information.buttons = [getCurrentElement("ok")];
      alert_open.value = true;
      break;
    case "course_details":
      description_title = store.state.event.data.title;
      description_course_id = store.state.event.data.course_id;
      description_open.value = true;
      break;
    case "confirmation":
      alert_information.title = getCurrentElement("project_class_confirmation");
      alert_information.message = getCurrentElement("project_class_confirmation_question");
      alert_information.buttons = [handled_buttons[0], getCurrentElement("no")];
      alert_open.value = true;
      break;
    case "success":
      alert_information.title = "";
      alert_information.message = getCurrentElement("project_class_successful_confirmation");
      alert_information.buttons = [getCurrentElement("ok")];
      alert_open.value = true;
      break;
    case "error":
      setupError(actual_message);
      alert_open.value = true;
      break;
  }
};
const closeModal = (window: AvailableModal) => {
  switch (window) {
    case "grades":
      grades_open.value = false;
      break;
    case "course_details":
      description_open.value = false;
      break;
    case "empty_descriptions":
    case "remove_grade":
    case "edit_grade":
    case "confirmation":
    case "success":
    case "error":
      alert_open.value = false;
      break;
  }
};
const add_grade = async () => { //<!-- ! (2): Impedire ad insegnanti associati di aggiungere e aggiungere modifica e eliminazione voto
  const data = store.state.event.data;

  executeLink(
    "/v1/students/" +
    data.student_id +
    "/grades?course_id=" +
    data.course_id +
    "&session_id=" +
    data.session_id,
    (response) => {
      let student_pos: number;

      grades[data.student_id].push(new Grade({
        id: response.data.value.id,
        publication: response.data.value.publication,
        italian_description: data.italian_description,
        english_description: data.english_description,
        grade: data.grade,
        final: data.final ? 1 : 0,
      }));
      if (data.final == true) {
        final_grades_indexes[data.student_id] = grades[data.student_id].length;
        student_pos = table_data.findIndex(
          (a: CustomElement[]) => a[0].id == data.student_id + "_name_surname"
        );
        table_data[student_pos][table_data[student_pos].length - 1].content =
          data.grade;
          students_trigger.value++;
      }
    },
    (err) => console.error(err),
    "post", {
    ita_description: data.italian_description,
    eng_description: data.english_description,
    publication_date: data.publication_date,
    grade: data.grade,
    final: data.final,
  }
  );
};

const updateStudents = async () => {
  students = await executeLink(
    "/v1/project_classes/" +
    course_id +
    "/" +
    session_id +
    "/components?section=" +
    selected_section.value +
    (user.user == "teacher" ? "&teacher_id=" + user.id : ""),
    (response) => {
      const tmp_students: Student[] = [];

      associated_teacher = response.data.data.associated_teacher;
      response.data.data.components.map((a: any) => {
        tmp_students.push(new Student(a));
      });

      return tmp_students;
    },
    () => []
  );

  table_data = [];
  for (const student of students) { //<!-- TODO (5): controllare se ci sono più professori e fare richieste voti solamente sul pulsante (evitare problema di professore che aggiunge mentre altro è nella pagina)
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
          response.data.data.map((a: GradeProps, i: number) => {
            const tmp_grade = new Grade(a);
            if (tmp_grade.final) {
              final_grades_indexes[student.id] = i;
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
        grades[student.id][final_grades_indexes[student.id]]
      )
    );
  }
};
const manageEvent = () => {
  /*switch (store.state.event as AvailableModal) {
    case "add_grade":
      add_grade();
      break;
    case 
    default:
      break;
  }*/
  if (store.state.event.event == "add_grade") {
    add_grade();
  } else {
    setupModalAndOpen();
  }
};
const yes_handler = () => {
  switch (store.state.event.event) {
    case "confirmation":
      if (course != undefined && project_class != undefined) {
        if (table_data.length < course.min_students || table_data.length > course.max_students) {
          setTimeout(() => setupModalAndOpen("error", "students_number_error"), 300);
        } else if (learning_session_status != LearningSessionStatus.UPCOMING) {
          setTimeout(() => setupModalAndOpen("error", "learning_session_not_upcoming"), 300);
        } else if (project_class.final_confirmation != undefined) {
          setTimeout(() => setupModalAndOpen("error", "project_class_already_confirmed"), 300);
        } else {
          executeLink("/v1/project_classes/" + course_id + "/" + session_id + "/final_confirmation",
            (response) => {
              (project_class as AdminProjectClass).final_confirmation = response.data.confirmation_date != undefined ? new Date(response.data.confirmation_date) : new Date();
              setTimeout(() => setupModalAndOpen("success"), 300);
            },
            () => setTimeout(() => setupModalAndOpen("error"), 300),
            "put");
        }
      } else {
        setTimeout(() => setupModalAndOpen("error"), 300);
      }
      break;
    case "remove_grade":
      if (learning_session != undefined) {
        if (associated_teacher) {
          setTimeout(() => setupModalAndOpen("error", "no_grade_remotion_permissions"), 300);
        } else if (!grades[grade_index.student_id][grade_index.index].isEditable(grades[grade_index.student_id][final_grades_indexes[grade_index.student_id]].publication)) {
          setTimeout(() => setupModalAndOpen("error", "cannot_remove_grade"), 300);
        } else {
          executeLink("/v1/grades/" + store.state.event.data.id,
            () => {
              grades[grade_index.student_id].splice(grade_index.index,1);
              store.state.triggers.grades++;
            },
            () => setTimeout(() => setupModalAndOpen("error"), 300),
            "delete");
        }
      } else {
        setTimeout(() => setupModalAndOpen("error"), 300);
      }
      break;
  }
};
const setupError = (message?: string) => {
  alert_information.title = getCurrentElement("error");
  alert_information.message = getCurrentElement(message ?? "general_error");
  alert_information.buttons = [getCurrentElement("ok")];
}

const store = useStore();
const user = User.getLoggedUser() as User;
const sections_use: boolean = store.state.sections_use;
const language = getCurrentLanguage();

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
const course_id = divided_path[divided_path.length - 2]; //<!-- TODO (5): usare $route
const session_id = divided_path[divided_path.length - 1];
const students_trigger = ref(0);
const grades: {
  [student_id: string]: Grade[]
} = {};
const final_grades_indexes: {
  [student_id: string]: number,
} = {};
const alert_open = ref(false);
const alert_information: AlertInformation = {
  title: "",
  message: "",
  buttons: [],
};
const sections: { id: string }[] = [];
const tmp_sections: Set<string> = new Set();
const buttons: CustomElement[] = [
  {
    id: "announcements",
    type: "icon",
    linkType: "request",
    content: {
      url: "/announcements/" + course_id + "/" + session_id, //<!-- ? vedere se anche admin può vedere e/o mandare messaggi
      method: "get",
      icon: getIcon("mail"),
    },
  },
  {
    id: "course_details",
    type: "icon",
    linkType: "event",
    content: {
      event: "course_details",
      data: {
        title: "", //<!-- TODO (4): mettere titolo quando ce l'avrà anche la pagina
        course_id: parseInt(course_id),
      },
      icon: getIcon("information_circle"),
    },
  },
];
const selected_section = ref("");
const handled_buttons: AlertButton[] = [{
  text: getCurrentElement("yes"),
  handler: yes_handler,
}];
const grade_index = {
  student_id: -1,
  index: -1,
};
const learning_session: LearningSession | undefined = await executeLink(
  "/v1/learning_sessions/" + session_id,
  (response) => new LearningSession(response.data.data),
  () => undefined
);

let table_data: CustomElement[][] = [];
let grades_title: string;
let grades_parameters: GradesParameters;
let student_grades: Grade[] | undefined;
let student_final_grade_index: number;
let description_title: string;
let description_course_id: GradesParameters;
let associated_teacher: boolean | undefined;
let learning_session_status: LearningSessionStatus | undefined;
let course: Course | undefined;
let project_class: AdminProjectClass | undefined;
let students: Student[] = [];

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
  course = await executeLink(
    "/v1/courses/" + course_id,
    (response) => new Course(response.data.data),
    () => undefined
  );
  learning_session_status = learning_session != undefined ? learning_session.getStatus() : undefined;
  project_class = await executeLink(
    "/v1/project_classes/" + course_id + "/" + session_id,
    (response) => new AdminProjectClass(response.data.data),
    () => undefined
  );
}
if (sections.length > 0) {
  selected_section.value = sections[0].id;
}

await updateStudents();
watch(selected_section, async () => {
  await updateStudents();
  students_trigger.value++;
});
</script>

<style>
ion-modal#grades_manages {
  --width: 90%;
  --height: fit-content;
}
</style>