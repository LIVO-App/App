<template>
  <ion-modal :keep-contents-mounted="true">
    <ion-datetime
      :key="trigger"
      id="datetime"
      @ion-change="changeData"
      :first-day-of-week="1"
      :max="end_of_day.toISOString()"
      hour-cycle="h23"
      :locale="getLocale()"
      :show-clear-button="true"
      :clear-text="getCurrentElement('clear')"
      :value="date_value"
    />
  </ion-modal>
  <ion-alert
      :is-open="alert_open"
      :header="alert_information.title"
      :message="alert_information.message"
      :buttons="alert_information.buttons"
      @didDismiss="closeModal(store.state.event.event)"
    />
  <ion-header>
    <ion-toolbar>
      <ion-grid>
        <ion-row class="ion-text-center ion-align-items-center">
          <ion-col>
            <ionic-element :element="elements.title" />
          </ion-col>
          <ion-col size="auto">
            <ionic-element
              :element="elements.close"
              @signal_event="$emit('close')"
            ></ionic-element>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-toolbar>
  </ion-header>
  <!--<ion-content fullscreen>-->
  <!-- ! (3): valutare scroll per mobile, stando attenti a --height: fit-content in ion-modal#grades_manager in ProjectClass.vue -->
  <ion-content>
    <ion-grid>
      <ion-row>
        <ion-col>
          <div class="ion-padding-bottom">
            <div class="ion-padding-bottom">
              <ionic-element
                :element="
                  getCustomMessage(
                    'description',
                    getCurrentElement('grade_insertion'),
                    'title',
                    colors
                  )
                "
              />
            </div>
            <div>
              <ionic-element
                :element="
                  getCustomMessage(
                    'description',
                    getCurrentElement('description'),
                    'string',
                    colors
                  )
                "
              />
              <!-- TODO (5): mettere EditorWrapper -->
              <ion-textarea
                v-for="language in languages"
                :key="language"
                :auto-grow="true"
                v-model="descriptions[`${language}_description`]"
                :label="getCurrentElement(language)"
                :aria-label="getCurrentElement(language)"
                fill="outline"
                class="ion-margin-vertical"
              />
            </div>
            <hr
              class="ion-margin-top"
              style="border-bottom: 1px solid var(--ion-color-medium)"
            />
            <div>
              <ion-item style="width: fit-content" lines="none">
                <ion-label
                  :aria-label="getCurrentElement('date')"
                  color="primary"
                  style="color: var(--ion-color-primary)"
                  >{{ getCurrentElement("date") }}</ion-label
                >
                <ion-datetime-button
                  :key="date_trigger"
                  datetime="datetime"
                  style="width: fit-content"
                  class="ion-padding-start"
                />
              </ion-item>
              <div style="width: fit-content">
                <ion-label
                  position="floating"
                  :aria-label="getCurrentElement('final_grade')"
                  color="primary"
                  style="color: var(--ion-color-primary)"
                  class="ion-padding-horizontal"
                  >{{ getCurrentElement("final_grade") }}</ion-label
                >
                <ion-checkbox
                  v-model="final"
                  :aria-label="getCurrentElement('final_grade')"
                />
              </div>
            </div>
            <ionic-table
              :key="trigger"
              :emptiness_message="
                getCustomMessage(
                  'emptiness_message',
                  getCurrentElement('no_students')
                )
              "
              v-model:data="table_data_ref"
              :first_row="first_row"
              :sizes="column_sizes"
              @signal_event="() => {
                const signaled_event = store.state.event;
                const student = table_data_ref.cards[''].find((a) => a.id == signaled_event.data.element_id)?.content;
                
                let has_errors: boolean;
                let tmp_grade: string;

                if (student != undefined) {
                  tmp_grade = '' + student[student.length - 1].content
                  has_errors = hasGradeTypingErrors(signaled_event.event, tmp_grade, signaled_event.data.key_event?.key);
                  if (has_errors){
                    if (signaled_event.event == 'ion-input') {
                      student[student.length - 1].content = '';
                      nextTick(() => {
                        student[student.length - 1].content = tmp_grade.substring(0, tmp_grade.length - 1);
                      });
                    } else if (signaled_event.event == 'keydown' && signaled_event.data.key_event != undefined) {
                      signaled_event.data.key_event.preventDefault();
                    }
                  }
                }
              }"
            />

            <!-- TODO (4): mettere popup "Sei sicuro?" -->
          </div>
          <div class="ion-text-center">
            <ion-button
              @click="
                () => {
                  let tmp_grades: StudentGrade<string>[] = [];
                  let actual_grades: StudentGrade<number | undefined>[] | undefined = undefined;
                  
                  table_data.cards[''].map((s) => {
                    const ref_grade = s.content[s.content.length - 1].content;

                    if (typeof ref_grade == 'string' && ref_grade != '') {
                      tmp_grades.push({
                        student_id: parseInt(s.id),
                        grade_value: ref_grade,
                      });
                    }
                  });
                  actual_grades = checkMultiGradesParameters(
                      descriptions,
                      date,
                      tmp_grades
                    );

                  if (actual_grades != undefined && Object.values(actual_grades ?? {}).every((a) => a.grade_value != undefined)) {
                    store.state.event = {
                      event: 'add_grades',
                      data: {
                        ...parameters,
                        ...descriptions,
                        publication_date:
                          date != undefined ? date.toISOString() : undefined,
                        grades_list: actual_grades,
                        final: final,
                      },
                      method: 'post',
                    };
                    $emit('signal_event');
                    $emit('close');
                  } else {
                    $emit('signal_event');
                  }
                }
              "
            >
              {{ getCurrentElement("insert_grade") }}
            </ion-button>
          </div>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-content>
