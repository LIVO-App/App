<template>
  <ion-page>
    <outer-header :title="title" />

    <ion-content :fullscreen="true">
      <inner-header :title="title" />

      <suspense>
        <template #default>
          <learning-sessions-cards />
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
const title = getCurrentElement(menu.order[user.type][menu.index]);
</script>

<style scoped>
.scroll-items {
  justify-content: flex-start;
  flex-wrap: nowrap;
  overflow-x: scroll !important;
  overflow-y: hidden;
  max-height: 50%;
}
.scroll-items ion-col {
  display: flex;
  flex-wrap: nowrap;
}
</style>
