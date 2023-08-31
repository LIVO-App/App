<template>
  <div class="ion-padding">
    <ion-card>
      <!--<ion-card-header>
        <ion-card-title>{{ getCurrentElement(login_type) }}</ion-card-title>
      </ion-card-header>-->
      <ion-card-content>
        <template v-if="login_type == 'student'">
          <ion-item>
            <ion-input
              v-model="user_information['student'].username"
              type="text"
              :label="getCurrentElement('username')"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              v-model="user_information['student'].password"
              type="password"
              :label="getCurrentElement('password')"
            ></ion-input>
          </ion-item>
        </template>
        <template v-else-if="login_type == 'teacher'">
          <ion-item>
            <ion-input
              v-model="user_information['teacher'].username"
              type="text"
              :label="getCurrentElement('username')"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              v-model="user_information['teacher'].password"
              type="password"
              :label="getCurrentElement('password')"
            ></ion-input>
          </ion-item>
        </template>
        <template v-else-if="login_type == 'admin'">
          <ion-item>
            <ion-input
              v-model="user_information['admin'].username"
              type="text"
              :label="getCurrentElement('username')"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              v-model="user_information['admin'].password"
              type="password"
              :label="getCurrentElement('password')"
            ></ion-input>
          </ion-item>
        </template>
        <ion-button
          @click=";
            $emit('login', {
              type: login_type,
              parameters: {
                username: user_information[login_type].username,
                password: user_information[login_type].password,
              },
            });
            for (const key in user_information[login_type]) {
              user_information[login_type][key] = '';
            }
          "
          expand="block"
          class="ion-margin-vertical"
          >{{ getCurrentElement("login") }}</ion-button
        >
        <!-- Da sistemare: google login -->
        <div style="border-top: 1px solid var(--ion-color-dark)">
            <ion-grid>
            <ion-row>
                <ion-col>
                <ion-button
                    @click="changeType('student')"
                    expand="block"
                    color="primary"
                    :fill="login_type == 'student' ? 'solid' : 'outline'"
                >
                    {{ getCurrentElement("student") }}
                </ion-button>
                </ion-col>
                <ion-col>
                <ion-button
                    @click="changeType('teacher')"
                    expand="block"
                    color="primary"
                    :fill="login_type == 'teacher' ? 'solid' : 'outline'"
                >
                    {{ getCurrentElement("teacher") }}
                </ion-button>
                </ion-col>
                <ion-col>
                <ion-button
                    @click="changeType('admin')"
                    expand="block"
                    color="primary"
                    :fill="login_type == 'admin' ? 'solid' : 'outline'"
                >
                    {{ getCurrentElement("admin") }}
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
import { UserType } from "@/types";
import { getCurrentElement } from "@/utils";
import {
  IonCard,
  //IonCardHeader,
  IonCardContent,
  //IonCardTitle,
  IonItem,
  IonInput,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/vue";
import { Ref, ref } from "vue";

const changeType = (type: UserType) => {
  for (const key in user_information[login_type.value]) {
    if (user_information[type] != undefined) {
      user_information[type][key] = user_information[login_type.value][key];
    }
    user_information[login_type.value][key] = "";
  }
  login_type.value = type;
}

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