</template>

<script setup lang="ts">
import {
  CustomElement,
  Language,
  Colors,
  GeneralSubElements,
  User,
  GeneralTableCardElements,
  OrderedCardsList,
  ProjectClassStudent,
  MultipleGradesParameters,
  TmpList,
  StudentGrade,
  AlertInformation,
} from "@/types";
import {
  executeLink,
  getAviableLanguages,
  getCurrentElement,
  getCustomMessage,
  getIcon,
  getLocale,
  checkMultiGradesParameters,
  hasGradeTypingErrors,
} from "@/utils";
import {
  IonHeader,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonButton,
  IonTextarea,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  DatetimeCustomEvent,
  IonItem,
  IonCheckbox,
  IonContent,
  IonAlert,
} from "@ionic/vue";
import { nextTick, PropType, reactive, Ref, ref, watch } from "vue";
import { useStore } from "vuex";

type AvailableModal = "warning";

const changeData = (event: DatetimeCustomEvent) => {
  const tmp_str_date = event.target.value;

  let tmp_date: Date;

  if (typeof tmp_str_date == "string") {
    tmp_date = new Date(tmp_str_date);
    if (tmp_date <= end_of_day) {
      date = tmp_date;
    } else {
      date = undefined;
    }
  } else {
    date = undefined;
  }
  date_trigger.value++;
};
const updateStudents = async () => {
  students = await executeLink(
    "/v1/project_classes/" +
      props.parameters.course_id +
      "/" +
      props.parameters.session_id +
      "/components?section=" +
      props.parameters.section +
      "&teacher_id=" +
      user.id,
    (response) => {
      const tmp_students: ProjectClassStudent[] = [];

      response.data.data.components.map((a: any) => {
        tmp_students.push(
          new ProjectClassStudent(
            a,
            "" + props.parameters.course_id,
            "" + props.parameters.session_id
          )
        );
      });

      return tmp_students;
    },
    () => []
  );

  for (const student_index in students) {
    const tmp_student = students[student_index];

    const tmp_row = tmp_student.toTableRow(
      user.id,
      false,
      undefined,
      undefined,
      true
    );
    tmp_row.content = [
      getCustomMessage(tmp_student.id + "_index", parseInt(student_index) + 1),
    ].concat(tmp_row.content);
    table_data.cards[""].push(tmp_row);
  }
  trigger.value++;
};
const setupModalAndOpen = (window?: AvailableModal, message?: string) => {
  const actual_window: AvailableModal = window ?? store.state.event.event;
  const actual_message: string = message ?? store.state.event.data?.message;

  switch (actual_window) {
    case "warning":
      alert_information.title = getCurrentElement("warning");
      alert_information.message = actual_message;
      alert_information.buttons = [getCurrentElement("ok")];
      alert_open.value = true;
      break;
  }
};
const closeModal = (window: AvailableModal) => {
  switch (window) {
    case "warning":
      alert_open.value = false;
      break;
  }
};

