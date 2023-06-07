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
        <custom-select
            v-model="selected_year"
            :list="school_years"
            :label="getCurrentElement(store,'school_year') + ':'"
            :aria_label="getCurrentElement(store,'school_year')"
            :placeholder="getCurrentElement(store,'school_year_choice')"
        ></custom-select>
        <suspense>
          <template #default>
            <ionic-table :data="tableData" :first_row="firstRow" :column_sizes="column_sizes" @signal_event="SetupModalAndOpen(store)"></ionic-table>
          </template>
          <template #fallback>
            <loading-component />
          </template>
        </suspense>
    </div>
</template>

<script setup lang="ts">
import { CurriculumCourse, CustomElement, GradesParameters } from "@/types";
import { executeLink, getCurrentElement } from "@/utils";
import { IonModal } from "@ionic/vue";
import { AxiosInstance } from "axios";
import { inject, ref, Ref } from "vue";
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

const store = useStore();
const $axios : AxiosInstance | undefined = inject("$axios");
const user_id : number = store.state.user.id;

const correspondences : {
    [key : number]: number[]
} = {};
const tableData : CustomElement[][] = [];
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

let school_years : any[] = [];
let selected_year : Ref<any>;
let courses : CurriculumCourse[];
let grades_title : string;
let grades_parameters : GradesParameters;
let description_title : string;
let description_course_id : GradesParameters;

if ($axios != undefined) {
    school_years = await executeLink($axios,"/v1/ordinary_classes?descending=true&student_id=" + user_id,
        response => {
            return response.data.data.map((a: any) => {
                return {
                    id: a.school_year
                }
            });
        },
        () => []);
    selected_year = ref(school_years[0].id);
    courses = await executeLink($axios,"/v1/students/" + user_id + "/curriculum?school_year=" + selected_year.value,
        response => response.data.data.map((a: any) => {
            //courses_id.push(a.id);
            return new CurriculumCourse(a)
        }),
        () => []);
    await executeLink($axios,"/v1/learning_blocks/correspondence?student_id=" + user_id,
        response => {
            for (const correspondence of response.data.data) {
                //courses_id = courses_id.filter((a : any) => a.id == correspondence.course_id)
                if (correspondences[correspondence.course_id] == undefined) {
                    correspondences[correspondence.course_id] = [correspondence.block_id]
                } else {
                    correspondences[correspondence.course_id].push(correspondence.block_id)
                }
            }
        },
        () => [],
        "post",{
            courses: courses.map((a : any) => a.id)
        });
    for (const course of courses) {
        if (correspondences[course.id].length > 0) {
            tableData.push(course.toTableRow(store,correspondences[course.id][correspondences[course.id].length-1],user_id));
        }
    }
}
</script>

<style>
ion-modal#grades_manages {
    --width: fit-content;
    --height: fit-content;
}
</style>