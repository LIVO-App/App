<template>
  <ion-page>
    <outer-header :title="title" />

    <ion-content :fullscreen="true">
      <inner-header :title="title" />

      <!-- ! (2): finire e mettere export studenti in pagina singola -->
      <suspense>
        <template #default>
          <project-classes-list />
          <!-- TODO (5): cambiare nome componente -->
        </template>
        <template #fallback>
          <loading-component />
        </template>
      </suspense>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { Menu, User } from "@/types";
import { getCurrentElement } from "@/utils";
import { IonContent, IonPage } from "@ionic/vue";
import { useStore } from "vuex";

const store = useStore();
const user = User.getLoggedUser() as User;
const menu: Menu = store.state.menu;
const title = getCurrentElement(menu.order[user.user][menu.index]);
</script>

<style scoped></style>
