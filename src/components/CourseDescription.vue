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
        <swiper
          v-if="course.images.length > 1"
          :modules="modules"
          :slides-per-view="1"
          navigation
          :autoplay="{
            delay: 4000,
            disableOnInteraction: false,
          }"
        >
          <swiper-slide v-for="(image, index) in course.images" :key="index">
            <ion-img
              :src="require('@/assets/' + image.url)"
              :alt="image.caption"
              style="height: 150px"
            />
          </swiper-slide>
        </swiper>
        <ion-img
          v-if="course.images.length == 1"
          :src="require('@/assets/' + course.images[0].url)"
          :alt="course.images[0].caption"
          style="height: 150px"
        />
        <ionic-element
          v-for="element in courseCard.content"
          :key="element.id"
          :element="element"
        />
        <b><ionic-element
          :element="
            getCustomMessage('open_to', getCurrentElement('open_to') + ':')
          "
        /></b>
        <list-card
          :emptiness_message="
            getCustomMessage(
              'emptiness_message',
              getCurrentElement('course_for_noone')
            )
          "
          :cards_list="access_cards"
          :colors="{
            background: {
              name: 'white',
              type: 'var',
            },
            dividers: {
              name: 'white',
              type: 'var',
            },
          }"
          :classes="{
            card: {
              no_card_border: true,
              'ion-no-margin': true,
            },
            content: {
              'ion-no-padding': true,
            },
          }"
        />
      </template>
      <template v-else>
        <ionic-element :element="elements.course_information_not_found" />
      </template>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { Course, CustomElement, GeneralCardElements } from "@/types";
import {
  executeLink,
  getCurrentElement,
  getCustomMessage,
  getIcon,
} from "@/utils";
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
} from "@ionic/vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { Navigation, Autoplay } from "swiper/modules";
import { computed, ref } from "vue";

const modules = [Navigation, Autoplay];
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  course_id: {
    type: Number,
    required: true,
  },
  learning_block_id: Number,
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

const course = await Course.newCourse(
  await executeLink(
    "/v1/courses/" + props.course_id,
    (response) => response.data.data,
    () => null
  )
);
course.images.push(
  {
    url: "Logo_LIVO_Path.png",
    caption: "New logo",
  },
  {
    url: "Logo_LIVO_Campus_POS_RGB.png",
    caption: "Old logo",
  },
  {
    url: "person.png",
    caption: "Default person",
  }
);
const access_cards = course.getCustomAccessList();

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