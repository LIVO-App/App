<template>
    <ion-header>
        <ion-toolbar>
            <ion-grid>
                <ion-row class="ion-text-center ion-align-items-center">
                    <ion-col>
                        <ionic-element :element="getCustomMessage('title', title, 'title')" />
                    </ion-col>
                    <ion-col size="auto">
                        <ionic-element :element="elements.close" @signal_event="$emit('close')" />
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-toolbar>
    </ion-header>
    <ion-content>
        <ion-grid>
            <ion-row>
                <ion-col>
                    <ionic-element
                        :element="getCustomMessage('actual_course', getCurrentElement('actual_course') + ':', 'title', colors)" />
                    <div>
                        <ionic-element
                            :element="getCustomMessage('learning_context_area_title', getCurrentElement('learning_context') + ' - ' + getCurrentElement('learning_area'), 'title', colors)" />
                        <ionic-element :element="getCustomMessage('learning_context_area', ': ' + (origin.learning_context != undefined
                            ? origin.learning_context[`${language}_title`] : '')
                            + ' - ' + (origin.learning_area != undefined
                                ? origin.learning_area[`${language}_title`] : ''), 'string', colors)" />
                    </div>
                    <div :key="element.id" v-for="element in project_class_card.content">
                        <ionic-element :element="element" />
                    </div>
                    <div>
                        <ionic-element
                            :element="getCustomMessage('credits', getCurrentElement('credits'), 'title', colors)" />
                        <ionic-element :element="getCustomMessage('credits',
                            ': ' + (origin.course != undefined
                                ? isCourse(origin.course)
                                    ? origin.course.credits
                                    : origin.course[1].content
                                : ''), 'string', colors)" />
                    </div>
                </ion-col>
            </ion-row>
            <ion-row class="">
                <ion-col>
                    <hr style="border-top: 1px solid var(--ion-color-black);" />
                    <ionic-element
                        :element="getCustomMessage('constraints', getCurrentElement('constraints').toUpperCase(), 'title', colors)" />
                </ion-col>
            </ion-row>
            <ion-row>
                <ion-col>
                    <ionic-element :element="getCustomMessage('student_credits', getCurrentElement('credits'), 'title', colors)" />
                    <div v-html="credits_list"></div>
                </ion-col>
                <ion-col>
                    <ionic-element
                        :element="getCustomMessage('student_groups', getCurrentElement('groups_courses'), 'title', colors)" />
                    <div v-html="groups_list"></div>
                </ion-col>
            </ion-row>
            <ion-row>
                <ion-col>
                    <hr style="border-top: 1px solid var(--ion-color-black);" />
                    <ionic-element :element="getCustomMessage('choice', getCurrentElement('project_class_movement_choice'), 'title', colors, {
                        label: {
                            'ion-padding-top': true,
                            'ion-padding-start': true,
                        }
                    })" />
                </ion-col>
            </ion-row>
            <ion-row v-if="table_data.length > 0">
                <ion-col size="auto">
                    <custom-select v-model="selected_context" :list="learning_contexts"
                        :label="getCurrentElement('learning_context') + ':'"
                        :aria_label="getCurrentElement('learning_context')"
                        :placeholder="getCurrentElement('learning_context_choice')" :getCompleteName="getContextAcronym" />
                </ion-col>
                <ion-col size="auto">
                    <custom-select v-model="selected_area" :list="learning_areas_structures.distribution[selected_context]"
                        :label="learning_area_sentence + ':'" :aria_label="learning_area_sentence"
                        :placeholder="placeholder" :getCompleteName="getCorrectName" />
                </ion-col>
            </ion-row>
            <ion-row v-if="table_data.length > 0">
                <ion-col>
                    <ionic-table :key="trigger" :data="table_data" :first_row="first_row" :column_sizes="column_sizes"
                        @signal_event="
                            store.state.event.data.from = {
                                course_id: project_class.course_id,
                                session_id: project_class.learning_session.id,
                            };
                        $emit('signal_event')" />
                </ion-col>
            </ion-row>
            <ion-row v-else>
                <div class="ion-text-center ion-padding">
                    <ionic-element :element="getCustomMessage(
                        'emptiness_message',
                        getCurrentElement('no_courses'),
                        'string',
                        colors
                    )" />
                </div>
            </ion-row>
        </ion-grid>
    </ion-content>
