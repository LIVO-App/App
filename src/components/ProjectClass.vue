<template>
  <div class="ion-padding-horizontal">
    <!-- TODO (5): Mettere alert in App.vue -->
    <ion-alert :is-open="alert_open" :header="alert_information.title" :message="alert_information.message"
      :buttons="alert_information.buttons" @didDismiss="closeModal(store.state.event.event)" />
    <ion-modal id="grades_manages" :is-open="grades_open" @didDismiss="closeModal('grades')" class="grades_modal">
      <suspense>
        <template #default>
          <grades-manager :title="grades_title" :parameters="grades_parameters" :grades="student_grades"
            @close="closeModal('grades')" @signal_event="manageEvent()" />
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
      :placeholder="getCurrentElement('section_choice')" />
    <suspense>
      <template #default>
        <div class="ion-padding-top">
          <ionic-table v-if="table_data.length > 0" :key="students_trigger" :data="table_data" :first_row="first_row" :column_sizes="column_sizes"
            @signal_event="setupModalAndOpen()" />
          <ionic-element v-else :element="getCustomMessage('emptiness_message',getCurrentElement('no_students'))" />
        </div>
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
import { executeLink, getAviableLanguages, getCurrentElement, getCustomMessage, getIcon, toDateString } from "@/utils";
import { IonModal, IonAlert, AlertButton, IonButton } from "@ionic/vue";
import { ref, watch } from "vue";
import { useStore } from "vuex";

type AvailableModal =
  | "grades"
  | "course_details"
  | "empty_descriptions"
  | "edit_grade"
  | "remove_grade"
  | "move_student"
  | "remove_student"
  | "confirmation"
  | "success"
  | "error";

