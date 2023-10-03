<template>
  <ion-header>
    <ion-toolbar>
      <ion-grid>
        <ion-row class="ion-text-center ion-align-items-center">
          <ion-col>
            <ionic-element :element="elements.title"></ionic-element>
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
  <ion-grid>
    <ion-row>
      <ion-col :size="tableData.length == 0 ? '12' : undefined">
        <template v-if="tableData.length > 0">
          <ionic-table
            :data="tableData"
            :first_row="first_row"
            :column_sizes="column_sizes"
          />
          <div class="ion-text-center ion-padding-bottom">
            <ion-text color="primary"
              >{{ getCurrentElement("intermediate_arithmetic_mean") }}:
              {{ mean }}</ion-text
            >
          </div>
        </template>
        <template v-else>
          <div class="ion-text-center ion-padding">
            <ionic-element
              :element="
                getCustomMessage(
                  'emptiness_message',
                  getCurrentElement('no_grades'),
                  'string',
                  colors
                )
              "
            />
          </div>
        </template>
      </ion-col>
      <ion-col
        :size="tableData.length == 0 ? '12' : undefined"
        v-if="parameters.teacher_id != undefined && final === false"
      >
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
            <ion-input
              type="number"
              v-model="grade"
              :label="getCurrentElement('grade')"
              :aria-label="getCurrentElement('grade')"
              color="black"
              style="color: var(--ion-color-primary)"
              fill="outline"
              class="ion-margin-vertical"
            />
            <ion-label
              position="floating"
              :aria-label="getCurrentElement('final_grade')"
              color="primary"
              style="color: var(--ion-color-primary)"
              >{{ getCurrentElement("final_grade") }}</ion-label
            >
            <ion-checkbox
              v-model="final_grade"
              :aria-label="getCurrentElement('final_grade')"
              class="ion-padding-start"
            ></ion-checkbox>
          </div>
          <!-- TODO (4): controllare perchè non funziona nella tabella e mettere popup "Sei sicuro?" -->
        </div>
        <div class="ion-text-center">
          <ion-button
            @click="
              () => {
                let full = true;
                let count = 0;

                while (
                  count < languages.length &&
                  (full =
                    descriptions[`${languages[count++]}_description`] != '')
                );
                if (!full) {
                  store.state.event = {
                    name: 'empty_descriptions',
                    data: {},
                  };
                  $emit('signal_event');
                } else if (
                  grade < store.state.grades_scale.min ||
                  grade > store.state.grades_scale.max
                ) {
                  store.state.event = {
                    name: 'grade_value_error',
                    data: {},
                  };
                  $emit('signal_event');
                } else {
                  store.state.event = {
                    name: 'add_grade',
                    data: {
                      ...parameters,
                      ...descriptions,
                      grade: grade,
                      final: final_grade,
                    },
                    method: 'post',
                  };
                  $emit('signal_event');
                  $emit('close');
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
} from "@/types";
import {
  executeLink,
  getAviableLanguages,
  getCurrentElement,
  getCustomMessage,
  getIcon,
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
} from "@ionic/vue";
import { PropType, reactive, Ref, ref } from "vue";
import { useStore } from "vuex";

const push_grade = (grade: Grade) => {
  if (grade.final) {
    final.value = true;
  }
  tableData.push(grade.toTableRow());
};

const store = useStore();
const languages = getAviableLanguages();

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
];
const column_sizes = [6, 3, 3];
const tableData: CustomElement[][] = [];
const final = ref(false);
const descriptions: {
  [key in keyof Language as `${Language}_description`]: string;
} = reactive({
  italian_description: "",
  english_description: "",
});
const grade: Ref<number> = ref(0);
const final_grade: Ref<boolean> = ref(false);
const colors: Colors<GeneralSubElements> = {
  text: {
    name: "primary",
    type: "var",
  },
};

let actual_grades: Grade[];
let tmp_mean = 0;
let mean = "";
let finalPresent = false;

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

mean = (tmp_mean / (actual_grades.length - (finalPresent ? 1 : 0))).toFixed(2);
</script>

<style scoped>
ion-textarea {
  --color: var(--ion-color-primary);
  --placeholder-color: var(--ion-color-primary);
}
</style>