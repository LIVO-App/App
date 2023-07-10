<template>
    <div class="ion-padding-horizontal">
        <ion-alert
            :is-open="openAlert"
            :header="getCurrentElement(store,'error')"
            :message="getCurrentElement(store,'maximumCreditsError')"
            :buttons="alertButtons"
            @didDismiss="setAlertStatus(false)"
        ></ion-alert>
        <ion-modal :is-open="description_open" @didDismiss="closeModal()">
            <suspense>
                <template #default>
                    <course-description :title="description_title" :course_id="description_course_id" @close="closeModal()"></course-description>
                </template>
                <template #fallback>
                    <loading-component />
                </template>
            </suspense>
        </ion-modal>
        <suspense>
            <template #default>
                <block-description :key="trigger" :id="$route.params.id" :learning_context="toSummary(learning_contexts.find(a => a.id == selected_context))" />
            </template>
            <template #fallback>
                <loading-component />
            </template>
        </suspense>
        <ion-grid>
            <ion-row>
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
                <ion-col size="auto">
                    <custom-select
                        v-model="selected_area"
                        :list="learning_areas"
                        :label="learning_area + ':'"
                        :aria_label="learning_area"
                        :placeholder="placeholder"
                        :getCompleteName="getCorrectName"
                    />
                </ion-col>
            </ion-row>
        </ion-grid>
        <list-card :key="trigger" @execute_link="changeEnrollment()" @signal_event="openModal()" :emptiness_message="getCurrentElement(store,'noCourses')" v-model:cards_list="courses" />
    </div>
</template>

<script setup lang="ts">
import { CardsList, CourseCardElements, CourseSummary, CourseSummaryProps, Enrollment, Language, LearningArea, LearningBlock, LearningBlockStatus, LearningContext, OrderedCardsList, RequestIcon } from '@/types';
import { executeLink, getCurrentElement, getEnrollmentIcon, toSummary } from '@/utils';
import { IonAlert, IonModal, IonGrid, IonRow, IonCol } from '@ionic/vue';
import { AxiosInstance } from 'axios';
import { inject, Ref, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Store, useStore } from 'vuex';

type RemainingCredits = {
    [key : number]: TmpList | number
};

type TmpList = {
    [key: string]: number
}

const updateCourses = (course : CourseCardElements, value : Date | boolean) => {

    const contexts_to_edit = course_correspondences.filter(a => "" + a.course_id == course.id);
    const requestArray = (course.content[3].content as RequestIcon).url.split("?") ?? ["",""];
    const pathArray = requestArray[0].split("/");
    pathArray?.pop();

    let tmp_context : LearningContext | undefined;//, edited_course : CourseCardElements;  // Da sistemare: forse problema per non aver fatto copia profonda
    
    for (const context_reference of contexts_to_edit) {
        tmp_context = learning_contexts.find(a => a.acronym == context_reference.context_acronym);
        if (tmp_context != undefined) {
            if (tmp_context.id == selected_context.value) {
                    course.enrollment.enrollment = value;
                    course.content[2].content = course.enrollment.toString(store);
                    course.content[3].content = getEnrollmentIcon(store, course.enrollment, pathArray.join("/") + (value === false ? "/inscribe?" : "/unscribe?") + requestArray[1], course.enrollment.getChangingMethod());
                    
            } else {
                course.enrollment.editable = false; // Da sistemare: chiedere se in backend, quando è presente il corso per due contesti, c'è il controllo che non sia iscritto nell'altro contesto
            }

            all_courses[tmp_context.id][selected_area.value] = all_courses[tmp_context.id][selected_area.value].filter(a => a.id != course.id);
            all_courses[tmp_context.id][selected_area.value].push(course);
        }
    }
}