const setupModalAndOpen = (window?: AvailableModal, message?: string) => {
  const actual_window: AvailableModal = window ?? store.state.event.event;
  const actual_message: string = message ?? store.state.event.data?.message;

  let tmp_grade: Grade,
    new_grade: Grade,
    tmp_description: string;

  switch (actual_window) {
    case "grades":
      grades_title = store.state.event.data.title;
      grades_parameters = {
        ...store.state.event.data.parameters,
        associated_teacher: associated_teacher,
        final_grade_index: final_grades_indexes[store.state.event.data.parameters.student_id],
      };
      student_grades = grades[grades_parameters.student_id];
      grades_open.value = true;
      break;
    case "remove_grade":
    case "edit_grade":
      findGrade();
      if (grade_index.student_id != -1 && grade_index.index != -1) {
        tmp_grade = grades[grade_index.student_id][grade_index.index];
        alert_information.title = "";
        alert_information.message = getCurrentElement((actual_window == "edit_grade" ? "edit" : "remove") + "_grade_confirmation");
        /*+ (grade_index != undefined
          ? "<br />" + getCurrentElement("description") + ": " + tmp_grade[`${language}_description`] + "<br />"
          + getCurrentElement("grade") + ": " + tmp_grade.grade + " [" + getCurrentElement("final") + "]"
          : "");*/ //<!-- TODO (5): abilita innerHTMLTemplatesEnabled nelle config per farlo funzionare
        if (actual_window == "edit_grade") {
          new_grade = store.state.event.data.new_grade;
          edits_to_send = {
            id: false,
            italian_description: false,
            english_description: false,
            publication: false,
            grade: false,
            final: false,
          };
          //alert_information.message += "\n" + getCurrentElement("with_following_edits");
          for (const tmp_language of languages) {
            tmp_description = `${tmp_language}_description`;
            if (tmp_grade[tmp_description] != new_grade[tmp_description]) {
              edits_to_send[tmp_description] = true;
              //alert_information.message += "\n" + getCurrentElement(`${language}_description`) + ": " + new_grade[`${language}_description`];
            }
          }
          if (tmp_grade.publication.getTime() != new_grade.publication.getTime()) {
            edits_to_send.publication_date = true;
            //alert_information.message += "\n" + getCurrentElement("date") + ": " + toDateString(new_grade.publication);
          }
          if (tmp_grade.grade != new_grade.grade) {
            edits_to_send.grade = true;
            //alert_information.message += "\n" + getCurrentElement("grade") + ": " + new_grade.grade;
          }
        }
        alert_information.buttons = [handled_buttons[0], getCurrentElement("no")];
        alert_open.value = true;
      } else {
        setupError();
        alert_open.value = true;
      }
      break;
    case "remove_student":
      findStudent();
      if (student_index.student_list != -1 && student_index.table != -1) {
        alert_information.title = "";
        alert_information.message = getCurrentElement("remove_student_confirmation");
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
      alert_information.message = message ?? getCurrentElement(getCurrentElement("successful_operation"));
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
    case "remove_student":
    case "success":
    case "error":
      alert_open.value = false;
      break;
  }
};
const add_grade = async () => {
  const data = store.state.event.data;

  executeLink(
    "/v1/students/" +
    data.student_id +
    "/grades?course_id=" +
    data.course_id +
    "&session_id=" +
    data.session_id,
    (response) => {
      const tmp_grade = new Grade({
        id: response.data.value.id,
        publication: response.data.value.publication,
        italian_description: data.italian_description,
        english_description: data.english_description,
        grade: data.grade,
        final: data.final ? 1 : 0,
      });

      grades[data.student_id].push(tmp_grade);
      updateFinalRefs(data.student_id, tmp_grade);
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
  students = selected_section.value != "" ? await executeLink(
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
      column_sizes = user.user == "teacher" && associated_teacher == true || user.user == "admin" && project_class?.final_confirmation != undefined
        ? [7, 3, 2]
        : [5, 2, 1, 2, 2];
      if (first_row.length != column_sizes.length) {
        if (project_class?.final_confirmation == undefined) {
          first_row.push({
            id: "move",
            type: "string",
            content: getCurrentElement("move"),
          }, {
            id: "remove",
            type: "string",
            content: getCurrentElement("remove"),
          });
        } else {
          first_row.pop();
          first_row.pop();
        }
      }
      response.data.data.components.map((a: any) => {
        tmp_students.push(new Student(a));
      });

      return tmp_students;
    },
    () => []
  ) : [];

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
        user.user == "teacher" ? grades[student.id][final_grades_indexes[student.id]] : undefined,
        project_class?.final_confirmation
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
  let body: {
    [key in keyof GradeProps]?: any;
  }, edits_props: GradeProps,
    count = 0,
    something_to_edit = false,
    edit_keys: string[],
    tmp_grade: Grade;

  switch (store.state.event.event) {
    case "confirmation":
      if (course != undefined && project_class != undefined) {
        if (table_data.length < course.min_students || table_data.length > course.max_students) {
          setTimeout(() => setupModalAndOpen("error", getCurrentElement("students_number_error")), 300);
        } else if (learning_session_status != LearningSessionStatus.UPCOMING) {
          setTimeout(() => setupModalAndOpen("error", getCurrentElement("learning_session_not_upcoming")), 300);
        } else if (project_class.final_confirmation != undefined) {
          setTimeout(() => setupModalAndOpen("error", getCurrentElement("project_class_already_confirmed")), 300);
        } else {
          executeLink("/v1/project_classes/" + course_id + "/" + session_id + "/final_confirmation",
            (response) => {
              (project_class as AdminProjectClass).final_confirmation = response.data.confirmation_date != undefined ? new Date(response.data.confirmation_date) : new Date();
              setTimeout(() => setupModalAndOpen("success", getCurrentElement("project_class_successful_confirmation")), 300);
              students_update.value++;
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
        tmp_grade = grades[grade_index.student_id][grade_index.index];
        if (associated_teacher) {
          setTimeout(() => setupModalAndOpen("error", getCurrentElement("no_grade_remotion_permissions")), 300);
        } else if (!tmp_grade.isEditable(
          final_grades_indexes[grade_index.student_id] != undefined
            ? grades[grade_index.student_id][final_grades_indexes[grade_index.student_id]].publication
            : undefined)) {
          setTimeout(() => setupModalAndOpen("error", getCurrentElement("cannot_remove_grade")), 300);
        } else {
          executeLink("/v1/grades/" + store.state.event.data.id,
            () => {
              updateFinalRefs("" + grade_index.student_id, tmp_grade, true);
              grades[grade_index.student_id].splice(grade_index.index, 1);
              setTimeout(() => setupModalAndOpen("success", getCurrentElement("successful_grade_remotion")), 300);
              store.state.triggers.grades++;
            },
            () => setTimeout(() => setupModalAndOpen("error"), 300),
            "delete");
        }
      } else {
        setTimeout(() => setupModalAndOpen("error"), 300);
      }
      break;
    case "edit_grade":
      if (learning_session != undefined) {
        edits_props = store.state.event.data.new_grade.toProps();
        body = {
          ita_description: edits_to_send.italian_description ? edits_props.italian_description : undefined,
          eng_description: edits_to_send.english_description ? edits_props.english_description : undefined,
          grade: edits_to_send.grade ? edits_props.grade : undefined,
          publication_date: edits_to_send.publication_date ? edits_props.publication : undefined,
        };
        //<!-- TODO (6): modificare quando ci sarà coerenza nei parametri
        /*for (const key in edits_to_send) {
          if (edits_to_send[key]) {
            body[key] = edits_props[key];
          }
        }*/
        edit_keys = Object.keys(body);

        while (!(something_to_edit = body[edit_keys[count]] != undefined) && ++count < edit_keys.length);
        if (associated_teacher) {
          setTimeout(() => setupModalAndOpen("error", getCurrentElement("no_grade_edit_permissions")), 300);
        } else if (!something_to_edit) {
          setTimeout(() => setupModalAndOpen("error", getCurrentElement("no_edits")), 300);
        } else if (!grades[grade_index.student_id][grade_index.index].isEditable(
          final_grades_indexes[grade_index.student_id] != undefined
            ? grades[grade_index.student_id][final_grades_indexes[grade_index.student_id]].publication
            : undefined)) {
          setTimeout(() => setupModalAndOpen("error", getCurrentElement("cannot_edit_grade")), 300);
        } else {
          executeLink("/v1/grades/" + store.state.event.data.id,
            () => {
              Object.assign(grades[grade_index.student_id][grade_index.index], store.state.event.data.new_grade);
              tmp_grade = grades[grade_index.student_id][grade_index.index];
              setTimeout(() => setupModalAndOpen("success", getCurrentElement("successful_edit")), 300);
              updateFinalRefs("" + grade_index.student_id, store.state.event.data.new_grade, false, false);
              store.state.triggers.grades++;
              store.state.triggers.edit_grades++;
            },
            () => setTimeout(() => setupModalAndOpen("error"), 300),
            "put", body);
        }
      } else {
        setTimeout(() => setupModalAndOpen("error"), 300);
      }
      break;
    case "remove_student":
      if (course != undefined && project_class != undefined) {
        if (project_class.final_confirmation != undefined) {
          setTimeout(() => setupModalAndOpen("error", getCurrentElement("class_already_confirmed")), 300);
        } else {
          console.log({
            project_class: {
              course_id: course.id,
              session_id: project_class.learning_session.id
            }
          });

          executeLink("/v1/students/" + store.state.event.data.parameters.student_id + "/remove_class?course_id=" + course.id + "&session_id=" + project_class.learning_session.id,
            () => {
              table_data.splice(student_index.table, 1);
              students.splice(student_index.student_list, 1);
              setTimeout(() => setupModalAndOpen("success", getCurrentElement("successful_student_remotion")), 300);
              students_trigger.value++;
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
  alert_information.message = message ?? getCurrentElement("general_error");
  alert_information.buttons = [getCurrentElement("ok")];
};
const findGrade = () => {
  let count = 0;

  while ((grade_index.index = grades[
    (grade_index.student_id = students[count].id)
  ].findIndex(a => a.id == store.state.event.data.id)) == -1 && ++count < Object.keys(grades).length);
};
const findStudent = () => {
  const tmp_student_id = store.state.event.data.parameters.student_id;

  student_index.table = table_data.findIndex(a => a[0].id.split("_")[0] == tmp_student_id);
  student_index.student_list = students.findIndex(a => a.id == tmp_student_id);
};
const updateFinalRefs = (student_id: string, grade: Grade, deleted_grade = false, update_indexes = true) => {
  let student_pos: number;

  if (grade.final == true) {
    student_pos = table_data.findIndex(
      (a: CustomElement[]) => a[0].id == student_id + "_name_surname"
    );
    if (update_indexes) {
      final_grades_indexes[student_id] = grades[student_id].length - 1;
    }
    if (deleted_grade) {
      table_data[student_pos][table_data[student_pos].length - 1].content = "-";
      grades_parameters.final_grade_index = undefined;
      delete final_grades_indexes[student_id];
      store.state.triggers.grades++;
    } else {
      table_data[student_pos][table_data[student_pos].length - 1].content =
        grade.grade;
    }
    students_trigger.value++;
  }
}

const store = useStore();
const user = User.getLoggedUser() as User;
const sections_use: boolean = store.state.sections_use;
const languages = getAviableLanguages();

const first_row: CustomElement[] = [
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
const grades_open = ref(false);
const description_open = ref(false);
const divided_path = window.location.pathname.split("/");
const course_id = divided_path[divided_path.length - 2]; //<!-- TODO (5): usare $route
const session_id = divided_path[divided_path.length - 1];
const students_trigger = ref(0);
const students_update = ref(0);
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
const student_index = {
  student_list: -1,
  table: -1,
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
let description_title: string;
let description_course_id: GradesParameters;
let associated_teacher: boolean | undefined;
let learning_session_status: LearningSessionStatus | undefined;
let course: Course | undefined;
let project_class: AdminProjectClass | undefined;
let students: Student[] = [];
let edits_to_send: {
  [key in keyof GradeProps]: boolean;
};
let column_sizes: number[] = [];

if (user.user == "teacher") {
  first_row.push(
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
watch(students_update, async () => {
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