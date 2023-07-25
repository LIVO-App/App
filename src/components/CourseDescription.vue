\<template>
    <ion-header>
        <ion-toolbar>
            <ion-grid>
                <ion-row class="ion-text-center ion-align-items-center"> <!-- Da sistemare: mettere select per far vedere progect_class se si ha anche il block_id -->
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
    <template v-if="course != undefined">
        <ion-content>
            <div class="ion-padding">
                <ionic-element v-for="element in courseCard.content" :key="element.id" :element="element"></ionic-element>
            </div>
        </ion-content>
    </template>
    <template v-else>
        <ionic-element :element="elements.course_information_not_found"></ionic-element>
    </template>
</template>

<script setup lang="ts">
import { Course, CustomElement, GeneralCardElements } from "@/types";
import { executeLink, getCurrentElement, getIcon } from "@/utils";
import { IonContent, IonHeader, IonToolbar, IonGrid, IonRow, IonCol } from "@ionic/vue";
import { AxiosInstance } from "axios";
import { inject } from "vue";
import { useStore } from "vuex";

const store = useStore();
const $axios : AxiosInstance | undefined = inject("$axios");

const props = defineProps({
    "title": {
        type: String,
        required: true
    },
    "course_id": {
        type: Number,
        required: true
    }
});
defineEmits(["close"]);

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
    },
    "course_information_not_found": {
        id: "course_information_not_found",
        type: "string",
        content: getCurrentElement(store,"course_information_not_found")
    }
};
const course : Course | null = await executeLink($axios,"/v1/courses/" + props.course_id,
    response => new Course(store,response.data.data),
    () => null);

let courseCard : GeneralCardElements;

if (course != null) {
    courseCard = course.toCard(store)
}
</script>

<style>

</style>