const changeEnrollment = () => {

    const requestArray = store.state.request.url.split("?");
    const pathArray = requestArray[0].split("/");
    const queryArray = requestArray[1].split("&");
    const learning_block_id = queryArray[0].split("=")[1];
    const action = pathArray[pathArray.length -1];
    const unscribe = action == "unscribe";
    const course = courses.cards[""].find(c => c.id == "" + learning_block_id) as CourseCardElements;

    if ($axios != undefined) {
        if (unscribe
            || typeof remaining_credits[selected_context.value] == 'number' && (remaining_credits[selected_context.value] as number) >= course.credits
            || (remaining_credits[selected_context.value] as TmpList)[selected_area.value] >= course.credits) {
                executeLink($axios,undefined,
                    (response : any) => {
                        
                        const pendingDate = new Date(response.data.data ?? "no date");
                        const wasPending = course.enrollment.isPending();
                        const isPending = !isNaN(pendingDate.getTime());

                        updateCourses(course, isPending ? pendingDate : (unscribe ? false : (response.data ?? true)));
                        if (!wasPending && !isPending) {
                            if (typeof remaining_credits[selected_context.value] == 'number') {
                                (remaining_credits[selected_context.value] as number) += (unscribe ? 1 : -1) * course.credits;
                            } else {
                                (remaining_credits[selected_context.value] as TmpList)[selected_area.value] += (unscribe ? 1 : -1) * course.credits;
                            }
                        }
                        trigger.value++;
                    },
                    err => console.error(err),undefined,undefined,store);
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
const closeModal = () => description_open.value = false;
const openModal = () => {
    description_title = store.state.event.data.title;
    description_course_id = store.state.event.data.course_id;
    description_open.value = true;
};
const getContextAxronym = (option: LearningContext) => option[`${language}_title`];

const store = useStore();
const $axios : AxiosInstance | undefined = inject("$axios");
const $route = useRoute();
const language : Language = store.state.language;
const user_id : string = store.state.user.id;
const learning_block_id : string = $route.params.id as string;

const all_courses : {
    [key: number]: CardsList<CourseCardElements>
} = {};
const courses : OrderedCardsList<CourseCardElements> = {
    order: [],
    cards: {}
};
const trigger = ref(0);
const remaining_credits : RemainingCredits = {};
const learning_area = getCurrentElement(store,"learning_area");
const placeholder = getCurrentElement(store,"select") + (language == "italian" ? " l'" : " the ") + learning_area;
const alertButtons = [getCurrentElement(store,"ok")];
const openAlert = ref(false);
const selected_area = ref("");
const description_open = ref(false);

let learning_areas : LearningArea[] = [];
let learning_blocks : LearningBlock[];
let learning_block : LearningBlock | undefined;
let learning_block_position : number;
let description_title : string;
let description_course_id : number;
let selected_context : Ref<number>;
let learning_contexts : LearningContext[] = [];
let tmp_courses : CourseSummaryProps[];
let courses_ids : number[];
let course_correspondences: {
    course_id: number,
    context_acronym: string
}[];

if ($axios != undefined) {
    learning_blocks = await executeLink($axios,"/v1/learning_blocks?year_of=" + learning_block_id,
        response => response.data.data.map((a : any) => new LearningBlock(a)),
        () => []);
    learning_block_position = learning_blocks.findIndex(a => a.id == parseInt(learning_block_id));
    learning_block = learning_blocks[learning_block_position];
    
    if (learning_block != undefined) {
        learning_contexts = await executeLink($axios,"/v1/learning_contexts?student_id=" + user_id + "&block_id=" + learning_block_id,
            response => {

                const tmp_contexts : LearningContext[] = [];

                for (const learning_context of response.data.data) {
                    if (store.state.excluded_learning_contexts_id.findIndex((a: number) => a != learning_context.id) != -1) {
                        tmp_contexts.push(learning_context);
                    }
                }

                return tmp_contexts;
            },
            () => []);
        selected_context = ref(learning_contexts[0].id);

        learning_areas = await executeLink($axios,"/v1/learning_areas?all_data=true&credits=true&block_id=" + learning_block_id,
            response => response.data.data,
            () => []);
        selected_area.value = learning_areas.length > 0 ? learning_areas[0].id : "";
        
        tmp_courses = await executeLink($axios,"/v1/courses?student_id=" + user_id + "&block_id=" + learning_block_id,
            response => response.data.data,
            () => []);
        courses_ids = tmp_courses.map((a: CourseSummaryProps) => a.id);
        
        await executeLink($axios,"/v1/learning_contexts/correspondence?student_id=" + user_id + "&block_id=" + learning_block_id,
            response => {

                let course_props, tmp_course: CourseSummary, tmp_learning_area : LearningArea | undefined, open_enrollment, learning_context_index, tmp_learning_context : LearningContext;

                course_correspondences = response.data.data;
                for (const correspondence of course_correspondences) {
                    course_props = tmp_courses.find(a => a.id == correspondence.course_id);
                    learning_context_index = learning_contexts.findIndex(a => a.acronym == correspondence.context_acronym); // Da sistemare: cambiare con id quando verrà cambiato nel backend
                    if (course_props != undefined && learning_context_index != -1) {
                        tmp_learning_context = learning_contexts[learning_context_index];
                        tmp_course = new CourseSummary(course_props);
                        tmp_learning_area = learning_areas.find(a => a.id == (tmp_course.learning_area_ref.data as {id:string}).id);
                        if (tmp_learning_area != undefined) {
                            if (all_courses[tmp_learning_context.id] == undefined) {
                                all_courses[tmp_learning_context.id] = {};
                                for (const learning_area of learning_areas) {
                                    all_courses[tmp_learning_context.id][learning_area.id] = [];
                                }
                            }
                            open_enrollment = learning_block?.getStatus() == LearningBlockStatus.FUTURE && (learning_block_position == 0 || learning_blocks[learning_block_position - 1]?.getStatus() == LearningBlockStatus.CURRENT);
                            all_courses[tmp_learning_context.id][tmp_learning_area.id].push(tmp_course.toCard(
                                store,
                                (learning_block as LearningBlock),
                                open_enrollment ? "/v1/students/" + user_id + "/" + (tmp_course.pending !== "false" ? "unscribe" : "inscribe") + "?course_id=" + tmp_course.id + "&block_id=" + learning_block_id + "&context_id=" + tmp_learning_context.id : undefined,
                                undefined,
                                open_enrollment));
                            if (tmp_learning_context.credits != null) {
                                if (remaining_credits[tmp_learning_context.id] == undefined) {
                                    remaining_credits[tmp_learning_context.id] = tmp_learning_context.credits;
                                }
                                if (tmp_course.pending === "true") {
                                    (remaining_credits[tmp_learning_context.id] as number) -= tmp_course.credits;
                                }
                                //remaining_credits[tmp_learning_context.id] = tmp_courses.reduce((a,b) => b.pending === "true" && b.learning_context_acronym == tmp_learning_context.acronym ? a - b.credits : a,tmp_learning_context.credits);
                            } else {
                                if (remaining_credits[tmp_learning_context.id] == undefined) {
                                    remaining_credits[tmp_learning_context.id] = {};
                                }
                                if ((remaining_credits[tmp_learning_context.id] as TmpList)[tmp_learning_area.id] == undefined) {
                                    (remaining_credits[tmp_learning_context.id] as TmpList)[tmp_learning_area.id] = tmp_learning_area.credits;
                                }
                                if (tmp_course.pending === "true") {
                                    (remaining_credits[tmp_learning_context.id] as TmpList)[tmp_learning_area.id] -= tmp_course.credits;
                                }
                                //(remaining_credits[tmp_learning_context.id] as TmpList)[tmp_learning_area.id] = tmp_courses.reduce((a,b) => b.pending === "true" ? a - b.credits : a,tmp_learning_area.credits);
                            }
                        }
                    }
                }
            },
            err => console.error(err),
            "post",
            {
                courses: courses_ids
            });
        courses.cards[""] = all_courses[selected_context.value][selected_area.value] ?? [];
        
        watch(selected_context,n => {
            courses.cards[""] = all_courses[n][selected_area.value] ?? [];
            trigger.value++;
        });
        watch(selected_area,n => {
            courses.cards[""] = all_courses[selected_context.value][n] ?? [];
            trigger.value++;
        });
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