<template>
  <ion-page>
    <outer-header :title="title" />

    <ion-content :fullscreen="true">
      <inner-header :title="title" />

      <suspense>
        <template #default>
          <announcements-component />
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
import { getPageTitle } from "@/utils";
import { IonContent, IonPage } from "@ionic/vue";

const user = User.getLoggedUser() as User;

const title = getPageTitle(user);
//<!-- TODO (8): vedere se si può caricare diversi componenti con uno solo per rimuovere tutte le view con componente singolo
</script>

<style scoped></style>
