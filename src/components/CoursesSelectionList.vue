<template>
    <div class="ion-padding-horizontal">
        <ion-alert
            :is-open="openAlert"
            :header="getCurrentElement(store,'error')"
            :message="getCurrentElement(store,'maximumCreditsError')"
            :buttons="alertButtons"
            @didDismiss="setAlertStatus(false)"
        ></ion-alert>
        <suspense>
            <template #default>
                <block-description :key="trigger" :id="$route.params.id" />
            </template>
            <template #fallback>
                <loading-component />
            </template>
        </suspense>
        <custom-select v-model="selected_area" :list="learning_areas" :label="learning_area + ':'" :aria_label="learning_area" :placeholder="placeholder" :getCompleteName="getCorrectName" />
        <list-card :key="trigger" @execute_link="changeEnrollment($axios,store,courses,remainingCredits,selected_area)" :emptiness_message="getCurrentElement(store,'noCourses')" v-model:cards_list="courses" />
    </div>
</template>

<script setup lang="ts">
import { CardsList, CourseCardElements, CourseSummary, CourseSummaryProps, Language, LearningArea, LearningBlock, LearningBlockStatus, OrderedCardsList } from '@/types';
import { executeLink, getCurrentElement, updateCourses } from '@/utils';
import { IonAlert } from '@ionic/vue';
import { AxiosInstance } from 'axios';
import { inject, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Store, useStore } from 'vuex';

const changeEnrollment = ($axios : AxiosInstance | undefined, store : Store<any>, courses : OrderedCardsList, remainingCredits : {[key : string]: number}, selected_area : string) => {

    const requestArray = store.state.request.url.split("?");
    const pathArray = requestArray[0].split("/");
    const queryArray = requestArray[1].split("&");
    const learning_block_id = queryArray[0].split("=")[1];
    const action = pathArray[pathArray.length -1];
    const unscribe = action == "unscribe";
    const course = courses.cards[""].find(c => c.id == "" + learning_block_id) as CourseCardElements;

    const reload = (response : any) => {

        const pendingDate = new Date(response.data.data ?? "no date");
        const isPending = !isNaN(pendingDate.getTime());

        updateCourses(courses,learning_block_id, isPending ? pendingDate : (unscribe ? false : (response.data ?? true)));
        if (!isPending) {
            remainingCredits[selected_area] += (unscribe ? 1 : -1) * course.credits;
        }
        trigger.value++;
    };

    if ($axios != undefined) {
        if (unscribe || remainingCredits[selected_area] >= course.credits) {
            executeLink($axios,undefined,reload,err => err,undefined,undefined,store);
        } else {
            return new Promise(() => setAlertStatus(true));
        }
    } else {
        console.error("Connection failed");
    }
}
const getCorrectName = (option: LearningArea) => option[`${language}_title`];
const setAlertStatus = (state: boolean) => {
    openAlert.value = state;
};

const store = useStore();
const $axios : AxiosInstance | undefined = inject("$axios");
const $route = useRoute();
const language : Language = store.state.language;
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
const learning_area = getCurrentElement(store,"learning_area");
const placeholder = getCurrentElement(store,"select") + (language == "italian" ? " l'" : " the ") + learning_area;
const alertButtons = [getCurrentElement(store,"ok")];
const openAlert = ref(false);
const selected_area = ref("");

let learning_areas : LearningArea[] = [];
let learning_blocks : LearningBlock[];
let learning_block : LearningBlock | undefined;
let learning_block_position : number;

if ($axios != undefined) {
    learning_blocks = await executeLink($axios,"/v1/learning_blocks?year_of=" + learning_block_id,
        response => response.data.data.map((a : any) => new LearningBlock(a)),
        () => []);
    learning_block_position = learning_blocks.findIndex(a => a.id == parseInt(learning_block_id));
    learning_block = learning_blocks[learning_block_position];
    
    if (learning_block != undefined) {
        learning_areas = await executeLink($axios,"/v1/learning_areas?all_data=true&credits=true&block_id=" + learning_block_id,
            response => response.data.data,
            () => []);
        selected_area.value = learning_areas.length > 0 ? learning_areas[0].id : "";
        for (const learning_area of learning_areas) {
            promises.push(executeLink($axios,"/v1/courses?student_id=" + user_id + "&block_id=" + learning_block_id + "&area_id=" + learning_area.id,
                response => {
                    const tmp_courses : CourseSummaryProps[] = response.data.data;
                    remainingCredits[learning_area.id] = tmp_courses.reduce((a,b) => b.pending === "true" ? a - b.credits : a,learning_area.credits);
                    all_courses[learning_area.id] = tmp_courses
                        .map(x => (new CourseSummary(x))
                            .toCard(
                                store,
                                (learning_block as LearningBlock),
                                "/v1/students/" + user_id + "/" + (x.pending !== "false" ? "unscribe" : "inscribe") + "?course_id=" + x.id + "&block_id=" + learning_block_id,
                                learning_block?.getStatus() == LearningBlockStatus.FUTURE && (learning_block_position == 0 || learning_blocks[learning_block_position - 1]?.getStatus() == LearningBlockStatus.CURRENT)));
                },
                () => all_courses[learning_area.id] = []));
        }
        await Promise.all(promises);
        courses.cards[""] = all_courses[selected_area.value] ?? [];
        watch(selected_area,n => {
            courses.cards[""] = all_courses[n] ?? [];
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