const store = useStore();
const languages = getAviableLanguages();
const user = User.getLoggedUser() as User;
const date_trigger = ref(0);

const props = defineProps({
  parameters: {
    type: Object as PropType<MultipleGradesParameters>,
    required: true,
  },
  final_grades_indexes: {
    type: Object as PropType<{
      [student_id: string]: number;
    }>,
    required: true,
  },
});
defineEmits(["signal_event", "close"]);

const elements: {
  [key: string]: CustomElement;
} = {
  close: {
    id: "close",
    type: "icon",
    linkType: "event",
    content: {
      event: "close",
      icon: getIcon("close"),
    },
  },
  title: {
    id: "title",
    type: "title",
    content: getCurrentElement("grade_series_insertion"),
  },
};
const descriptions: {
  [key in keyof Language as `${Language}_description`]: string;
} = reactive({
  italian_description: "",
  english_description: "",
});
const final: Ref<boolean> = ref(false);
const colors: Colors<GeneralSubElements> = {
  text: {
    name: "primary",
    type: "var",
  },
};
const trigger = ref(0);
const table_data: OrderedCardsList<GeneralTableCardElements> = {
  order: [],
  cards: {
    "": [],
  },
};
const table_data_ref = ref(table_data);
const first_row: CustomElement[] = [
  {
    id: "index",
    type: "string",
    content: "",
  },
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
  {
    id: "",
    type: "string",
    content: "",
  },
];
const column_sizes = [1, 6, 2, 2, 1];
const disabled_grades: TmpList<string> = {};
const alert_open = ref(false);
const alert_information: AlertInformation = store.state.alert_information;
const end_of_day = new Date();
end_of_day.setHours(23, 59, 59, 999);

let date: Date | undefined = undefined;
let date_value: string | undefined;
let students: ProjectClassStudent[];

updateStudents();

watch(final, (value) => {
  let tmp_input_grade;
  let hide_grades = false;

  if (value) {
    for (const student of table_data_ref.value.cards[""]) {
      tmp_input_grade = student.content[student.content.length - 1];
      if (props.final_grades_indexes[student.id] != undefined) {
        disabled_grades[student.id] = tmp_input_grade.content as string;
        hide_grades = true;
        tmp_input_grade.content = "";
        if (tmp_input_grade.params == undefined) {
          tmp_input_grade.params = {};
        }
        tmp_input_grade.params.disabled = true;
      }
    }
    if (hide_grades) {
      setupModalAndOpen("warning", getCurrentElement("final_grades_hide"));
    }
  } else {
    for (const id in disabled_grades) {
      for (const student of table_data_ref.value.cards[""]) {
        tmp_input_grade = student.content[student.content.length - 1];
        if (student.id == id) {
          tmp_input_grade.content =
            disabled_grades[id];
          delete disabled_grades[id];
          if (tmp_input_grade.params != undefined) {
            tmp_input_grade.params.disabled = false;
          }
          break;
        }
      }
    }
  }
});
</script>

<style scoped>
ion-textarea {
  --color: var(--ion-color-primary);
  --placeholder-color: var(--ion-color-primary);
}
</style>
