<template>
  <ion-modal :keep-contents-mounted="true">
    <ion-datetime id="datetime" @ion-change="changeData" :first-day-of-week="1" :max="end_of_day.toISOString()"
      hour-cycle="h23" :locale="getLocale()" :show-clear-button="true" :clear-text="getCurrentElement('clear')" />
  </ion-modal>
  <ion-header>
    <ion-toolbar>
      <ion-grid>
        <ion-row class="ion-text-center ion-align-items-center">
          <ion-col>
            <ionic-element :element="elements.title"></ionic-element>
          </ion-col>
          <ion-col size="auto">
            <ionic-element :element="elements.close" @signal_event="$emit('close')"></ionic-element>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-toolbar>
  </ion-header>
  <ion-grid>
    <ion-row>
      <ion-col :size="parameters.teacher_id != undefined && tableData.length != 0 && final === false ? '7' : '12'">
        <template v-if="tableData.length > 0">
          <ionic-table :data="tableData" :first_row="first_row" :column_sizes="column_sizes"
            @signal_event="$emit('signal_event')" />
          <div class="ion-text-center ion-padding-bottom">
            <ion-text color="primary">{{ getCurrentElement("intermediate_arithmetic_mean") }}{{ final === true ? " (" +
              getCurrentElement("no_final_grade").toLowerCase() + ")" : "" }}:
              {{ mean }}</ion-text>
          </div>
        </template>
        <template v-else>
          <div class="ion-text-center ion-padding">
            <ionic-element :element="getCustomMessage(
              'emptiness_message',
              getCurrentElement('no_grades'),
              'string',
              colors
            )
              " />
          </div>
        </template>
      </ion-col>
      <ion-col :size="tableData.length == 0 ? '12' : '5'"
        v-if="parameters.teacher_id != undefined && parameters.associated_teacher === false && final === false">
        <div class="ion-padding-bottom">
          <div class="ion-padding-bottom">
            <ionic-element :element="getCustomMessage(
              'description',
              getCurrentElement('grade_insertion'),
              'title',
              colors
            )
              " />
          </div>
          <div>
            <ionic-element :element="getCustomMessage(
              'description',
              getCurrentElement('description'),
              'string',
              colors
            )
              " />
            <!-- TODO (5): mettere EditorWrapper -->
            <ion-textarea v-for="language in languages" :key="language" :auto-grow="true"
              v-model="descriptions[`${language}_description`]" :label="getCurrentElement(language)"
              :aria-label="getCurrentElement(language)" fill="outline" class="ion-margin-vertical" />
          </div>
          <hr class="ion-margin-top" style="border-bottom: 1px solid var(--ion-color-medium)" />
          <div>
            <ion-item style="width: fit-content;" lines="none">
              <ion-label :aria-label="getCurrentElement('date')" color="primary"
              style="color: var(--ion-color-primary)">{{ getCurrentElement("date") }}</ion-label>
              <ion-datetime-button datetime="datetime" style="width: fit-content;" class="ion-padding-start" />
            </ion-item>
            <ion-input ref="input_grade" type="tel" v-model="grade" :label="getCurrentElement('grade')"
              :aria-label="getCurrentElement('grade')" color="black" style="color: var(--ion-color-primary)"
              fill="outline" class="ion-margin-vertical" @ion-input="() => {
                if (isNaN(getGradeNumber())) {
                  grade = grade.substring(0, grade.length - 1);
                }
              }" />
            <div style="width: fit-content;">
              <ion-label position="floating" :aria-label="getCurrentElement('final_grade')" color="primary"
                style="color: var(--ion-color-primary)" class="ion-padding-horizontal">{{ getCurrentElement("final_grade") }}</ion-label>
              <ion-checkbox v-model="final_grade" :aria-label="getCurrentElement('final_grade')" />
            </div>
          </div>
          <!-- TODO (4): controllare perchè non funziona nella tabella e mettere popup "Sei sicuro?" -->
        </div>
        <div class="ion-text-center">
          <ion-button @click="() => {
            let full = true;
            let count = 0;
            let actual_grade: number;

            while (
              count < languages.length &&
              (full =
                descriptions[`${languages[count++]}_description`] != '')
            );
            if (!full) {
              store.state.event = {
                event: 'empty_descriptions',
                data: {},
              };
              $emit('signal_event');
            } else if (isNaN(actual_grade = limitGrade())) {
              store.state.event = {
                event: 'grade_value_error',
                data: {},
              };
              $emit('signal_event');
            } else {
              store.state.event = {
                event: 'add_grade',
                data: {
                  ...parameters,
                  ...descriptions,
                  publication_date: date != undefined ? date.toISOString() : undefined,
                  grade: actual_grade,
                  final: final_grade,
                },
                method: 'post',
              };
              $emit('signal_event');
              $emit('close');
            }
          }
            ">
            {{ getCurrentElement("insert_grade") }}
          </ion-button>
        </div>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import {
  CustomElement,
  Grade,
  GradeProps,
  GradesParameters,
  Language,
  Colors,
  GeneralSubElements,
  User,
} from "@/types";
import {
  executeLink,
  getAviableLanguages,
  getCurrentElement,
  getCustomMessage,
  getIcon,
  getLocale,
} from "@/utils";
import {
  IonHeader,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonLabel,
  IonInput,
  IonCheckbox,
  IonButton,
  IonTextarea,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  DatetimeCustomEvent,
  IonItem,
} from "@ionic/vue";
import { PropType, reactive, Ref, ref } from "vue";
import { useStore } from "vuex";

