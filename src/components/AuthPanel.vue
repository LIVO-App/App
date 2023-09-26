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
              v-model="params.username"
              type="text"
              :label="getCurrentElement('username')"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              v-model="params.password"
              type="password"
              :label="getCurrentElement('password')"
            ></ion-input>
          </ion-item>
        </template>
        <template v-else-if="login_type == 'teacher'">
          <ion-item>
            <ion-input
              v-model="params.username"
              type="text"
              :label="getCurrentElement('username')"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              v-model="params.password"
              type="password"
              :label="getCurrentElement('password')"
            ></ion-input>
          </ion-item>
        </template>
        <template v-else-if="login_type == 'admin'">
          <ion-item>
            <ion-input
              v-model="params.username"
              type="text"
              :label="getCurrentElement('username')"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              v-model="params.password"
              type="password"
              :label="getCurrentElement('password')"
            ></ion-input>
          </ion-item>
        </template>
        <ion-button
          @click="
            takeParameters();
            $emit('login', {
              type: login_type,
              parameters: actual_params,
            });
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
        <div class="divider">
          <ionic-element :element="or" />
        </div>
        <ion-grid class="ion-text-center">
          <ion-row>
            <ion-col>
              <ionic-element
                :element="
                  getCustomMessage(
                    'login_with_account',
                    getCurrentElement('login_with_account'),
                    'title'
                  )
                "
              />
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col></ion-col>
            <ion-col size="3">
              <!--<g-signin-button :params="googleSignInParams" @signin-success="handleSignInSuccess" @signin-failure="handleSignInFailure"></g-signin-button>-->
              <ionic-element
                :element="alternatives_login[0]"
                @execute_link="$emit('execute_link')"
              />
            </ion-col>
            <ion-col></ion-col>
          </ion-row>
        </ion-grid>
      </ion-card-content>
    </ion-card>
  </div>
</template>

<script setup lang="ts">
import { store } from "@/store";
import { CustomElement, GeneralCardElements, TmpList, UserType } from "@/types";
import { executeLink, getCurrentElement, getCustomMessage, getIcon } from "@/utils";
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
import { reactive, Ref, ref } from "vue";

const changeType = (type: UserType) => {
  /*for (const key in user_information[login_type.value]) {
    if (user_information[type] != undefined) {
      user_information[type][key] = user_information[login_type.value][key];
    }
    user_information[login_type.value][key] = "";
  }*/
  login_type.value = type;
};
const takeParameters = () => {
  for (const info of user_information[login_type.value]) {
    actual_params[info] = params[info];
  }
  for (const key of Object.keys(params)) {
    params[key] = "";
  }
};
const handleSignInSuccess = (googleUser: any) => {
  console.log("handleSignInSuccess");
  console.log(googleUser);
  console.log(googleUser.getBasicProfile());
  console.log(googleUser.getAuthResponse());
  executeLink("/auth/google",response => console.log(response),err => console.log(err));
};
const handleSignInFailure = () => {
  console.log("handleSignInFailure");
}

defineEmits(["login", "execute_link"]);

const login_type: Ref<UserType> = ref("student");
const user_information: {
  [key in keyof string as UserType]: string[];
} = {
  student: ["username", "password"],
  teacher: ["username", "password"],
  admin: ["username", "password"],
};
const params: TmpList<any> = reactive({
  username: "",
  password: "",
});
const actual_params: TmpList<any> = {};
const alternatives_login: CustomElement[] = [
  {
    id: "google",
    type: "string_icon",
    linkType: "request",
    content: {
      icon: getIcon("google"),
      text: getCurrentElement("google"),
      order: true,
      whole_link: true,
      url: "/auth/google",
      method: "get",
    },
    colors: {
      text: {
        name: "white",
        type: "var",
      },
      background: {
        name: "primary",
        type: "var",
      },
    },
    classes: {
      button: {
        radius: true,
      },
    },
  },
];
const or = getCustomMessage("or", getCurrentElement("or"), "title");
const googleSignInParams = {
  client_id: '127723279075-he742l7e8jj75vir1839a8qone3totqu.apps.googleusercontent.com'
};
or.colors = {
  background: {
    name: "white",
    type: "var",
  },
};
or.classes = {
  label: {
    "divider-title": true,
  },
};
</script>

<style>
.divider {
  border-top: 1px solid var(--ion-color-black);
  display: block;
  line-height: 1px;
  margin: 15px 0 26px 0;
  position: relative;
  text-align: center;
}

.divider-title {
  padding: 0 20px;
}
</style>