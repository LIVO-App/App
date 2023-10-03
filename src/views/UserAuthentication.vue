<template>
  <ion-page>
    <ion-alert
      :is-open="alert_open"
      :header="alert_information.title"
      :message="alert_information.message"
      :buttons="alert_information.buttons"
      @didDismiss="closeAlert"
    />
    <outer-header :title="getCurrentElement('auth')" />
    <ion-content :fullscreen="true">
      <inner-header :title="getCurrentElement('auth')" />

      <auth-panel @login="login" @execute_link="googleAuth()" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  executeLink,
  getCurrentElement,
  getDefautlLink,
  setUser,
} from "@/utils";
import { IonPage, IonContent, IonAlert } from "@ionic/vue";
import { useStore } from "vuex";
import { LoginInformation, User } from "@/types";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const login = async (payload: LoginInformation) => {
  const login_parameters = {};

  let default_link = {
    name: "/",
    index: 0,
  };

  try {
    checkParameters(payload, login_parameters);
    if (!alert_open.value) {
      default_link = getDefautlLink(payload.type);
      await executeLink(
        "/v1/auth/" + payload.type + "_login",
        async (response) => {
          await setUser(
            new User({
              id: response.data.id,
              token: response.data.token,
              username: payload.parameters.username,
              user: payload.type,
              expirationDate: response.data.expirationDate,
            }),
            default_link
          );

          $router.push({ name: default_link.name });
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
  $router.push(store.state.request.url);
};

const store = useStore();
const $router = useRouter();
const $route = useRoute();

const alert_open = ref(false);
const alert_information = {
  title: getCurrentElement("error"),
  message: "",
  buttons: [getCurrentElement("ok")],
};

if ($route.redirectedFrom?.name == "google_redirect") {
  alert_information.message = getCurrentElement("user_not_valid");
  setTimeout(() => {
    alert_open.value = true;
  },100);
}
</script>

<style>
</style>