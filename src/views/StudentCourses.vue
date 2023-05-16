<template>
  <ion-page>
    <outer-header :subtitle="elements[language].subtitle" /> <!--:title="store.state.menu[store.state.user.user][store.state.menuIndex].title[store.state.language]" />-->

    <ion-content :fullscreen="true">
      <inner-header :subtitle="elements[language].subtitle" /> <!--:title="store.state.menu[store.state.user.user][store.state.menuIndex].title[store.state.language]" />-->

      <suspense>
        <template #default>
          <courses-selection-list />
        </template>
        <template #fallback>
          <loading-component />
        </template>
      </suspense>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { Language } from '@/types';
import { ElementsList } from '@/types';
import { IonContent, IonPage } from '@ionic/vue';
import { useStore } from 'vuex';

const store = useStore();

const language : Language = store.state.language
const elements : ElementsList = store.state.elements;
</script>

<style>

</style>