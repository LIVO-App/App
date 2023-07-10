<template>
    <div class="ion-padding-horizontal">
        <ion-alert
            :is-open="alert_open"
            :header="alert_information.title"
            :message="alert_information.message"
            :buttons="alert_information.buttons"
            @didDismiss="closeModal(store.state.event.name)"
        ></ion-alert>
        <ion-modal id="grades_manages" :is-open="grades_open" @didDismiss="closeModal('grades')">
            <suspense>
                <template #default>
                    <grades-manager :title="grades_title" :parameters="grades_parameters" :grades="student_grades" @close="closeModal('grades')" @execute_link="add_grade()" @signal_event="setupModalAndOpen(store)" />
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
        <div>
            <ionic-element v-for="button in buttons" :key="button.id" :element="button" @signal_event="setupModalAndOpen(store)" @execute_link="$router.push(store.state.request.url)" />
        </div>
        <custom-select
            v-model="selected_section"
            :list="sections"
            :label="getCurrentElement(store,'section') + ':'"
            :aria_label="getCurrentElement(store,'section')"
            :placeholder="getCurrentElement(store,'section_choice')"
        ></custom-select>
        <suspense>
          <template #default>
            <ionic-table :key="trigger" :data="table_data" :first_row="firstRow" :column_sizes="column_sizes" @signal_event="setupModalAndOpen(store)" />
          </template>
          <template #fallback>
            <loading-component />
          </template>
        </suspense>
    </div>
</template>

<script setup lang="ts">
import { CustomElement, Grade, GradeProps, GradesParameters, Student } from "@/types";
import { executeLink, getCurrentElement, getIcon } from "@/utils";
import { IonModal, IonAlert } from "@ionic/vue";
import { AxiosInstance } from "axios";
import { inject, ref, Ref, watch } from "vue";
import { Store, useStore } from "vuex";

type availableModal = "grades" | "course_details" | "empty_descriptions" | "grade_value_error";

const setupModalAndOpen = (store : Store<any>) => {
    
    const window : availableModal = store.state.event.name;
    
    switch (window) {
        case "grades":
            grades_title = store.state.event.data.title;
            grades_parameters = store.state.event.data.parameters;
            student_grades = grades[grades_parameters.student_id];
            grades_open.value = true;
            break;
        case "empty_descriptions":
            alert_information.message = getCurrentElement(store,"empty_descriptions");
            alert_open.value = true;
            break;
        case "grade_value_error":
            alert_information.message = getCurrentElement(store,"grade_value_error");
            alert_open.value = true;
            break;
        case "course_details":
            description_title = store.state.event.data.title;
            description_course_id = store.state.event.data.course_id;
            description_open.value = true;
            break;
    }
};
const closeModal = (window : availableModal) => {
    switch (window) {
        case "grades":
            grades_open.value = false
            break;
        case "empty_descriptions":
        case "grade_value_error":
            alert_open.value = false;
            break;
        case "course_details":
            description_open.value = false;
    }
};
const add_grade = async () => {
    executeLink($axios,undefined,
        response => {
            const split_url = store.state.request.url.split("/");
            const split_query = split_url[split_url.length-1].split("?")[1].split("&");
            const final = split_query[split_query.length-2].split("=")[1];
            const student_id = split_url[3];
            const grade = split_query[split_query.length-3].split("=")[1];

            let student_pos : number;

            grades[student_id].push(new Grade(response.data.value));
            if (final == "true") {
                student_pos = table_data.findIndex((a : CustomElement[]) => a[0].id == student_id + "_name_surname");
                console.log(student_pos);
                console.log(table_data[student_pos]);
                table_data[student_pos][table_data[student_pos].length-1].content = grade;
                trigger.value++;
            }
        },err => console.error(err),undefined,undefined,store)
};