const push_grade = (grade: Grade) => {
  if (grade.final) {
    final.value = true;
  }
  tableData.push(grade.toTableRow(user.id));
};
const getGradeNumber = () => {
  const tmp_grade = grade.value;
  const tmp_regexp = store.state.grades_scale.input_regex;
  const actual_grade = tmp_regexp.test(tmp_grade) ? parseFloat(tmp_grade) : NaN;
  tmp_regexp.test(tmp_grade); // Dummy test to reset regex (I don't know why I have to do this)

  if (isNaN(actual_grade) || (actual_grade % 1) != 0) {
    return NaN;
  } else {
    return actual_grade;
  }
};
const limitGrade = () => {
  let actual_grade: number;

  if (isNaN((actual_grade = getGradeNumber())) ||
    actual_grade < store.state.grades_scale.min ||
    actual_grade > store.state.grades_scale.max) {
    return NaN;
  } else {
    return actual_grade;
  }
};
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
}

const store = useStore();
const languages = getAviableLanguages();
const user = User.getLoggedUser() as User;

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  parameters: {
    type: Object as PropType<GradesParameters>,
    required: true,
  },
  grades: Array<Grade>,
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
    content: props.title,
  },
};
const first_row: CustomElement[] = [
  {
    id: "description",
    type: "string",
    content: getCurrentElement("description"),
  },
  {
    id: "date",
    type: "string",
    content: getCurrentElement("date"),
  },
  {
    id: "evaluation",
    type: "string",
    content: getCurrentElement("evaluation"),
  },
  /*{
    id: "edit",
    type: "string",
    content: "",
  },
  {
    id: "remove",
    type: "string",
    content: "",
  },*/
];
const column_sizes = [6, 3, 3]; //[5, 2, 2, 1, 1];
const tableData: CustomElement[][] = [];
const final = ref(false);
const descriptions: {
  [key in keyof Language as `${Language}_description`]: string;
} = reactive({
  italian_description: "",
  english_description: "",
});
const grade: Ref<string> = ref("");
const input_grade = ref();
const final_grade: Ref<boolean> = ref(false);
const colors: Colors<GeneralSubElements> = {
  text: {
    name: "primary",
    type: "var",
  },
};
const end_of_day = new Date();
end_of_day.setHours(23, 59, 59, 999);

let actual_grades: Grade[];
let tmp_mean = 0;
let mean = "";
let finalPresent = false;
let date: Date | undefined = undefined;

if (props.grades != undefined) {
  actual_grades = props.grades.map((a: Grade) => {
    push_grade(a);
    return a;
  });
} else {
  actual_grades = await executeLink(
    "/v1/students/" +
    props.parameters.student_id +
    "/grades?course_id=" +
    props.parameters.course_id +
    "&session_id=" +
    props.parameters.session_id +
    (props.parameters.teacher_id != undefined
      ? "&teacher_id=" + props.parameters.teacher_id
      : ""),
    (response) =>
      response.data.data.map((a: GradeProps) => {
        const tmp_grade = new Grade(a);
        push_grade(tmp_grade);
        return tmp_grade;
      }),
    () => []
  );
}

for (const grade of actual_grades) {
  if (!grade.final) {
    tmp_mean += grade.grade;
  } else {
    finalPresent = true;
  }
}

if (actual_grades.length > 1) {
  mean = (tmp_mean / (actual_grades.length - (finalPresent ? 1 : 0))).toFixed(2);
} else if (actual_grades.length == 1 && !finalPresent) {
  mean = actual_grades[0].grade.toFixed(2);
} else {
  mean = "-";
}
</script>

<style scoped>
ion-textarea {
  --color: var(--ion-color-primary);
  --placeholder-color: var(--ion-color-primary);
}
</style>