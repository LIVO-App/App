<template>
  <div class="ion-padding-horizontal">
    <ion-grid>
      <ion-row>
        <ion-col size="auto">
          <ion-icon
            @click="$router.go(-1)"
            aria-hidden="true"
            class="ion-padding-end"
            :ios="getIcon(store, 'arrow_back').ios"
            :md="getIcon(store, 'arrow_back').md"
          ></ion-icon>
          <!-- Da sistemare: freccetta -->
        </ion-col>
        <ion-col>
          <ion-title>{{ student_card.title }}</ion-title>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          <ion-img
            :src="image"
            alt="Student image"
            style="height: 70%"
          ></ion-img>
          <!-- Da sistemare: altezza foto variabile -->
        </ion-col>
        <ion-col>
          <ion-list>
            <ion-item v-for="element in student_card.content" :key="element.id">
              <ionic-element :element="element" />
            </ion-item>
          </ion-list>
        </ion-col>
      </ion-row>
    </ion-grid>
  </div>
</template>

<script lang="ts" setup>
import { GeneralCardElements, StudentInformation, User } from "@/types";
import { executeLink, getIcon } from "@/utils";
import {
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonIcon,
  IonImg,
  IonTitle,
} from "@ionic/vue";
import { AxiosInstance } from "axios";
import { computed, inject } from "vue";
import { useStore } from "vuex";

const store = useStore();
const $axios: AxiosInstance | undefined = inject("$axios");
const user = User.getLoggedUser() as User;
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const image = computed(() => require("../assets/person.png"));

const student: StudentInformation = await executeLink(
  $axios,
  "/v1/students/" + props.id + "?token=" + user.token,
  (response) => new StudentInformation(response.data.data)
);
const student_card: GeneralCardElements = student.toCard(store);
</script>

<style>
</style>