<template>
  <ion-header :translucent="true">
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-menu-button color="white"></ion-menu-button>
      </ion-buttons>
      <ion-title size="large" class="ion-text-center" color="white">{{
        props.title
      }}</ion-title>
      <ion-title size="small" class="ion-text-center" color="white">{{
        props.subtitle
      }}</ion-title>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
} from "@ionic/vue";

const props = defineProps(["title", "subtitle"]);
</script>

<style scoped>
ion-toolbar {
  --background: var(--ion-color-primary);
}
</style>