const updateStudents = async () => {
    const students : Student[] = await executeLink($axios,"/v1/project_classes/" + course_id + "/" + block_id + "/components?section=" + selected_section.value + "&teacher_id=" + user.id + "&token=" + user.token, //Da sistemare: creare link per pagina per gestire assoc_class e togliere teacher_id
        response => response.data.data.map((a: any) => new Student(a)),
        () => []);
    
    table_data = [];
    for (const student of students) {
        final_grade = undefined;
        grades[student.id] = await executeLink($axios,"/v1/students/" + student.id + "/grades?course_id=" + course_id + "&block_id=" + block_id + "&teacher_id=" + user.id,
            (response: any) => response.data.data.map((a : GradeProps) => {
                const tmp_grade = new Grade(a);
                if (tmp_grade.final) {
                    final_grade = tmp_grade;
                }
                return tmp_grade;
            }),
            () => []);
        table_data.push(student.toTableRow(store,course_id,block_id,user.id,final_grade));
    }
}

const store = useStore();
const $axios : AxiosInstance | undefined = inject("$axios");
const user = store.state.user;

const firstRow : CustomElement[] = [{
    id: "student",
    type: "string",
    content: getCurrentElement(store,"student")
},{
    id: "learning_context",
    type: "string",
    content: getCurrentElement(store,"learning_context")
},{
    id: "class",
    type: "string",
    content: getCurrentElement(store,"class")
},{
    id: "gardes",
    type: "string",
    content: getCurrentElement(store,"grades")
},{
    id: "final_grade",
    type: "string",
    content: getCurrentElement(store,"final_grade")
}];
const column_sizes = [5,2,1,2,2];
const grades_open = ref(false);
const description_open = ref(false);
const divided_path = window.location.pathname.split("/");
const course_id = divided_path[divided_path.length-2];
const block_id = divided_path[divided_path.length-1];
const trigger = ref(0);
const grades : {
    [key: string]: Grade[]
} = {};
const alert_open = ref(false);
const alert_information = {
    title: getCurrentElement(store,"error"),
    message: "",
    buttons: [getCurrentElement(store,"ok")]
};
const sections : {id: string}[] = [];
const tmp_sections : Set<string> = new Set();
const buttons : CustomElement[] = [{
        id: "announcements",
        type: "icon",
        linkType: "request",
        content: {
            url: "/announcements/" + course_id + "/" + block_id,
            method: "get",
            icon: getIcon(store,"mail") // Da sistemare: mettere in alto e fare popup
        }
    },{
        id: "course_details",
        type: "icon",
        linkType: "event",
        content: {
            event: "course_details",
            data: {
                title: "", // Da sistemare: mettere titolo quando ce l'avrà anche la pagina
                course_id: parseInt(course_id),
            },
            icon: getIcon(store,"information_circle")
        }
    }]

let table_data : CustomElement[][] = [];
let selected_section : Ref<string>;
let grades_title : string;
let grades_parameters : GradesParameters;
let final_grade : Grade | undefined;
let student_grades : Grade[] | undefined;
let description_title : string;
let description_course_id : GradesParameters;

if ($axios != undefined) {
    await executeLink($axios,"/v2/teachers/" + user.id + "/my_project_classes?block_id=" + block_id + "&course_id=" + course_id + "&token=" + user.token,
        response => response.data.data.map((a: any) => tmp_sections.add(a.section)));
    await executeLink($axios,"/v2/teachers/" + user.id + "/associated_project_classes?block_id=" + block_id + "&course_id=" + course_id + "&token=" + user.token,
        response => response.data.data.map((a: any) => tmp_sections.add(a.section)));
    for (const section of tmp_sections) {
        sections.push({
            id: section
        })
    }
    selected_section = ref(sections[0].id);
    
    await updateStudents();
    watch(selected_section,async () => {
        await updateStudents();
        trigger.value++;
    });
}
</script>

<style>
ion-modal#grades_manages {
    --width: fit-content;
    --height: fit-content;
}
</style>