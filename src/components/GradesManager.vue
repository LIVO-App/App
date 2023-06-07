<template>
    <ion-header>
        <ion-toolbar>
            <ion-grid>
                <ion-row class="ion-text-center ion-align-items-center">
                    <ion-col>
                        <ionic-element :element="elements.title"></ionic-element>
                    </ion-col>
                    <ion-col size="auto">
                        <ionic-element :element="elements.close" @signal_event="$emit('close')"></ionic-element>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-toolbar>
    </ion-header>
    <template v-if="tableData.length > 0">
        <ionic-table :data="tableData" :first_row="first_row" :column_sizes="column_sizes"></ionic-table>
        <div class="ion-text-center ion-padding-bottom">
            <ion-text color="primary">{{ getCurrentElement(store,"arithmetic_mean") }}: {{ mean }}</ion-text>
        </div>
    </template>
    <template v-else>
        <div class="ion-text-center ion-padding">
            <ion-text color="primary">{{ getCurrentElement(store,"no_grades") }}</ion-text>
        </div>
    </template>
</template>

<script setup lang="ts">
import { CustomElement, Grade, GradeProps, GradesParameters } from "@/types";
import { executeLink, getCurrentElement, getIcon } from "@/utils";
import { IonContent, IonHeader, IonToolbar, IonGrid, IonRow, IonCol, IonText } from "@ionic/vue";
import { AxiosInstance } from "axios";
import { inject, PropType } from "vue";
import { useStore } from "vuex";

const store = useStore();
const $axios : AxiosInstance | undefined = inject("$axios");

const props = defineProps({
    "title": {
        type: String,
        required: true
    },
    "parameters": {
        type: Object as PropType<GradesParameters>,
        required: true
    }
});
defineEmits(["execute_link","close"]);

const elements : {
    [key: string]: CustomElement
} = {
    "close": {
        id: "close",
        type: "icon",
        linkType: "event",
        content: {
            event: "close",
            icon: getIcon(store,"close")
        }
    },
    "title": {
        id: "title",
        type: "title",
        content: props.title
    }
};
const first_row : CustomElement[] = [{
    id: "description",
    type: "string",
    content: getCurrentElement(store,"description")
},{
    id: "date",
    type: "string",
    content: getCurrentElement(store,"date")
},{
    id: "evaluation",
    type: "string",
    content: getCurrentElement(store,"evaluation")
}];
const column_sizes = [6,3,3];
const tableData : CustomElement[][] = [];
const grades : Grade[] = await executeLink($axios,"/v1/students/" + props.parameters.student_id + "/grades?course_id=" + props.parameters.course_id + "&block_id=" + props.parameters.block_id + (props.parameters.teacher_id != undefined ? "&teacher_id=" + props.parameters.teacher_id : ""),
    response => response.data.data.map((a : GradeProps) => {
        const tmp_grade = new Grade(a);
        tableData.push(tmp_grade.toTableRow(store));
        return tmp_grade;
    }),
    () => []);
const mean = (grades.reduce((p,c) => p + c.grade,0) / grades.length).toFixed(2);
</script>

<style>

</style>