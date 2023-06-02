<template>
    <div class="ion-padding-horizontal">
        <custom-select
            v-model="selected_year"
            :list="school_years"
            :label="getCurrentElement(store,'school_year') + ':'"
            :aria_label="getCurrentElement(store,'school_year')"
            :placeholder="getCurrentElement(store,'school_year_choice')"
        ></custom-select>
        <suspense>
          <template #default>
            <ionic-table :data="tableData" :first_row="firstRow" :column_sizes="column_sizes" @execute_link="getIntermediateGrades()"></ionic-table>
          </template>
          <template #fallback>
            <loading-component />
          </template>
        </suspense>
    </div>
</template>

<script setup lang="ts">
import { CurriculumCourse, CustomElement } from "@/types";
import { executeLink, getCurrentElement } from "@/utils";
import { AxiosInstance } from "axios";
import { inject, ref, Ref } from "vue";
import { useStore } from "vuex";

const getIntermediateGrades = () => console.log(store.state.request);

const store = useStore();
const $axios : AxiosInstance | undefined = inject("$axios");
const user_id : string = store.state.user.id;

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
    id: "intermediate_gardes",
    type: "string",
    content: getCurrentElement(store,"intermediate_grades")
},{
    id: "final_grade",
    type: "string",
    content: getCurrentElement(store,"final_grade")
}];
const column_sizes = [4,1,1,2,2,2]

let school_years : any[] = [];
let selected_year : Ref<any>;
let courses : CurriculumCourse[];
//let courses_id : number[] = [];

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
            tableData.push(course.toTableRow(store,correspondences[course.id][correspondences[course.id].length-1]));
        }
    }
}
</script>

<style>

</style>