<template>
    <div class="ion-padding-horizontal">
        <ion-modal id="grades_manages" :is-open="grades_open" @didDismiss="closeModal('grades')">
            <suspense>
                <template #default>
                    <grades-manager :title="grades_title" :parameters="grades_parameters" @close="closeModal('grades')"></grades-manager>
                </template>
                <template #fallback>
                    <loading-component />
                </template>
            </suspense>
        </ion-modal>
        <ion-modal :is-open="description_open" @didDismiss="closeModal('course_details')">
            <suspense>
                <template #default>
                    <course-description :title="description_title" :course_id="description_course_id" @close="closeModal('course_details')"></course-description>
                </template>
                <template #fallback>
                    <loading-component />
                </template>
            </suspense>
        </ion-modal>
        <ion-grid>
            <ion-row>
                <ion-col size="auto">
                    <custom-select
                        v-model="selected_year"
                        :list="school_years"
                        :label="getCurrentElement(store,'school_year') + ':'"
                        :aria_label="getCurrentElement(store,'school_year')"
                        :placeholder="getCurrentElement(store,'school_year_choice')"
                    /> <!-- Da sistemare: aggiungere "All" -->
                </ion-col>
                <ion-col size="auto">
                    <custom-select
                        v-model="selected_context"
                        :list="learning_contexts"
                        :label="getCurrentElement(store,'learning_context') + ':'"
                        :aria_label="getCurrentElement(store,'learning_context')"
                        :placeholder="getCurrentElement(store,'learning_context_choice')"
                        :getCompleteName="getContextAxronym"
                    />
                </ion-col>
            </ion-row>
        </ion-grid>
        <suspense>
          <template #default>
            <ionic-table :key="trigger" :data="tableData" :first_row="firstRow" :column_sizes="column_sizes" @signal_event="SetupModalAndOpen(store)"></ionic-table>
          </template>
          <template #fallback>
            <loading-component />
          </template>
        </suspense>
    </div>
</template>

<script setup lang="ts">
import { CurriculumCourse, CustomElement, GradesParameters, Language, LearningContext } from "@/types";
import { executeLink, getCurrentElement } from "@/utils";
import { IonModal, IonGrid, IonRow, IonCol } from "@ionic/vue";
import { AxiosInstance } from "axios";
import { inject, ref, Ref, watch } from "vue";
import { Store, useStore } from "vuex";

type availableModal = "grades" | "course_details";

const SetupModalAndOpen = (store : Store<any>) => {
    const window : availableModal = store.state.event.name;
    switch (window) {
        case "grades":
            grades_title = store.state.event.data.title;
            grades_parameters = store.state.event.data.parameters;
            grades_open.value = true;
            break;
        case "course_details":
            description_title = store.state.event.data.title;
            description_course_id = store.state.event.data.course_id;
            description_open.value = true;
            break;
    }
}
const closeModal = (window : availableModal) => {
    switch (window) {
        case "grades":
            grades_open.value = false
            break;
        case "course_details":
            description_open.value = false;
    }
};
const getContextAxronym = (option: LearningContext) => option[`${language}_title`];
const getYearCourses = async () => {

    year_courses = {};

    await executeLink($axios,"/v2/students/" + user.id + "/curriculum?school_year=" + selected_year.value + "&token=" + user.token, // context_id=" + selected_context.value + "&
        response => {

            let tmp_course : CurriculumCourse;

            for (const course of response.data.data) {
                tmp_course = new CurriculumCourse(course);
                if (year_courses[tmp_course.learning_context_id] == undefined) {
                    year_courses[tmp_course.learning_context_id] = [tmp_course];
                } else {
                    year_courses[tmp_course.learning_context_id].push(tmp_course);
                }
            }
        },
        () => []);
    
    courses = year_courses[selected_context.value] ?? [];
};
const updateTable = (year_correspondences : any, courses : CurriculumCourse[]) => {
    for (const course of courses) {
        if (year_correspondences[selected_year.value][course.id].length > 0) {
            tableData.push(course.toTableRow(store,year_correspondences[selected_year.value][course.id][year_correspondences[selected_year.value][course.id].length-1],user.id));
        }
    }
}

const store = useStore();
const $axios : AxiosInstance | undefined = inject("$axios");
const user = store.state.user;
const language : Language = store.state.language;

const year_correspondences : {
    [key : number]: {
        [key : number]: number[]
    }
} = {};
const firstRow : CustomElement[] = [{
    id: "title",
    type: "string",
    content: getCurrentElement(store,"course")
},{
    id: "section",
    type: "string",
    content: getCurrentElement(store,"section")
},{
    id: "credits",
    type: "string",
    content: getCurrentElement(store,"credits")
},{
    id: "learning_area",
    type: "string",
    content: getCurrentElement(store,"learning_area")
},{
    id: "gardes",
    type: "string",
    content: getCurrentElement(store,"grades")
},{
    id: "final_grade",
    type: "string",
    content: getCurrentElement(store,"final_grade")
}];
const column_sizes = [4,1,1,2,2,2];
const grades_open = ref(false);
const description_open = ref(false);
const trigger = ref(0);

let school_years : any[] = [];
let selected_year : Ref<any>;
let year_courses : {
    [key: string]: CurriculumCourse[]
} = {};
let courses : CurriculumCourse[] = [];
let grades_title : string;
let grades_parameters : GradesParameters;
let description_title : string;
let description_course_id : number;
let learning_contexts : LearningContext[] = [];
let selected_context : Ref<string>;
let courses_list : CurriculumCourse[] = [];
let tableData : CustomElement[][] = [];

if ($axios != undefined) {
    school_years = await executeLink($axios,"/v1/ordinary_classes?descending=true&student_id=" + user.id,
        response => {
            return response.data.data.map((a: any) => {
                return {
                    id: a.school_year
                }
            });
        },
        () => []);
    learning_contexts = await executeLink($axios,"/v1/learning_contexts?",
        response => {

            const tmp_contexts = [];

            for (const learning_context of response.data.data) {
                if (store.state.excluded_learning_contexts_id.findIndex((a: number) => a != learning_context.id) != -1) {
                    tmp_contexts.push(learning_context);
                }
            }

            return tmp_contexts;
        },
        () => []);

    selected_year = ref(school_years[0].id);
    selected_context = ref(learning_contexts[0].id);
    await getYearCourses();

    watch(selected_year,() => {
        getYearCourses();
        tableData = [];
        updateTable(year_correspondences,courses);
        trigger.value++;
    });
    watch(selected_context,n => {
        courses = year_courses[n] ?? [];
        tableData = [];
        updateTable(year_correspondences,courses);
        trigger.value++;
    });
    
    for (const context_courses of Object.values(year_courses)) {
        courses_list = courses_list.concat(context_courses);
    }
    
    await executeLink($axios,"/v1/learning_blocks/correspondence?student_id=" + user.id,
        response => {
            for (const correspondence of response.data.data) {
                if (year_correspondences[selected_year.value] == undefined) {
                    year_correspondences[selected_year.value] = {};
                }
                if (year_correspondences[selected_year.value][correspondence.course_id] == undefined) {
                    year_correspondences[selected_year.value][correspondence.course_id] = [correspondence.block_id];
                } else {
                    year_correspondences[selected_year.value][correspondence.course_id].push(correspondence.block_id);
                }
            }
        },
        () => [],
        "post",{
            courses: courses_list.map((a : any) => a.id)
        });
    updateTable(year_correspondences,courses)
}
</script>

<style>
ion-modal#grades_manages {
    --width: fit-content;
    --height: fit-content;
}
</style>