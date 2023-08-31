<template>
  <ion-page>
    <outer-header
      :title="
        store.state.menu[user.user][store.state.menuIndex].title[
          language
        ]
      "
    />

    <ion-content :fullscreen="true">
      <inner-header
        :title="
          store.state.menu[user.user][store.state.menuIndex].title[
            language
          ]
        "
      />

      <suspense>
        <template #default>
          <learning-sessions-selection />
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
import { getCurrentLanguage } from "@/utils";
import { IonContent, IonPage } from "@ionic/vue";
import { useStore } from "vuex";

const store = useStore();
const user = User.getLoggedUser() as User;
const language = getCurrentLanguage();
</script>

<style scoped>
</style>
