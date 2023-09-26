<template>
  <ion-page>
    <ion-alert
      :is-open="alert_open"
      :header="alert_information.title"
      :message="alert_information.message"
      :buttons="alert_information.buttons"
      @didDismiss="closeAlert"
    ></ion-alert>
    <outer-header :title="getCurrentElement('auth')" />
    <ion-content :fullscreen="true">
      <inner-header :title="getCurrentElement('auth')" />

      <auth-panel @login="login" @execute_link="googleAuth()" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { executeLink, getCurrentElement } from "@/utils";
import {
  IonPage,
  IonContent,
  IonAlert,
} from "@ionic/vue";
import { useStore } from "vuex";
import { LoginInformation, Menu, User } from "@/types";
import { ref } from "vue";
import { useRouter } from "vue-router";

const login = async (payload: LoginInformation) => {
  const session = window.sessionStorage;

  const login_parameters = {};
  const menu: Menu = store.state.menu;

  let redirect = "/";
  let tmp_index = 0;

  try {
    checkParameters(payload, login_parameters);
    if (!alert_open.value) {
      redirect = menu.default_item[payload.type];
      
      tmp_index = menu.order[payload.type].findIndex(
        (a) => a == redirect
      );
      await executeLink(
        "/v1/auth/" + payload.type + "_login",
        async (response) => {
          const tmp_user = new User({
            id: response.data.id,
            token: response.data.token,
            username: payload.parameters.username,
            user: payload.type,
          });

          for (const key of User.getProperties()) { // Da sistemare: non è il massimo metterlo in 2 posti
            session.setItem(key, tmp_user[key]); // Necessario per la persistenza
          }
          await store.dispatch("login", tmp_user); // Necessario per la reattività (in caso puntare su questo, ma persistente)
          store.state.menuIndex = tmp_index;
          $router.push({ name: redirect });
        },
        () => {
          alert_information.message = getCurrentElement(
            "wrong_username_or_password"
          );
          alert_open.value = true;
        },
        "post",
        login_parameters
      );
    }
  } catch (error) {
    alert_information.message = getCurrentElement("server_error");
    alert_open.value = true;
  }
};
const closeAlert = () => (alert_open.value = false);
const checkParameters = (
  payload: LoginInformation,
  login_parameters: { [key: string]: string }
) => {
  switch (payload.type) {
    case "student":
    case "teacher":
    case "admin":
      if (
        payload.parameters.username == undefined ||
        payload.parameters.username == ""
      ) {
        alert_information.message = getCurrentElement("no_username");
        alert_open.value = true;
      } else if (
        payload.parameters.password == undefined ||
        payload.parameters.password == ""
      ) {
        alert_information.message = getCurrentElement("no_password");
        alert_open.value = true;
      } else {
        login_parameters.username = payload.parameters.username;
        login_parameters.password = payload.parameters.password;
      }
      break;
  }
};
const googleAuth = () => {
  console.log("Ciao",store.state.request.url);
  $router.push(store.state.request.url);
};

const store = useStore();
const $router = useRouter();

const alert_open = ref(false);
const alert_information = {
  title: getCurrentElement("error"),
  message: "",
  buttons: [getCurrentElement("ok")],
};
</script>

<style>
</style>