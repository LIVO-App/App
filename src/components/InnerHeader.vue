<template>
  <ion-header collapse="condense">
    <ion-toolbar class="ion-text-center">
      <ion-title size="large" color="white">{{ props.title }}</ion-title>
      <ion-title size="small" color="white">{{ props.subtitle }}</ion-title>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { IonHeader, IonToolbar, IonTitle } from "@ionic/vue";

const props = defineProps(["title", "subtitle"]);
</script>

<style scoped>
ion-toolbar {
  --background: var(--ion-color-primary);
}
</style>
