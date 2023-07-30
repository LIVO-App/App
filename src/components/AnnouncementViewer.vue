<template>
  <ion-header>
    <ion-toolbar>
      <ion-grid>
        <ion-row class="ion-text-center ion-align-items-center">
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
    <div class="ion-padding" style="color: var(--ion-color-primary)">
      <ionic-element :element="content" />
    </div>
  </ion-header>
</template>

<script setup lang="ts">
import { CustomElement, User } from "@/types";
import { executeLink, getIcon } from "@/utils";
import { IonHeader, IonToolbar, IonGrid, IonRow, IonCol } from "@ionic/vue";
import { AxiosInstance } from "axios";
import { inject } from "vue";
import { useStore } from "vuex";

const store = useStore();
const $axios: AxiosInstance | undefined = inject("$axios");
const language = store.state.language;
const user = User.getLoggedUser() as User;

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
});
defineEmits(["signal_event", "close"]);

const elements: {
  [key: string]: CustomElement;
} = {
  close: {
    id: "close",
    type: "icon",
    linkType: "event",
    content: {
      event: "close",
      icon: getIcon(store, "close"),
    },
  },
  title: {
    id: "title",
    type: "title",
    content: props.title,
  },
};

const content: CustomElement = await executeLink(
  $axios,
  "/v1/announcements/" + props.id + "?token=" + user.token,
  (response) => {
    return {
      id: "content",
      type: "html",
      content: response.data.data[`${language}_message`],
    };
  },
  () => {
    return {
      id: "content",
      type: "html",
      content: "",
    };
  }
);
</script>

<style>
</style>