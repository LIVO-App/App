<template>
  <ion-page>
    <outer-header
      :title="
        store.state.menu[user.user][store.state.menuIndex].title[
          store.state.language
        ]
      "
    />

    <ion-content :fullscreen="true">
      <inner-header
        :title="
          store.state.menu[user.user][store.state.menuIndex].title[
            store.state.language
          ]
        "
      />

      <suspense>
        <template #default>
          <learning-blocks-cards />
        </template>
        <template #fallback>
          <loading-component />
        </template>
      </suspense>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { User } from "@/types";
import { IonContent, IonPage } from "@ionic/vue";
import { useStore } from "vuex";

const store = useStore();
const user = User.getLoggedUser() as User;
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
