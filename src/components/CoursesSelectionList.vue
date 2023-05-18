<template>
    <div class="ion-padding-horizontal">
        <suspense>
            <template #default>
                <block-description :key="trigger" :id="$route.params.id" />
            </template>
            <template #fallback>
                <loading-component />
            </template>
        </suspense>
        <custom-select v-model="selected_area" :list="learning_areas" :label="learning_area + ':'" :aria_label="learning_area" :placeholder="placeholder" :getCompleteName="getCorrectName" />
        <list-card :key="trigger" @execute_link="changeEnrollment($axios,remainingCredits,selected_area)" :emptiness_message="elements[language].noCourses" v-model:cards="courses" />
    </div>
</template>

<script setup lang="ts">
import { CardsList, CourseCardElements, CourseSummary, CourseSummaryProps, ElementsList, Language, LearningArea, LearningBlock } from '@/types';
import { executeLink } from '@/utils';
import { AxiosInstance } from 'axios';
import { inject, Ref, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

function updateCourses(courses : CardsList, learning_block_id : number, value : Date | boolean) {

    const course = courses[""].find(c => c.id == "" + learning_block_id) as CourseCardElements;
    const requestArray = course.url?.split("?") ?? ["",""];
    const pathArray = requestArray[0].split("/");
    pathArray?.pop();

    course.enrollment.enrollment = value;
    course.url = pathArray.join("/") + (value === false ? "/inscribe?" : "/unscribe?") + requestArray[1];
}

async function changeEnrollment($axios : AxiosInstance | undefined, remainingCredits : {[key : string]: number}, selected_area : string) {

    const requestArray = store.state.request.url.split("?");
    const pathArray = requestArray[0].split("/");
    const queryArray = requestArray[1].split("&");
    const learning_block_id = queryArray[0].split("=")[1];
    const action = pathArray[pathArray.length -1];
    const unscribe = action == "unscribe";
    const course = courses[""].find(c => c.id == "" + learning_block_id) as CourseCardElements;

    const reload = (response : any) => {
        updateCourses(courses,learning_block_id, unscribe ? false : (response.data ?? true));
        remainingCredits[selected_area] += (unscribe ? 1 : -1) * course.credits;
        trigger.value++;
    };

    if ($axios != undefined && (unscribe || remainingCredits[selected_area] >= course.credits)) {
        executeLink($axios,store,reload);
    } else {
        //Vedere se fare qualcosa
    }
}

const store = useStore();
const $axios : AxiosInstance | undefined = inject("$axios");
const $route = useRoute();
const language : Language = store.state.language
const elements : ElementsList = store.state.elements;
const user_id : string = store.state.user.id;
const learning_block_id = $route.params.id;

const all_courses : {
    [key : string]: CourseCardElements[]
} = {};
const promises = [];
const courses : CardsList = {};
const trigger = ref(0);
const remainingCredits : {
    [key : string]: number
} = {};
const getCorrectName = (option: LearningArea) => option[`${language}_title`];
const learning_area = elements[language].learning_area;
const placeholder = elements[language].select + (language == "italian" ? " l'" : " the ") + learning_area;

let learning_areas : LearningArea[] = [];
let selected_area : Ref<string>;
let learning_block : LearningBlock | undefined;

if ($axios != undefined) {
    learning_block = await $axios.get("/v1/learning_blocks/" + learning_block_id)
        .then(response => new LearningBlock(response.data.data))
        .catch(() => undefined);
    if (learning_block != undefined) {
        learning_areas = await $axios.get("/v1/learning_areas?all_data=true&credits=true&block_id=" + learning_block_id)
            .then(response => response.data.data)
            .catch(() => []);
        selected_area = ref(learning_areas[0].id);
        for (const learning_area of learning_areas) {
            promises.push($axios.get("/v1/courses?student_id=" + user_id + "&block_id=" + learning_block_id + "&area_id=" + learning_area.id)
                .then(response => {
                    const tmp_courses : CourseSummaryProps[] = response.data.data;
                    remainingCredits[learning_area.id] = tmp_courses.reduce((a,b) => b.pending === "true" ? a - b.credits : a,learning_area.credits);
                    all_courses[learning_area.id] = tmp_courses
                        .map(x => (new CourseSummary(x))
                            .toCard(
                                store,
                                (learning_block as LearningBlock),
                                new Date(),
                                "/v1/students/" + user_id + "/" + (x.pending === "true" ? "unscribe" : "inscribe") + "?course_id=" + x.id + "&block_id=" + learning_block_id))
                    })
                .catch(() => all_courses[learning_area.id] = []));
        }
        await Promise.all(promises);
        courses[""] = all_courses[selected_area.value];
        watch(selected_area,(n,o) => {
            courses[""] = all_courses[n];
            trigger.value++;
        })
    }
} else {
    console.error("Connection failed");
}
</script>

<style>
ion-select {
    width: fit-content
}
</style>