</template>

<script setup lang="ts">
import { ProjectClassSummary, Colors, CourseCardElements, CourseReferences, CourseSummaryProps, CustomElement, GeneralSubElements, SubscriptionsManager, LearningContext, LearningSession, LearningArea, TmpList, UserSummary } from '@/types';
import { executeLink, getContextAcronym, getCurrentElement, getCurrentLanguage, getCustomMessage, getCssColor, getIcon, getLearningAreasStructures, getLearningContexts, isCourse } from '@/utils';
import { IonCol, IonContent, IonGrid, IonHeader, IonRow, IonToolbar } from '@ionic/vue';
import { PropType, ref, watch } from 'vue';
import { useStore } from 'vuex';

const getCorrectName = (option: LearningArea) => {
    const language = getCurrentLanguage();

    const tmp_learning_area = learning_areas_structures.list.find(a => a.id == option.id);

    return tmp_learning_area != undefined ? tmp_learning_area[`${language}_title`] : "";
}
const getCreditsList = () => { //<!-- TODO (7): Vedere se unire con getSessionList
    let list = "";

    for (const context of learning_contexts) {
        list += "<div><label" + (colors.text != undefined
            ? " style='color: " + getCssColor(colors.text) + "'"
            : "") + "><b>" + context[`${language}_title`] + ":</b>"
        if (context.credits != undefined) {
            list += " " + (context.credits - (props.subscriptions_manager.remaing_credits[context.id] as number)) + "/" + context.credits + "</label>";
        } else {
            list += "</label><ul class='ion-no-margin'" + (colors.text != undefined
                ? " style='color: " + getCssColor(colors.text) + "'"
                : "") + ">";
            for (const area of learning_areas_structures.list) {
                list += "<li>" + area[`${language}_title`] + ": " + ((area.credits ?? 0) - (props.subscriptions_manager.remaing_credits[context.id] as TmpList<number>)[area.id]) + "/" + area.credits + "</li>";
            }
            list += "</ul>"
        }
        list += "</div>";
    }

    return list;
}
const getGroupsList = () => {
    let list = "";
    let group_remaining_courses: TmpList<number>;
    let groups: string[];

    for (const context of learning_contexts) {
        list += "<div><label" + (colors.text != undefined
            ? " style='color: " + getCssColor(colors.text) + "'"
            : "") + "><b>"
            + context[`${language}_title`] + ":</b></label><ul class='ion-no-margin'" + (colors.text != undefined
                ? " style='color: " + getCssColor(colors.text) + "'"
                : "") + ">";
        if (context.credits != undefined) {
            group_remaining_courses = props.subscriptions_manager.getGroupRemainingCourses(context.id);
            groups = Object.keys(group_remaining_courses);
            for (const group of groups) {
                list += "<li>" + group + ": " + (store.state.courses_per_group - (group_remaining_courses[group])) + "/" + store.state.courses_per_group + "";
            }
        } else {
            for (const area of learning_areas_structures.list) {
                group_remaining_courses = props.subscriptions_manager.getGroupRemainingCourses(context.id, area.id);
                groups = Object.keys(group_remaining_courses);
                list += "<li><label>"
                    + area[`${language}_title`] + ":</label>"
                    + "<ul class='ion-no-margin'>";
                for (const group of groups) {
                    list += "<li>" + group + ": " + (store.state.courses_per_group - (group_remaining_courses[group])) + "/" + store.state.courses_per_group + "";
                }
                list += "</ul></li>";
            }
        }
        list += "</ul></div>";
    }

    return list;
}

