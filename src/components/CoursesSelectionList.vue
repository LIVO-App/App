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
        <list-card :key="trigger" @execute_link="changeEnrollment($axios,remainingCredits,selected_area)" :emptiness_message="elements[language].noCourses" v-model:cards_list="courses" />
    </div>
</template>

<script setup lang="ts">
import { CardsList, CourseCardElements, CourseSummary, CourseSummaryProps, ElementsList, Language, LearningArea, LearningBlock, LearningBlockStatus, OrderedCardsList } from '@/types';
import { executeLink } from '@/utils';
import { AxiosInstance } from 'axios';
import { inject, Ref, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

function updateCourses(courses : OrderedCardsList, learning_block_id : number, value : Date | boolean) {

    const course = courses.cards[""].find(c => c.id == "" + learning_block_id) as CourseCardElements;
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
    const course = courses.cards[""].find(c => c.id == "" + learning_block_id) as CourseCardElements;

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
const learning_block_id : string = $route.params.id as string;

const all_courses : CardsList<CourseCardElements> = {};
const promises = [];
const courses : OrderedCardsList<CourseCardElements> = {
    order: [],
    cards: {}
};
const trigger = ref(0);
const remainingCredits : {
    [key : string]: number
} = {};
const getCorrectName = (option: LearningArea) => option[`${language}_title`];
const learning_area = elements[language].learning_area;
const placeholder = elements[language].select + (language == "italian" ? " l'" : " the ") + learning_area;

let learning_areas : LearningArea[] = [];
let selected_area : Ref<string>;
let learning_blocks : LearningBlock[];
let learning_block : LearningBlock | undefined;
let learning_block_position : number;

if ($axios != undefined) {
    learning_blocks = await executeLink($axios,store,response => response.data.data.map((a : any) => new LearningBlock(a)),() => [],"/v1/learning_blocks?year_of=" + learning_block_id);
    /*learning_block = await $axios.get("/v1/learning_blocks/" + learning_block_id)
        .then(response => new LearningBlock(response.data.data))
        .catch(() => undefined);*/
    learning_block_position = learning_blocks.findIndex(a => a.id == parseInt(learning_block_id));
    learning_block = learning_blocks[learning_block_position];
    
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
                                "/v1/students/" + user_id + "/" + (x.pending === "true" ? "unscribe" : "inscribe") + "?course_id=" + x.id + "&block_id=" + learning_block_id,
                                learning_block?.getStatus(new Date()) == LearningBlockStatus.FUTURE && (learning_block_position == 0 || learning_blocks[learning_block_position - 1]?.getStatus(new Date()) == LearningBlockStatus.CURRENT)));
                })
                .catch(() => all_courses[learning_area.id] = []));
                
        }
        await Promise.all(promises);
        courses.cards[""] = all_courses[selected_area.value];
        watch(selected_area,n => {
            courses.cards[""] = all_courses[n];
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