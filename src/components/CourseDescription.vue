<template>
  <ion-header>
    <ion-toolbar>
      <ion-grid>
        <ion-row class="ion-text-center ion-align-items-center">
          <!-- Da sistemare: mettere select per far vedere progect_class se si ha anche il session_id -->
          <ion-col>
            <ionic-element :element="elements.title" />
          </ion-col>
          <ion-col size="auto">
            <ionic-element
              :element="elements.close"
              @signal_event="$emit('close')"
            />
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <div class="ion-padding">
      <template v-if="course != undefined">
        <ionic-element
          v-for="element in courseCard.content"
          :key="element.id"
          :element="element"
        ></ionic-element>
      </template>
      <template v-else>
        <ionic-element
          :element="elements.course_information_not_found"
        ></ionic-element>
      </template>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { Course, CustomElement, GeneralCardElements } from "@/types";
import { executeLink, getCurrentElement, getIcon } from "@/utils";
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/vue";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  course_id: {
    type: Number,
    required: true,
  },
});
defineEmits(["close"]);

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
  title: {
    id: "title",
    type: "title",
    content: props.title,
  },
  course_information_not_found: {
    id: "course_information_not_found",
    type: "string",
    content: getCurrentElement("course_information_not_found"),
  },
};

const course = await executeLink(
  "/v1/courses/" + props.course_id,
  (response) => new Course(response.data.data),
  () => null
);
let courseCard: GeneralCardElements;

if (course != null) {
  courseCard = course.toCard();
}
</script>

<style scoped>
.block {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>