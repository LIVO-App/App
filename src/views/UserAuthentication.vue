<template>
  <ion-page>
    <ion-alert
      :is-open="alert_open"
      :header="alert_information.title"
      :message="alert_information.message"
      :buttons="alert_information.buttons"
      @didDismiss="closeAlert"
    ></ion-alert>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ getCurrentElement(store,"auth") }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
        <auth-panel @login="login" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { executeLink, getCurrentElement } from "@/utils";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonAlert } from "@ionic/vue";
import { useStore } from "vuex";
import { LoginInformation, User } from "@/types";
import { ref } from "vue";
import { useRouter } from "vue-router";

const login = async (payload: LoginInformation) => {

    const session = window.sessionStorage;

    const login_parameters = {};

    let redirect = "/";
    let tmp_index = 0;

    try {
        checkParameters(payload,login_parameters);
        if (!alert_open.value) {
            switch (payload.type) {
                case "student":
                    redirect += "learning_sessions";
                    tmp_index = 0;
                    break;
                case "teacher":
                    redirect += "project_courses";
                    tmp_index = 0;
                    break;
                case "admin":
                    redirect += "project_courses";
                    tmp_index = 0;
                    break;
            }
            await executeLink("/v1/auth/" + payload.type + "_login",
            async (response) => {

                const tmp_user: {
                    [key: string]: string
                } = {
                    id: response.data.id,
                    token: response.data.token,
                    username: payload.parameters.username,
                    user: payload.type
                };

                for (const key of User.getProperties()) {
                    session.setItem(key,tmp_user[key]);
                }
                await store.dispatch("signalLogin");
                store.state.menuIndex = tmp_index;
                $router.push(redirect);
            },() => {
                alert_information.message = getCurrentElement(store,"wrong_username_or_password");
                alert_open.value = true;
                
            },"post",login_parameters);
        }
    } catch (error) {
        alert_information.message = getCurrentElement(store,"server_error");
        alert_open.value = true;
    }
};
const closeAlert = () => alert_open.value = false;
const checkParameters = (payload: LoginInformation, login_parameters: {[key: string]: string}) => {
    switch (payload.type) {
        case "student":
        case "teacher":
        case "admin":
            if (payload.parameters.username == undefined || payload.parameters.username == "") {
                alert_information.message = getCurrentElement(store,"no_username");
                alert_open.value = true;
            } else if (payload.parameters.password == undefined || payload.parameters.password == "") {
                alert_information.message = getCurrentElement(store,"no_password");
                alert_open.value = true;
            } else {
                login_parameters.username = payload.parameters.username;
                login_parameters.password = payload.parameters.password;
            }
            break;
    }
};

const store = useStore();
const $router = useRouter();

const alert_open = ref(false);
const alert_information = {
  title: getCurrentElement(store, "error"),
  message: "",
  buttons: [getCurrentElement(store, "ok")],
};
</script>

<style>
</style>