const store = useStore();
const language = getCurrentLanguage();

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    student_id: {
        type: Number,
        required: true,
    },
    learning_sessions: Array<LearningSession>,
    project_class: {
        type: Object as PropType<ProjectClassSummary>,
        required: true,
    },
    section: {
        type: String,
        required: true,
    },
    subscriptions_manager: {
        type: Object as PropType<SubscriptionsManager>,
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
};
const first_row: CustomElement[] = [{
    id: "group",
    type: "string",
    content: getCurrentElement("group"),
}, {
    id: "credits",
    type: "string",
    content: getCurrentElement("credits"),
}, {
    id: "course",
    type: "string",
    content: getCurrentElement("course"),
}];
const colors: Colors<GeneralSubElements> = {
    text: {
        name: "primary",
        type: "var",
    },
};
const column_sizes = store.state.sections_use ? [2, 2, 5, 2, 1] : [2, 2, 6, 2];
const project_class_card = props.project_class.toCard(undefined, props.section);
const learning_sessions: LearningSession[] = props.learning_sessions ?? await executeLink(
    "/v1/learning_sessions?year_of=" + props.project_class.learning_session.id,
    (response) => response.data.data.map((a: any) => new LearningSession(a)),
    () => []
);
const origin: {
    references: CourseReferences | undefined;
    course: CustomElement[] | CourseCardElements | undefined;
    learning_context: LearningContext | undefined;
    learning_area: LearningArea | undefined;
} = {
    references: undefined,
    course: undefined,
    learning_context: undefined,
    learning_area: undefined,
};
const student = new UserSummary({
    id: props.student_id,
    user: "student",
});
const learning_contexts = await getLearningContexts(student, "" + props.project_class.learning_session.id); //<!-- TODO (6): sistemare id (es. tutti stringa)
const learning_areas_structures = await getLearningAreasStructures(learning_contexts, "" + props.project_class.learning_session.id);

const selected_context = ref(learning_contexts.length > 0
    ? learning_contexts[0].id
    : "");
const selected_area = ref(learning_areas_structures.distribution[selected_context.value].length > 0
    ? learning_areas_structures.distribution[selected_context.value][0].id
    : "");
const learning_area_sentence = getCurrentElement("learning_area");
const placeholder =
    getCurrentElement("select") +
    (language == "italian" ? " l'" : " the ") +
    learning_area_sentence; //<!-- TODO (4): sistemare quando verrà messa la lista parametri a getCurrentElement
const trigger = ref(0);
let credits_list = "";
let groups_list = "";

let table_data: CustomElement[][] = [];
let tmp_courses: CourseSummaryProps[];

project_class_card.colors = colors;
for (const element of project_class_card.content as CustomElement[]) {
    element.colors = colors;
}
if (learning_contexts.length > 0 && learning_areas_structures.list.length > 0) {
    if (store.state.sections_use) {
        first_row.push({
            id: "section",
            type: "string",
            content: getCurrentElement("section"),
        });
    }
    first_row.push({
        id: "move_student",
        type: "string",
        content: "",
    });

    tmp_courses = await executeLink(
        "/v2/courses?student_id=" +
        props.student_id +
        "&session_id=" +
        props.project_class.learning_session.id,
        (response) => response.data.data.map((a: CourseSummaryProps) => {
            a.section = "A"; //<!-- TODO (4): gestire sezioni
            return a;
        }),
        () => []
    );

    if (tmp_courses.length > 0) {
        await props.subscriptions_manager.loadParameters(student, learning_contexts, learning_areas_structures.list, learning_sessions, tmp_courses, "" + props.project_class.learning_session.id);
        origin.references = props.subscriptions_manager.getCourseReferences("" + props.project_class.course_id);
        origin.course = origin.references != undefined ? props.subscriptions_manager.getCourse(origin.references) : undefined;
        origin.learning_context = learning_contexts.find(a => a.id == origin.references?.learning_context_id);
        origin.learning_area = learning_areas_structures.list.find(a => a.id == origin.references?.learning_area_id);
        props.subscriptions_manager.showCourses(selected_context.value, selected_area.value, ["" + props.project_class.course_id]);
        table_data = props.subscriptions_manager.courses as CustomElement[][];
        credits_list = getCreditsList();
        groups_list = getGroupsList();

        watch(selected_area, async (new_area) => {
            props.subscriptions_manager.showCourses(selected_context.value, new_area, ["" + props.project_class.course_id]);
            table_data = props.subscriptions_manager.courses as CustomElement[][];
            trigger.value++;
        });
    }
}
watch(selected_context, async (new_context) => {
    selected_area.value = learning_areas_structures.distribution[new_context][0].id;
    if (tmp_courses.length > 0) {
        props.subscriptions_manager.showCourses(new_context, selected_area.value, ["" + props.project_class.course_id]);
        table_data = props.subscriptions_manager.courses as CustomElement[][];
    }
    trigger.value++;
});
</script>

<style></style>