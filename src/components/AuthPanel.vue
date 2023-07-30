<template>
  <div class="ion-padding">
    <ion-card>
      <!--<ion-card-header>
        <ion-card-title>{{ getCurrentElement(store,login_type) }}</ion-card-title>
      </ion-card-header>-->
      <ion-card-content>
        <template v-if="login_type == 'student'">
          <ion-item>
            <ion-input
              v-model="user_information['student'].username"
              type="text"
              :label="getCurrentElement(store, 'username')"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              v-model="user_information['student'].password"
              type="password"
              :label="getCurrentElement(store, 'password')"
            ></ion-input>
          </ion-item>
        </template>
        <template v-else-if="login_type == 'teacher'">
          <ion-item>
            <ion-input
              v-model="user_information['teacher'].username"
              type="text"
              :label="getCurrentElement(store, 'username')"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              v-model="user_information['teacher'].password"
              type="password"
              :label="getCurrentElement(store, 'password')"
            ></ion-input>
          </ion-item>
        </template>
        <template v-else-if="login_type == 'admin'">
          <ion-item>
            <ion-input
              v-model="user_information['admin'].username"
              type="text"
              :label="getCurrentElement(store, 'username')"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              v-model="user_information['admin'].password"
              type="password"
              :label="getCurrentElement(store, 'password')"
            ></ion-input>
          </ion-item>
        </template>
        <ion-button
          @click="
            $emit('login', {
              type: login_type,
              parameters: {
                username: user_information[login_type].username,
                password: user_information[login_type].password,
              },
            })
          "
          expand="block"
          class="ion-margin-vertical"
          >{{ getCurrentElement(store, "login") }}</ion-button
        >
        <div style="border-top: 1px solid var(--ion-color-dark)">
            <ion-grid>
            <ion-row>
                <ion-col>
                <ion-button
                    @click="login_type = 'student'"
                    expand="block"
                    color="primary"
                    :fill="login_type == 'student' ? 'solid' : 'outline'"
                >
                    {{ getCurrentElement(store, "student") }}
                </ion-button>
                </ion-col>
                <ion-col>
                <ion-button
                    @click="login_type = 'teacher'"
                    expand="block"
                    color="primary"
                    :fill="login_type == 'teacher' ? 'solid' : 'outline'"
                >
                    {{ getCurrentElement(store, "teacher") }}
                </ion-button>
                </ion-col>
                <ion-col>
                <ion-button
                    @click="login_type = 'admin'"
                    expand="block"
                    color="primary"
                    :fill="login_type == 'admin' ? 'solid' : 'outline'"
                >
                    {{ getCurrentElement(store, "admin") }}
                </ion-button>
                </ion-col>
            </ion-row>
            </ion-grid>
        </div>
      </ion-card-content>
    </ion-card>
  </div>
</template>

<script setup lang="ts">
import { LoginInformation, UserType } from "@/types";
import { getCurrentElement } from "@/utils";
import {
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/vue";
import { key } from "ionicons/icons";
import { Ref, ref } from "vue";
import { useStore } from "vuex";

const store = useStore();
const login_type: Ref<UserType> = ref("student");
const user_information: {
  [key in keyof string as UserType]: {
    [key: string]: string;
  };
} = {
  student: {
    username: "",
    password: "",
  },
  teacher: {
    username: "",
    password: "",
  },
  admin: {
    username: "",
    password: "",
  },
};
</script>

<style>
</style>