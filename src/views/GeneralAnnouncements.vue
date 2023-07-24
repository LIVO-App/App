<template>
  <ion-page>
    <outer-header :title="store.state.menu[store.state.user.user][store.state.menuIndex].title[store.state.language]" />

    <ion-content :fullscreen="true">
      <inner-header :title="store.state.menu[store.state.user.user][store.state.menuIndex].title[store.state.language]" />

      <suspense>
        <template #default>
          <announcements-selection-list />
        </template>
        <template #fallback>
          <loading-component />
        </template>
      </suspense>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { useStore } from 'vuex';

const store = useStore();
</script>

<style scoped>

</style>
